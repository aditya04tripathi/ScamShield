import AudioScanner from "@/components/scan/audio-scanner";
import { constructMetadata } from "@/lib/generate-metadata";
import { Metadata } from "next";

export const metadata: Metadata = constructMetadata({
  title: "Audio Scanner - ScamShield",
  description: "Detect AI-generated voice clones and audio deepfakes.",
});

export default function AudioScanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audio Scanner</h1>
        <p className="text-muted-foreground mt-2">
          Upload a voice recording or voicemail to determine if it was generated
          by AI.
        </p>
      </div>

      <AudioScanner />
    </div>
  );
}
