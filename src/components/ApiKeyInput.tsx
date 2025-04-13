
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Key } from "lucide-react";

export function ApiKeyInput() {
  return (
    <Card className="w-full shadow-md mb-6 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="w-5 h-5 mr-2" /> 
          OpenAI API Key
        </CardTitle>
        <CardDescription>
          API key is configured on the server
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <AlertCircle className="w-4 h-4" />
          <span>This app uses a server-side API key. Your data is secure.</span>
        </div>
      </CardContent>
    </Card>
  );
}
