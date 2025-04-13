
import { SummarizeRequest, SummarizeResponse } from '../../lib/types';
import { OPENAI_MODEL } from '../../lib/config';

export async function POST(request: Request) {
  try {
    // Extract the API key from the Authorization header
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    const { emailContent, options = {} } = await request.json() as SummarizeRequest;

    if (!emailContent) {
      return new Response(
        JSON.stringify({ error: 'Email content is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
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
      const errorData = await response.json();
      return new Response(
        JSON.stringify({ 
          error: errorData.error?.message || 'Failed to summarize email' 
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
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

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in summarize API:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
