import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { constructMetadata } from "@/lib/generate-metadata";
import { getScanHistory } from "@/lib/actions/scan.actions";
import { HistoryFilters } from "@/components/history/history-filters";
import { Pagination } from "@/components/history/pagination";
import { Suspense } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";

export const metadata = constructMetadata({
  title: "History - ScamShield",
  description:
    "Review your past scan results and manage your scan history with ease.",
});

const RISK_COLORS: Record<string, string> = {
  safe: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const MODALITY_ICONS: Record<string, string> = {
  email: "📧",
  url: "🔗",
  file: "📄",
  audio: "🎙️",
  prompt: "💬",
};

interface HistoryPageProps {
  searchParams: Promise<{
    page?: string;
    modality?: string;
    riskTier?: string;
    search?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const { scans, total, totalPages, limit } = await getScanHistory({
    page,
    limit: 10,
    modality: params.modality,
    riskTier: params.riskTier,
    search: params.search,
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-medium">Scan History</h3>
        <p className="text-muted-foreground">
          View and manage your past scan results.
        </p>
      </div>

      <Suspense fallback={null}>
        <HistoryFilters />
      </Suspense>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Target/Input</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scans.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  {params.modality || params.riskTier || params.search
                    ? "No scans match the current filters."
                    : "No scan history found. Start your first scan!"}
                </TableCell>
              </TableRow>
            ) : (
              scans.map((scan: any) => (
                <TableRow key={scan._id}>
                  <TableCell className="font-medium capitalize">
                    <span className="mr-1.5">
                      {MODALITY_ICONS[scan.modality] ?? "📋"}
                    </span>
                    {scan.modality}
                  </TableCell>
                  <TableCell className="max-w-50 truncate">
                    {scan.input.text ||
                      scan.input.url ||
                      scan.input.fileName ||
                      scan.input.fileUrl ||
                      "Content"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize ${RISK_COLORS[scan.analysis.riskTier] ?? ""}`}
                    >
                      {scan.analysis.riskTier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {scan.analysis.riskScore}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/history/${scan._id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Suspense fallback={null}>
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
        />
      </Suspense>
    </div>
  );
}
