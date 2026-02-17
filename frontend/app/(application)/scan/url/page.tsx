import { constructMetadata } from "@/lib/generate-metadata";
import URLScanner from "@/components/scan/url-scanner";

export const metadata = constructMetadata({
  title: "URL Scanner - ScamShield",
  description:
    "Scan suspicious websites and links for phishing, malware, and fraud.",
});

export default function URLScanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-medium">URL Scanner</h3>
        <p className="text-muted-foreground">
          Enter a website URL to detect phishing, fake domains, and malicious hosting.
        </p>
      </div>
      <URLScanner />
    </div>
  );
}
