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
  FileText,
  Upload,
  ShieldAlert,
} from "lucide-react";
import { performScan } from "@/lib/actions/scan.actions";

export default function FileScanner() {
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
    formData.append("modality", "file");
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

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-black">Upload File</CardTitle>
            <CardDescription>
              Supported formats: PDF, DOCX, EXE, JPG (Max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors hover:bg-muted/50">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="rounded-full bg-primary/10 p-4 mb-3">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <span className="font-medium">
                  {file ? file.name : "Click to upload or drag & drop"}
                </span>
                <span className="text-sm text-muted-foreground mt-1">
                  {file
                    ? `${(file.size / 1024).toFixed(2)} KB`
                    : "Files safe and deleted after scan"}
                </span>
              </label>
            </div>
            <Button
              className="w-full mt-4"
              onClick={handleScan}
              disabled={loading || !file}
            >
              {loading ? "Scanning..." : "Scan File"}
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
              result.riskTier === "safe"
                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                : result.riskTier === "low"
                  ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20"
                  : result.riskTier === "medium"
                    ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20"
                    : "border-red-500 bg-red-50 dark:bg-red-950/20"
            }
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                {result.riskTier === "safe" ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <ShieldAlert
                    className={`h-6 w-6 ${
                      result.riskTier === "low"
                        ? "text-yellow-600"
                        : result.riskTier === "medium"
                          ? "text-orange-600"
                          : "text-red-600"
                    }`}
                  />
                )}
                <CardTitle
                  className={
                    result.riskTier === "safe"
                      ? "text-green-700 dark:text-green-400"
                      : result.riskTier === "low"
                        ? "text-yellow-700 dark:text-yellow-400"
                        : result.riskTier === "medium"
                          ? "text-orange-700 dark:text-orange-400"
                          : "text-red-700 dark:text-red-400"
                  }
                >
                  {result.riskTier === "safe"
                    ? "File is Clean"
                    : result.riskTier === "low"
                      ? "Minor Concerns Found"
                      : result.riskTier === "medium"
                        ? "Suspicious File Detected"
                        : result.riskTier === "high"
                          ? "Likely Malicious File"
                          : "Malware Detected"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-foreground/80">
                {result.explanation}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Threat Probability</span>
                  <span>{result.riskScore}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-background/50">
                  <div
                    className={`h-full rounded-full ${
                      result.riskTier === "safe"
                        ? "bg-green-500"
                        : result.riskTier === "low"
                          ? "bg-yellow-500"
                          : result.riskTier === "medium"
                            ? "bg-orange-500"
                            : "bg-red-500"
                    }`}
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
          <div className="flex h-full min-h-50 flex-col items-center justify-center rounded-xl border border-dashed text-center text-muted-foreground p-8">
            <FileText className="h-12 w-12 mb-4 opacity-20" />
            <p>Scan results will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
