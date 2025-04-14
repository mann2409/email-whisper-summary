
import { SummarizeRequest, SummarizeResponse } from "./types";
import { API_ENDPOINT, OPENAI_MODEL } from "./config";

export async function summarizeEmail(
  request: SummarizeRequest
): Promise<SummarizeResponse> {
  try {
    console.log("Making API request to:", API_ENDPOINT);
    console.log("Email content:", request.emailContent ? request.emailContent.substring(0, 100) + '...' : 'NULL');
    console.log("Email content length:", request.emailContent?.length);
    console.log("Request object keys:", Object.keys(request));
    console.log("Request options:", request.options);
    
    // Validate email content
    if (!request.emailContent || request.emailContent.trim() === '') {
      console.error("Email content validation failed: empty or missing");
      throw new Error("Email content is required");
    }
    
    // Check for API key in production
    if (process.env.NODE_ENV === 'production') {
      // Try both environment variables
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable in Vercel.");
      }
    }
    
    // Prepare the request for OpenAI
    const apiRequest = process.env.NODE_ENV === 'production' ? {
      model: OPENAI_MODEL,
      messages: [
        { 
          role: 'system', 
          content: `You are an AI email summarizer. Summarize the following email content ${
            request.options?.length === 'short' ? 'in 1-2 sentences' : 
            request.options?.length === 'medium' ? 'in 3-4 sentences' : 
            'with more detail'
          }. ${
            request.options?.focus === 'action-items' ? 'Focus on action items required. Include a list of action items at the end.' : 
            request.options?.focus === 'key-points' ? 'Focus on key points. Include a list of key points at the end.' : 
            'Provide a general focus.'
          }`
        },
        { role: 'user', content: request.emailContent }
      ],
      temperature: 0.3,
      max_tokens: 500
    } : request;

    console.log("Sending request with configuration:", {
      mode: process.env.NODE_ENV,
      endpoint: API_ENDPOINT,
      model: process.env.NODE_ENV === 'production' ? OPENAI_MODEL : 'N/A',
      contentLength: request.emailContent.length,
      apiRequestType: typeof apiRequest
    });
    
    // Log the message content if in production
    if (process.env.NODE_ENV === 'production' && apiRequest.messages) {
      console.log("System prompt:", apiRequest.messages[0].content);
      console.log("User message (first 100 chars):", 
        apiRequest.messages[1].content.substring(0, 100) + '...');
    }

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(process.env.NODE_ENV === 'production' ? apiRequest : request),
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

    // For production direct OpenAI calls, format the response
    if (process.env.NODE_ENV === 'production') {
      const result = await response.json();
      console.log("OpenAI response successful");
      
      if (!result.choices || result.choices.length === 0) {
        throw new Error("Invalid response format from OpenAI API");
      }
      
      const summary = result.choices[0].message.content;
      
      // Process and extract action items or key points if requested
      let apiResponse: SummarizeResponse = { summary };
      
      if (request.options?.focus === 'action-items') {
        // Extract action items by looking for lists or sections marked as action items
        const actionItemsRegex = /(?:action items:|actions:|to-do:|todo:)([\s\S]+?)(?=\n\n|\n\w+:|\n*$)/i;
        const match = summary.match(actionItemsRegex);
        
        if (match && match[1]) {
          // Extract bullet points or numbered items
          const items = match[1]
            .split(/\n[-•*]\s*|\n\d+\.\s*/)
            .filter((item: string) => item.trim().length > 0)
            .map((item: string) => item.trim());
            
          if (items.length > 0) {
            apiResponse.actionItems = items;
          }
        }
      } else if (request.options?.focus === 'key-points') {
        // Extract key points by looking for lists or sections marked as key points
        const keyPointsRegex = /(?:key points:|main points:|highlights:|important points:)([\s\S]+?)(?=\n\n|\n\w+:|\n*$)/i;
        const match = summary.match(keyPointsRegex);
        
        if (match && match[1]) {
          // Extract bullet points or numbered items
          const items = match[1]
            .split(/\n[-•*]\s*|\n\d+\.\s*/)
            .filter((item: string) => item.trim().length > 0)
            .map((item: string) => item.trim());
            
          if (items.length > 0) {
            apiResponse.keyPoints = items;
          }
        }
      }
      
      return apiResponse;
    } else {
      // In development, we're using the API route
      const result = await response.json();
      console.log("API response successful");
      return result;
    }
  } catch (error) {
    console.error("Error summarizing email:", error);
    return {
      summary: "",
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
