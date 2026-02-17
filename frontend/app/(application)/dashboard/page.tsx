import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Shield,
  TrendingUp,
  Mail,
  Link as LinkIcon,
  FileText,
  Mic,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { constructMetadata } from "@/lib/generate-metadata";
import {
  getDashboardStats,
  getRecentScans,
  getThreatTrends,
} from "@/lib/actions/scan.actions";

export const metadata = constructMetadata({
  title: "Dashboard - ScamShield",
  description:
    "Your central hub for monitoring and managing all your scam detection activities. View recent scans, threat trends, and overall security status at a glance.",
});

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const recentScans = await getRecentScans();
  const threatTrends = await getThreatTrends();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Our Scanners</h2>
      </div>

      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        }}
      >
        <Link href="/scan/email">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Scan email content
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/scan/url">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">URL</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Check suspicious links
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/scan/file">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">File</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Analyze files</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/scan/audio">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audio</CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Detect deepfakes</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/scan/prompt">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prompt</CardTitle>
              <Terminal className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Check injections</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/scan/email">New Scan</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalScans ?? 0}</div>
            <p className="text-xs text-muted-foreground">All-time scan count</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Threats Blocked
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.threatsBlocked ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              High/critical threats detected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats?.riskStatus === "Critical"
                  ? "text-red-600"
                  : stats?.riskStatus === "Medium"
                    ? "text-yellow-600"
                    : "text-green-600"
              }`}
            >
              {stats?.riskStatus ?? "Low"}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on recent activity
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Protection
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeProtection ? "Enabled" : "Disabled"}
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time monitoring active
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent scan history and results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentScans.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No recent scans. Start your first scan!
                </div>
              ) : (
                recentScans.map((scan: any) => {
                  const isRisky = scan.analysis?.riskTier !== "safe";
                  const Icon = isRisky ? AlertTriangle : CheckCircle;
                  const colorClass = isRisky
                    ? "text-red-500"
                    : "text-green-500";
                  const bgClass = isRisky ? "bg-red-100" : "bg-green-100";

                  return (
                    <div
                      key={scan._id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`rounded-full bg-muted p-2 ${bgClass}`}>
                          <Icon className={`h-4 w-4 ${colorClass}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate max-w-[200px]">
                            {scan.input?.text ||
                              scan.input?.url ||
                              scan.input?.fileName ||
                              "Scan"}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {scan.modality} Scan •{" "}
                            {new Date(scan.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-medium capitalize ${colorClass}`}
                      >
                        {scan.analysis?.riskTier || "Unknown"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Threat Trends</CardTitle>
            <CardDescription>
              Most common threats detected this week.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {threatTrends.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No threat data this week.
                </div>
              ) : (
                threatTrends.map((trend: any) => (
                  <div key={trend.modality} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{trend.label}</span>
                      <span className="font-medium">{trend.percentage}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${trend.color}`}
                        style={{ width: `${trend.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
