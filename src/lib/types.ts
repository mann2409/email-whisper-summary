
export interface SummarizeRequest {
  emailContent: string;
  options?: {
    length?: "short" | "medium" | "long";
    focus?: "general" | "action-items" | "key-points";
  };
}

export interface SummarizeResponse {
  summary: string;
  keyPoints?: string[];
  actionItems?: string[];
  error?: string;
}
