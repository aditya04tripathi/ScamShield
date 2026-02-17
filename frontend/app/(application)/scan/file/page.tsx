import FileScanner from "@/components/scan/file-scanner";
import { constructMetadata } from "@/lib/generate-metadata";
import { Metadata } from "next";

export const metadata: Metadata = constructMetadata({
  title: "File Scanner - ScamShield",
  description: "Scan files for malware and hidden threats.",
});

export default function FileScanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">File Scanner</h1>
        <p className="text-muted-foreground mt-2">
          Upload suspicious files to check for malware and hidden threats.
        </p>
      </div>

      <FileScanner />
    </div>
  );
}
