
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummarizeResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ClipboardCopy } from "lucide-react";
import { useState } from "react";

interface SummaryDisplayProps {
  summary: SummarizeResponse;
  onReset: () => void;
}

export function SummaryDisplay({ summary, onReset }: SummaryDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (summary.error) {
    return (
      <Card className="w-full bg-red-50 border-red-200 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{summary.error}</p>
          <Button variant="outline" onClick={onReset} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-semibold">Summary</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <ClipboardCopy className="w-4 h-4 mr-2" />
              Copy
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose dark:prose-invert max-w-none">
          <p className="whitespace-pre-line">{summary.summary}</p>
        </div>

        {summary.keyPoints && summary.keyPoints.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Key Points</h3>
            <ul className="list-disc pl-5 space-y-1">
              {summary.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {summary.actionItems && summary.actionItems.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Action Items</h3>
            <ul className="list-disc pl-5 space-y-1">
              {summary.actionItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4">
          <Button variant="outline" onClick={onReset} className="w-full">
            Summarize Another Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
