
// This file connects the frontend to the serverless API function

export default async function handler(req: any) {
  // For Vite deployed apps, we'll use a direct API URL
  // The API_ENDPOINT from config is already set to "/api/summarize"
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api.openai.com/v1/chat/completions'  // In production, call OpenAI directly
    : '/api/summarize';  // In development, use the API route
  
  try {
    console.log("Making direct request to API:", apiUrl);
    
    // Get the request body
    const body = req.body || {};
    
    // For production, we'll need the API key
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (process.env.NODE_ENV === 'production') {
      // In production, add the OpenAI API key header
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
      console.log("API Key exists:", !!apiKey);
      console.log("API Key length:", apiKey?.length);
      
      headers = {
        ...headers,
        'Authorization': `Bearer ${apiKey}`
      };
    }
    
    // Create a proper apiRequest for OpenAI format if in production
    const apiRequest = process.env.NODE_ENV === 'production' ? {
      model: body.model || 'gpt-4o-mini',
      messages: body.messages || [],
      temperature: body.temperature || 0.3,
      max_tokens: body.max_tokens || 500
    } : null;
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(process.env.NODE_ENV === 'production' ? apiRequest : body),
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
    return data;
  } catch (error) {
    console.error('Error forwarding to API:', error);
    return {
      error: 'Failed to connect to API endpoint'
    };
  }
}
