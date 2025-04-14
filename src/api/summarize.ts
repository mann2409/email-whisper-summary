
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
    }
    
    // Check if messages exist (for OpenAI format)
    if (body.messages) {
      console.log("Messages array exists with length:", body.messages.length);
      body.messages.forEach((msg: any, idx: number) => {
        console.log(`Message ${idx} role:`, msg.role);
        console.log(`Message ${idx} content length:`, msg.content?.length || 0);
      });
    } else {
      console.log("No messages array in request body");
    }
    
    // Check if we're in production with a direct OpenAI call
    if (process.env.NODE_ENV === 'production') {
      // Validate that we have email content
      if (!body.emailContent && (!body.messages || !body.messages.length)) {
        console.error("Missing email content in request");
        return { error: "Email content is required" };
      }
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
    const apiRequest = process.env.NODE_ENV === 'production' ? {
      model: body.model || 'gpt-4o-mini',
      messages: body.messages || [],
      temperature: body.temperature || 0.3,
      max_tokens: body.max_tokens || 500
    } : null;

    const requestBody = process.env.NODE_ENV === 'production' ? apiRequest : body;
    
    // Log the actual request body being sent, with sensitive data redacted
    console.log("Sending request to API with body structure:", 
      requestBody ? Object.keys(requestBody) : "No request body");
    
    if (requestBody && requestBody.messages) {
      console.log("Messages count:", requestBody.messages.length);
      for (let i = 0; i < requestBody.messages.length; i++) {
        console.log(`Message ${i} role:`, requestBody.messages[i].role);
        console.log(`Message ${i} content first 50 chars:`, 
          requestBody.messages[i].content?.substring(0, 50) + '...' || 'No content');
        console.log(`Message ${i} content length:`, 
          requestBody.messages[i].content?.length || 0);
      }
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
    return data;
  } catch (error) {
    console.error('Error forwarding to API:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to connect to API endpoint'
    };
  }
}
