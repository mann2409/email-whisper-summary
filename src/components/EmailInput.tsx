
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EmailInputProps {
  onSubmit: (content: string, options: { length: string; focus: string }) => void;
  isLoading: boolean;
}

export function EmailInput({ onSubmit, isLoading }: EmailInputProps) {
  const [emailContent, setEmailContent] = useState("");
  const [length, setLength] = useState("medium");
  const [focus, setFocus] = useState("general");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailContent.trim()) {
      onSubmit(emailContent, { 
        length: length as "short" | "medium" | "long", 
        focus: focus as "general" | "action-items" | "key-points" 
      });
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasteData = e.clipboardData.getData("text");
    setEmailContent(pasteData);
  };

  return (
    <Card className="w-full shadow-md animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Email Summarizer</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-content">Email Content</Label>
            <Textarea
              id="email-content"
              placeholder="Paste your email content here..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              onPaste={handlePaste}
              className="min-h-[200px] resize-none"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="summary-length">Summary Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger id="summary-length">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                  <SelectItem value="medium">Medium (3-4 sentences)</SelectItem>
                  <SelectItem value="long">Long (detailed)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="summary-focus">Summary Focus</Label>
              <Select value={focus} onValueChange={setFocus}>
                <SelectTrigger id="summary-focus">
                  <SelectValue placeholder="Select focus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Summary</SelectItem>
                  <SelectItem value="key-points">Key Points</SelectItem>
                  <SelectItem value="action-items">Action Items</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isLoading || !emailContent.trim()}
            className="w-full"
          >
            {isLoading ? "Summarizing..." : "Summarize Email"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
