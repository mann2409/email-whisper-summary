
import { SummarizeRequest, SummarizeResponse } from "../../lib/types";
import { OPENAI_MODEL } from "../../lib/config";

export async function POST(request: Request): Promise<Response> {
  try {
    // Parse the request
    const data: SummarizeRequest = await request.json();
    
    if (!data.emailContent) {
      return new Response(
        JSON.stringify({ error: "Email content is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const options = data.options || { length: "medium", focus: "general" };
    
    // Construct the prompt for OpenAI
    let systemPrompt = "You are an AI assistant that summarizes emails into clear, concise points. ";
    
    if (options.focus === "action-items") {
      systemPrompt += "Focus on extracting action items and next steps from the email.";
    } else if (options.focus === "key-points") {
      systemPrompt += "Focus on extracting the key points and important information from the email.";
    } else {
      systemPrompt += "Provide a general summary that captures the main message of the email.";
    }

    // Add length guidance
    if (options.length === "short") {
      systemPrompt += " Keep the summary very brief, 1-2 sentences maximum.";
    } else if (options.length === "long") {
      systemPrompt += " Provide a comprehensive summary with more details.";
    } else {
      systemPrompt += " Aim for a medium-length summary of 3-4 sentences.";
    }

    // OpenAI API request
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Please summarize this email:\n\n${data.emailContent}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API error: ${errorData.error?.message || "Unknown error"}` 
        }),
        {
          status: openaiResponse.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const summary = openaiData.choices[0].message.content.trim();
    
    // Extract key points and action items if requested
    let keyPoints: string[] | undefined;
    let actionItems: string[] | undefined;

    if (options.focus === "key-points" || options.focus === "general") {
      // Simple extraction of bullet points from the summary
      keyPoints = summary
        .split(/\n+/)
        .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[•\-\*]\s*/, '').trim());
    }

    if (options.focus === "action-items") {
      // Simple extraction of action items from the summary
      actionItems = summary
        .split(/\n+/)
        .filter(line => {
          const lowerLine = line.toLowerCase();
          return (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) && 
            (lowerLine.includes('need to') || lowerLine.includes('should') || lowerLine.includes('must') || 
             lowerLine.includes('action') || lowerLine.includes('task') || lowerLine.includes('todo') ||
             lowerLine.includes('to-do') || lowerLine.includes('required'));
        })
        .map(line => line.replace(/^[•\-\*]\s*/, '').trim());
    }

    // Prepare the response
    const response: SummarizeResponse = {
      summary,
      ...(keyPoints && keyPoints.length > 0 ? { keyPoints } : {}),
      ...(actionItems && actionItems.length > 0 ? { actionItems } : {}),
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error in summarize API:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unknown error occurred" 
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}

export const config = {
  runtime: "edge",
};
