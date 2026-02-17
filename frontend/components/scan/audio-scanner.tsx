"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle,
  Mic,
  ShieldAlert,
  Volume2,
} from "lucide-react";
import { performScan } from "@/lib/actions/scan.actions";

export default function AudioScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > MAX_FILE_SIZE) {
        setError(
          `File too large (${(selected.size / 1024 / 1024).toFixed(1)} MB). Max is 10 MB.`,
        );
        setFile(null);
        return;
      }
      setFile(selected);
      setResult(null);
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append("modality", "audio");
    formData.append("content", file.name);
    formData.append("file", file);

    const res = await performScan(null, formData);

    if (res && res.success) {
      setResult(res.data);
      setError(null);
    } else {
      setError(res?.error || "Scan failed. Is the backend running?");
      setResult(null);
    }
    setLoading(false);
  };

  const isFake = result && result.riskTier !== "safe";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-black">Upload Audio</CardTitle>
            <CardDescription>
              Supported: MP3, WAV, M4A (Max 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors hover:bg-muted/50">
              <input
                type="file"
                accept="audio/*"
                id="audio-upload"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="audio-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="rounded-full bg-primary/10 p-4 mb-3">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
                <span className="font-medium">
                  {file ? file.name : "Upload audio file"}
                </span>
                <span className="text-sm text-muted-foreground mt-1">
                  {file
                    ? `${(file.size / 1024).toFixed(2)} KB`
                    : "Drag & drop or click to browse"}
                </span>
              </label>
            </div>
            <Button
              className="w-full mt-4"
              onClick={handleScan}
              disabled={loading || !file}
            >
              {loading ? "Analyzing Waveforms..." : "Analyze Audio"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Scan Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result ? (
          <Card
            className={
              isFake
                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                : "border-green-500 bg-green-50 dark:bg-green-950/20"
            }
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                {isFake ? (
                  <ShieldAlert className="h-6 w-6 text-orange-600" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
                <CardTitle
                  className={
                    isFake
                      ? "text-orange-700 dark:text-orange-400"
                      : "text-green-700 dark:text-green-400"
                  }
                >
                  {isFake
                    ? "AI-Generated Audio Detected"
                    : "Authentic Human Voice"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-foreground/80">
                {result.explanation}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>AI Probability Score</span>
                  <span>{result.riskScore}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-background/50">
                  <div
                    className={`h-full rounded-full ${isFake ? "bg-orange-500" : "bg-green-500"}`}
                    style={{ width: `${result.riskScore}%` }}
                  />
                </div>
              </div>
              {result.signals && result.signals.length > 0 && (
                <div className="mt-4">
                  <span className="font-semibold text-sm text-muted-foreground">
                    Signals
                  </span>
                  <ul className="list-disc list-inside mt-1 text-sm">
                    {result.signals.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.analystSummary && (
                <div className="mt-4">
                  <span className="font-semibold text-sm text-muted-foreground">
                    Analyst Summary
                  </span>
                  <p className="mt-1 text-sm">{result.analystSummary}</p>
                </div>
              )}
              {result.recommendedAction && (
                <div className="mt-4">
                  <span className="font-semibold text-sm text-muted-foreground">
                    Recommended Action
                  </span>
                  <p className="mt-1 font-medium">{result.recommendedAction}</p>
                </div>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex h-full min-h-62.5 flex-col items-center justify-center rounded-xl border border-dashed text-center text-muted-foreground p-8">
            <Volume2 className="mb-4 h-12 w-12 opacity-20" />
            <p className="max-w-50">
              Upload voice note to check for deepfake cloning
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
