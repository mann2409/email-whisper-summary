
import { SummarizeRequest, SummarizeResponse } from "./types";
import { API_ENDPOINT } from "./config";

export async function summarizeEmail(
  request: SummarizeRequest
): Promise<SummarizeResponse> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
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

    return await response.json();
  } catch (error) {
    console.error("Error summarizing email:", error);
    return {
      summary: "",
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
