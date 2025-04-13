
import { SummarizeRequest, SummarizeResponse } from '../../lib/types';
import { OPENAI_MODEL } from '../../lib/config';

// Define our own request and response types instead of using Next.js types
interface VercelRequest {
  method: string;
  body: any;
  headers: {
    [key: string]: string | string[] | undefined;
  };
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  end: () => void;
  setHeader: (name: string, value: string) => VercelResponse;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OpenAI API key is missing");
      return res.status(500).json({ error: 'OpenAI API key not configured on server' });
    }

    // Parse the request body
    const { emailContent, options = {} } = req.body as SummarizeRequest;

    if (!emailContent) {
      return res.status(400).json({ error: 'Email content is required' });
    }

    // Construct the prompt based on options
    const length = options.length || 'medium';
    const focus = options.focus || 'general';

    // Create the system prompt based on options
    let systemPrompt = `You are an AI email summarizer. Summarize the following email content`;
    
    // Adjust for length
    if (length === 'short') {
      systemPrompt += ' in 1-2 sentences';
    } else if (length === 'medium') {
      systemPrompt += ' in 3-4 sentences';
    } else if (length === 'long') {
      systemPrompt += ' with more detail';
    }
    
    // Adjust for focus
    if (focus === 'action-items') {
      systemPrompt += ' with a focus on action items required. Include a list of action items at the end.';
    } else if (focus === 'key-points') {
      systemPrompt += ' with a focus on key points. Include a list of key points at the end.';
    } else {
      systemPrompt += ' with a general focus.';
    }

    console.log("Calling OpenAI API with email content length:", emailContent.length);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: emailContent }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      
      let errorMessage = 'Failed to summarize email';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      
      return res.status(response.status).json({ 
        error: errorMessage
      });
    }

    const data = await response.json();
    console.log("OpenAI API responded successfully");
    
    // Extract the summary from the OpenAI response
    const summary = data.choices[0].message.content;
    
    // Process and extract action items or key points if requested
    let result: SummarizeResponse = { summary };
    
    if (focus === 'action-items') {
      // Extract action items by looking for lists or sections marked as action items
      const actionItemsRegex = /(?:action items:|actions:|to-do:|todo:)([\s\S]+?)(?=\n\n|\n\w+:|\n*$)/i;
      const match = summary.match(actionItemsRegex);
      
      if (match && match[1]) {
        // Extract bullet points or numbered items
        const items = match[1]
          .split(/\n[-•*]\s*|\n\d+\.\s*/)
          .filter(item => item.trim().length > 0)
          .map(item => item.trim());
          
        if (items.length > 0) {
          result.actionItems = items;
        }
      }
    } else if (focus === 'key-points') {
      // Extract key points by looking for lists or sections marked as key points
      const keyPointsRegex = /(?:key points:|main points:|highlights:|important points:)([\s\S]+?)(?=\n\n|\n\w+:|\n*$)/i;
      const match = summary.match(keyPointsRegex);
      
      if (match && match[1]) {
        // Extract bullet points or numbered items
        const items = match[1]
          .split(/\n[-•*]\s*|\n\d+\.\s*/)
          .filter(item => item.trim().length > 0)
          .map(item => item.trim());
          
        if (items.length > 0) {
          result.keyPoints = items;
        }
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in summarize API:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    });
  }
}
