import { notFound } from "next/navigation";
import { getScanById } from "@/lib/actions/scan.actions";
import { constructMetadata } from "@/lib/generate-metadata";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { ArrowLeft, Shield, Clock, Cpu, AlertTriangle } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return constructMetadata({
    title: "Scan Detail - ScamShield",
    description: "View full details of a scan result.",
  });
}

const RISK_COLORS: Record<string, string> = {
  safe: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const RISK_PROGRESS_COLORS: Record<string, string> = {
  safe: "[&>div]:bg-green-500",
  low: "[&>div]:bg-blue-500",
  medium: "[&>div]:bg-yellow-500",
  high: "[&>div]:bg-orange-500",
  critical: "[&>div]:bg-red-500",
};

const MODALITY_ICONS: Record<string, string> = {
  email: "📧",
  url: "🔗",
  file: "📄",
  audio: "🎙️",
  prompt: "💬",
};

export default async function ScanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scan = await getScanById(id);

  if (!scan) {
    notFound();
  }

  const inputDisplay =
    scan.input.text ||
    scan.input.url ||
    scan.input.fileName ||
    scan.input.fileUrl ||
    "N/A";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/history">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h3 className="text-2xl font-medium flex items-center gap-2">
            <span>{MODALITY_ICONS[scan.modality] ?? "📋"}</span>
            <span className="capitalize">{scan.modality}</span> Scan Detail
          </h3>
          <p className="text-muted-foreground text-sm">
            {new Date(scan.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`capitalize text-sm px-3 py-1 ${RISK_COLORS[scan.analysis.riskTier] ?? ""}`}
        >
          {scan.analysis.riskTier}
        </Badge>
      </div>

      {/* Risk Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Risk Score</span>
            <span className="text-2xl font-bold font-mono">
              {scan.analysis.riskScore}
              <span className="text-sm text-muted-foreground font-normal">
                /100
              </span>
            </span>
          </div>
          <Progress
            value={scan.analysis.riskScore}
            className={`h-2 ${RISK_PROGRESS_COLORS[scan.analysis.riskTier] ?? ""}`}
          />
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className="text-sm font-medium">
                {(scan.analysis.confidence * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Risk Tier</p>
              <p className="text-sm font-medium capitalize">
                {scan.analysis.riskTier}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Scanned Input</CardTitle>
          <CardDescription className="capitalize">
            {scan.modality} content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 border rounded-md p-4">
            <p className="text-sm break-all whitespace-pre-wrap">
              {inputDisplay}
            </p>
          </div>
          {scan.input.fileName && (
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
              <span>File: {scan.input.fileName}</span>
              {scan.input.fileSize && (
                <span>Size: {(scan.input.fileSize / 1024).toFixed(1)} KB</span>
              )}
              {scan.input.mimeType && <span>Type: {scan.input.mimeType}</span>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signals */}
      {scan.analysis.signals && scan.analysis.signals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Threat Signals ({scan.analysis.signals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {scan.analysis.signals.map((signal: string, i: number) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm bg-muted/50 border rounded-md px-3 py-2"
                >
                  <span className="text-yellow-500 mt-0.5">⚠</span>
                  {signal}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Explanation & Summary */}
      {(scan.analysis.explanation || scan.analysis.analystSummary) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {scan.analysis.explanation && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Explanation
                </p>
                <p className="text-sm leading-relaxed">
                  {scan.analysis.explanation}
                </p>
              </div>
            )}
            {scan.analysis.analystSummary && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Analyst Summary
                  </p>
                  <p className="text-sm leading-relaxed">
                    {scan.analysis.analystSummary}
                  </p>
                </div>
              </>
            )}
            {scan.analysis.recommendedAction && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Recommended Action
                  </p>
                  <p className="text-sm leading-relaxed font-medium">
                    {scan.analysis.recommendedAction}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Processing Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Cpu className="h-4 w-4" />
            Processing Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Model</p>
              <p
                className="font-medium truncate"
                title={scan.processing?.model}
              >
                {scan.processing?.model ?? "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Version</p>
              <p className="font-medium">{scan.processing?.version ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-medium">
                {scan.processing?.durationMs
                  ? `${scan.processing.durationMs}ms`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant="outline" className="capitalize">
                {scan.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Created: {new Date(scan.createdAt).toLocaleString()}
        </span>
        {scan.updatedAt && (
          <span>Updated: {new Date(scan.updatedAt).toLocaleString()}</span>
        )}
        <span className="ml-auto font-mono">{scan._id}</span>
      </div>
    </div>
  );
}
