import PromptScanner from "@/components/scan/prompt-scanner";
import { constructMetadata } from "@/lib/generate-metadata";
import { Metadata } from "next";

export const metadata: Metadata = constructMetadata({
  title: "Prompt Injection Scanner - ScamShield",
  description: "Detect LLM prompt injection attacks and jailbreaks.",
});

export default function PromptScanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Prompt Injection Scanner
        </h1>
        <p className="text-muted-foreground mt-2">
          Analyze LLM prompts to detect injection attacks, jailbreaks, and data
          exfiltration attempts.
        </p>
      </div>

      <PromptScanner />
    </div>
  );
}
