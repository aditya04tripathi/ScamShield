"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { markScanAsSafe, confirmThreat } from "@/lib/actions/admin.actions";
import { useState } from "react";

interface ReviewCardProps {
  scan: {
    _id: string;
    modality: string;
    input: {
      text?: string;
      url?: string;
      fileName?: string;
    };
    analysis: {
      riskTier: string;
      riskScore: number;
      signals: string[];
    };
    userId: string;
    createdAt: string;
  };
}

export default function AdminReviewCard({ scan }: ReviewCardProps) {
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleMarkSafe = async () => {
    setLoading(true);
    const result = await markScanAsSafe(scan._id);
    if (result.success) {
      setDismissed(true);
    }
    setLoading(false);
  };

  const handleConfirmThreat = async () => {
    setLoading(true);
    const result = await confirmThreat(scan._id);
    if (result.success) {
      setDismissed(true);
    }
    setLoading(false);
  };

  if (dismissed) {
    return null;
  }

  const content =
    scan.input?.text?.substring(0, 100) ||
    scan.input?.url ||
    scan.input?.fileName ||
    "Unknown content";

  const timeAgo = new Date(scan.createdAt).toLocaleString();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                {scan.modality}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {timeAgo}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  scan.analysis.riskTier === "critical"
                    ? "bg-red-100 text-red-800"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {scan.analysis.riskTier.toUpperCase()} (
                {scan.analysis.riskScore}%)
              </span>
            </div>
            <p className="font-medium text-lg truncate max-w-lg">{content}</p>
            <div className="text-sm text-red-500">
              Signals:{" "}
              {scan.analysis.signals?.slice(0, 2).join(", ") || "No signals"}
            </div>
            <p className="text-xs text-muted-foreground">
              User ID: {scan.userId}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200"
              onClick={handleMarkSafe}
              disabled={loading}
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              {loading ? "..." : "Mark Safe"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleConfirmThreat}
              disabled={loading}
            >
              <XCircle className="mr-1 h-3 w-3" />
              {loading ? "..." : "Confirm Threat"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
