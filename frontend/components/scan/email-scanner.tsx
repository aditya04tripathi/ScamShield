"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { performScan } from "@/lib/actions/scan.actions";

export default function EmailScanner() {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setResult(null);
    setError(null);
    startTransition(async () => {
      const res = await performScan(null, formData);

      if (res && res.success) {
        setResult(res.data);
        setError(null);
      } else {
        setError(res?.error || "Scan failed. Is the backend running?");
        setResult(null);
      }
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg font-black">Email Content</CardTitle>
          <CardDescription>
            Paste the body text of the email here.
          </CardDescription>
        </CardHeader>
        <form action={onSubmit}>
          <CardContent>
            <input type="hidden" name="modality" value="email" />
            <Textarea
              name="content"
              placeholder="Subject: Urgent Action Required..."
              className="min-h-75 font-mono text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </CardContent>
          <CardFooter>
            <Button
              className="w-full transition-all duration-200 active:scale-[0.98]"
              type="submit"
              disabled={isPending || !content.trim()}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                "Analyze Email"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Scan Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isPending && (
          <Card className="h-full flex items-center justify-center border-dashed animate-pulse">
            <div className="text-center text-muted-foreground p-6">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin opacity-40" />
              <p>Running detection models…</p>
            </div>
          </Card>
        )}

        {!result && !isPending && !error && (
          <Card className="h-full flex items-center justify-center border-dashed">
            <div className="text-center text-muted-foreground p-6">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Ready to scan</p>
            </div>
          </Card>
        )}

        {result && (
          <div className="space-y-4">
            <Alert
              variant={result.riskTier === "safe" ? "default" : "destructive"}
              className={`transition-all duration-500 ${
                result.riskTier !== "safe"
                  ? "border-red-500/50 bg-red-50 dark:bg-red-900/10"
                  : "border-green-500/50 bg-green-50 text-green-900 dark:bg-green-900/10 dark:text-green-100"
              }`}
            >
              {result.riskTier !== "safe" ? (
                <ShieldAlert className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
              <AlertTitle
                className={
                  result.riskTier !== "safe"
                    ? ""
                    : "text-green-700 dark:text-green-400"
                }
              >
                {result.riskTier.toUpperCase()} RISK DETECTED
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p className="font-semibold text-lg">
                  {result.riskScore}/100 Risk Score
                </p>
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-semibold text-sm text-muted-foreground">
                    Explanation
                  </span>
                  <p className="mt-1">{result.explanation}</p>
                </div>
                <div>
                  <span className="font-semibold text-sm text-muted-foreground">
                    Signals
                  </span>
                  <ul className="list-disc list-inside mt-1 text-sm">
                    {result.signals.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-sm text-muted-foreground">
                    Recommended Action
                  </span>
                  <p className="mt-1 font-medium">{result.recommendedAction}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
