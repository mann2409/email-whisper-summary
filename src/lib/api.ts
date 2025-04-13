
import { SummarizeRequest, SummarizeResponse } from "./types";
import { API_ENDPOINT } from "./config";

export async function summarizeEmail(
  request: SummarizeRequest
): Promise<SummarizeResponse> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to summarize email");
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
