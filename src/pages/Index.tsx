
import { useState } from "react";
import { EmailInput } from "@/components/EmailInput";
import { SummaryDisplay } from "@/components/SummaryDisplay";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { SampleEmail } from "@/components/SampleEmail";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { SummarizeRequest, SummarizeResponse } from "@/lib/types";
import { summarizeEmail } from "@/lib/api";
import { toast } from "sonner";

const Index = () => {
  const [emailContent, setEmailContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<SummarizeResponse | null>(null);

  const handleSubmit = async (content: string, options: { length: string; focus: string }) => {
    setEmailContent(content);
    setIsLoading(true);
    
    try {
      // Check for API key in local storage
      const apiKey = localStorage.getItem("openai_api_key");
      
      if (!apiKey) {
        toast.error("Please enter your OpenAI API key first");
        setIsLoading(false);
        return;
      }
      
      // Create the request
      const request: SummarizeRequest = {
        emailContent: content,
        options: {
          length: options.length as "short" | "medium" | "long",
          focus: options.focus as "general" | "action-items" | "key-points",
        },
      };
      
      // Make the API call
      const result = await summarizeEmail(request);
      
      if (result.error) {
        toast.error(result.error);
      }
      
      setSummary(result);
    } catch (error) {
      console.error("Error:", error);
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

        <ApiKeyInput />

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
      </footer>
    </div>
  );
};

export default Index;
