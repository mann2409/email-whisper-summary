
// This file connects the frontend to the serverless API function

export default async function handler(req: any) {
  // For Vite deployed apps, we'll use a direct API URL
  // The API_ENDPOINT from config is already set to "/api/summarize"
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api.openai.com/v1/chat/completions'  // In production, call OpenAI directly
    : '/api/summarize';  // In development, use the API route
  
  try {
    console.log("Making direct request to API:", apiUrl);
    console.log("Request method:", req.method);
    console.log("Request headers:", req.headers ? Object.keys(req.headers) : "No headers");
    
    // Get the request body
    const body = req.body || {};
    console.log("Request body structure:", Object.keys(body));
    
    // Log the email content if it exists
    if (body.emailContent) {
      console.log("Email content first 100 chars:", 
        typeof body.emailContent === 'string' 
          ? body.emailContent.substring(0, 100) + '...' 
          : 'Not a string');
      console.log("Email content length:", 
        typeof body.emailContent === 'string' ? body.emailContent.length : 'N/A');
    } else {
      console.error("Missing emailContent in body");
      return { error: "Email content is required" };
    }
    
    // Validate the email content
    if (!body.emailContent || body.emailContent.trim() === '') {
      console.error("Email content is empty or whitespace only");
      return { error: "Email content is required" };
    }
    
    // For production, we'll need the API key
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (process.env.NODE_ENV === 'production') {
      // Try both environment variables
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY;
      console.log("API Key exists:", !!apiKey);
      
      if (!apiKey) {
        throw new Error("OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable in Vercel.");
      }
      
      headers = {
        ...headers,
        'Authorization': `Bearer ${apiKey}`
      };
    }
    
    // Create a proper apiRequest for OpenAI format if in production
    let requestBody;
    
    if (process.env.NODE_ENV === 'production') {
      // Format request for OpenAI API
      const options = body.options || {};
      
      const systemPrompt = `You are an AI email summarizer. Summarize the following email content ${
        options.length === 'short' ? 'in 1-2 sentences' : 
        options.length === 'medium' ? 'in 3-4 sentences' : 
        'with more detail'
      }. ${
        options.focus === 'action-items' ? 'Focus on action items required. Include a list of action items at the end.' : 
        options.focus === 'key-points' ? 'Focus on key points. Include a list of key points at the end.' : 
        'Provide a general focus.'
      }`;
      
      requestBody = {
        model: body.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: body.emailContent.trim() }
        ],
        temperature: body.temperature || 0.3,
        max_tokens: body.max_tokens || 500
      };
      
      console.log("Formatted OpenAI request with system prompt:", systemPrompt);
    } else {
      // Use body as is for dev environment
      requestBody = body;
    }
    
    // Log the actual request body being sent
    console.log("Sending request to API with body structure:", 
      requestBody ? Object.keys(requestBody) : "No request body");
    
    if (process.env.NODE_ENV === 'production' && requestBody.messages) {
      console.log("Messages count:", requestBody.messages.length);
      console.log("System prompt:", requestBody.messages[0].content);
      console.log("User content length:", requestBody.messages[1].content.length);
      console.log("User content first 100 chars:", 
        requestBody.messages[1].content.substring(0, 100) + '...');
    }
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });
    
    console.log("API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      
      let errorMessage = "Failed to summarize email";
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If the response is not valid JSON, use the text as the error message
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // For production, format OpenAI response
    if (process.env.NODE_ENV === 'production') {
      if (!data.choices || data.choices.length === 0) {
        throw new Error("Invalid response format from OpenAI API");
      }
      
      const summary = data.choices[0].message.content;
      
      // Format the response in the expected structure
      return {
        summary,
        // Additional extracting of action items or key points could be done here
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error forwarding to API:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to connect to API endpoint'
    };
  }
}
