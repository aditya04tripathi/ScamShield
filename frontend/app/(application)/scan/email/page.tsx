import { constructMetadata } from "@/lib/generate-metadata";
import EmailScanner from "@/components/scan/email-scanner";

export const metadata = constructMetadata({
  title: "Email Analysis - ScamShield",
  description:
    "Analyze suspicious emails for phishing patterns and malicious intent.",
});

export default function EmailScanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-medium">Email Analysis</h3>
        <p className="text-muted-foreground">
          Paste the content of a suspicious email to analyze it for phishing
          patterns, urgency cues, and malicious intent.
        </p>
      </div>
      <EmailScanner />
    </div>
  );
}
