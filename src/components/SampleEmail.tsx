
import { Button } from "@/components/ui/button";

interface SampleEmailProps {
  onUse: (content: string) => void;
}

export function SampleEmail({ onUse }: SampleEmailProps) {
  const sampleEmail = `From: sarah.johnson@example.com
Subject: Project Timeline Update and Next Steps

Hi Team,

I hope this email finds you well. I wanted to provide an update on our current project timeline and discuss some important next steps.

As you know, we had initially planned to launch the new feature set by the end of Q2. However, after reviewing our progress and the feedback from the beta testing group, we believe we need to extend the timeline by two weeks to address some critical usability issues that were identified.

Here are the key points:
• The beta testing revealed that 75% of users found the navigation confusing
• We've identified 3 critical bugs that must be fixed before launch
• The customer support team needs additional training time

I've already spoken with the stakeholders, and they are supportive of this adjustment, understanding that it will lead to a better product in the end.

Action Items:
• Development team: Please prioritize the bug fixes mentioned in the attached report
• Design team: We need updated mockups for the navigation flow by Wednesday
• Product team: Schedule a meeting with customer support to plan their training
• Everyone: Please update your individual timelines in the project management system by EOD tomorrow

Let's schedule a quick stand-up tomorrow at 10 AM to discuss any questions or concerns.

Thanks for your hard work and dedication to making this project successful!

Best regards,
Sarah Johnson
Product Manager`;

  return (
    <div className="rounded-md bg-muted p-4 mt-4">
      <h3 className="text-sm font-medium mb-2">Need an example?</h3>
      <p className="text-xs text-muted-foreground mb-2">
        Use our sample email to test the summarizer
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onUse(sampleEmail)}
      >
        Use Sample Email
      </Button>
    </div>
  );
}
