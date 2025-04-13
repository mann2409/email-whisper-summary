
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function LoadingIndicator() {
  return (
    <Card className="w-full shadow-md animate-fade-in">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg font-medium text-muted-foreground">
          Summarizing your email...
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Using AI to extract important information
        </p>
      </CardContent>
    </Card>
  );
}
