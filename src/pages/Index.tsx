
import { useState } from "react";
import { EmailInput } from "@/components/EmailInput";
import { SummaryDisplay } from "@/components/SummaryDisplay";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { SampleEmail } from "@/components/SampleEmail";
import { SummarizeRequest, SummarizeResponse } from "@/lib/types";
import { summarizeEmail } from "@/lib/api";
import { toast } from "sonner";

const Index = () => {
  const [emailContent, setEmailContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<SummarizeResponse | null>(null);

  const handleSubmit = async (content: string, options: { length: string; focus: string }) => {
    // Validate content before proceeding
    if (!content || content.trim() === '') {
      toast.error("Email content is required");
      return;
    }
    
    setEmailContent(content);
    setIsLoading(true);
    
    console.log("Index.tsx - handleSubmit called with content length:", content.length);
    console.log("Index.tsx - Content first 100 chars:", content.substring(0, 100) + "...");
    console.log("Index.tsx - Options:", options);
    
    // Check for API key in production
    if (process.env.NODE_ENV === 'production') {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY;
      console.log("Index.tsx - API key exists:", !!apiKey);
      
      if (!apiKey) {
        toast.error("OpenAI API key is required. Please set either OPENAI_API_KEY or VITE_OPENAI_API_KEY environment variable in your Vercel deployment.");
        setIsLoading(false);
        return;
      }
    }
    
    try {
      // Create the request with trimmed content
      const request: SummarizeRequest = {
        emailContent: content.trim(),
        options: {
          length: options.length as "short" | "medium" | "long",
          focus: options.focus as "general" | "action-items" | "key-points",
        },
      };
      
      console.log("Index.tsx - Request object created with keys:", Object.keys(request));
      console.log("Index.tsx - Email content length in request:", request.emailContent.length);
      console.log("Index.tsx - Email content type:", typeof request.emailContent);
      
      // Make the API call
      const result = await summarizeEmail(request);
      
      console.log("Index.tsx - API call result:", result.error ? "Error: " + result.error : "Success");
      
      if (result.error) {
        toast.error(result.error);
      }
      
      setSummary(result);
    } catch (error) {
      console.error("Index.tsx - Error:", error);
      setSummary({
        summary: "",
        error: error instanceof Error ? error.message : "An unknown error occurred",
      });
      toast.error("Failed to summarize email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSummary(null);
    setEmailContent("");
  };

  const handleUseSample = (sampleContent: string) => {
    console.log("Index.tsx - Using sample email with length:", sampleContent.length);
    setEmailContent(sampleContent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-blue-900 dark:text-blue-100 mb-2">
            Email Whisper
          </h1>
          <p className="text-slate-600 dark:text-slate-300 md:text-lg">
            Instantly transform lengthy emails into clear, concise summaries
          </p>
        </div>

        {isLoading ? (
          <LoadingIndicator />
        ) : summary ? (
          <SummaryDisplay summary={summary} onReset={handleReset} />
        ) : (
          <div>
            <EmailInput onSubmit={handleSubmit} isLoading={isLoading} />
            {!emailContent && <SampleEmail onUse={handleUseSample} />}
          </div>
        )}
      </div>
      
      <footer className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>Powered by OpenAI • Deployed on Vercel</p>
        {process.env.NODE_ENV === 'production' && (
          <p className="mt-2 text-xs">
            Note: This app requires an OpenAI API key. Set OPENAI_API_KEY in your Vercel deployment.
          </p>
        )}
      </footer>
    </div>
  );
};

export default Index;
