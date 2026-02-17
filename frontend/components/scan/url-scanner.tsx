"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Globe,
  Search,
  ShieldAlert,
} from "lucide-react";
import { performScan } from "@/lib/actions/scan.actions";

export default function UrlScanner() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append("modality", "url");
    formData.append("content", url);

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
            <CardTitle className="text-lg font-black">Website URL</CardTitle>
            <CardDescription>
              Enter the full link (e.g., https://example.com)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button onClick={handleScan} disabled={loading || !url}>
                {loading ? <Search className="animate-spin h-4 w-4" /> : "Scan"}
              </Button>
            </div>
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
                    ? "Website Appears Safe"
                    : result.riskTier === "low"
                      ? "Minor Suspicion Detected"
                      : result.riskTier === "medium"
                        ? "Moderate Risk Detected"
                        : result.riskTier === "high"
                          ? "Suspected Phishing Site"
                          : "Dangerous — Likely Phishing"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-foreground/80">
                {result.explanation}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Threat Score</span>
                  <span>{result.riskScore}/100</span>
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
            <Globe className="h-12 w-12 mb-4 opacity-20" />
            <p>Scan results will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
