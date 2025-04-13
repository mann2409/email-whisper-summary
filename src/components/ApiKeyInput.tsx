
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Eye, EyeOff, Key } from "lucide-react";

export function ApiKeyInput() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Check if API key is in localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsSaved(true);
    }
  }, []);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("openai_api_key", apiKey.trim());
      setIsSaved(true);
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem("openai_api_key");
    setApiKey("");
    setIsSaved(false);
    setShowApiKey(false);
  };

  return (
    <Card className="w-full shadow-md mb-6 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="w-5 h-5 mr-2" /> 
          OpenAI API Key
        </CardTitle>
        <CardDescription>
          Your API key is stored locally in your browser and never sent to our servers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSaved ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>API key saved in your browser</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsSaved(false)}>
                Change API Key
              </Button>
              <Button variant="outline" size="sm" onClick={clearApiKey}>
                Clear API Key
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">
                Enter your OpenAI API Key
              </Label>
              <div className="flex">
                <div className="relative flex-1">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-0 top-0 h-full"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button 
                  onClick={saveApiKey} 
                  disabled={!apiKey.trim()} 
                  className="ml-2"
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API key from <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI's website</a>
              </p>
              
              {!apiKey.trim().startsWith("sk-") && apiKey.trim() !== "" && (
                <div className="flex items-center text-xs text-red-600 mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  API keys typically start with "sk-"
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
