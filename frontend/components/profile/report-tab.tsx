"use client";

import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useActionState } from "react";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { submitScamReport } from "@/lib/actions/report.actions";

type UserReport = {
  _id: string;
  scamType: string;
  severity: string;
  scammerContact?: string;
  relatedUrl?: string;
  description: string;
  status: string;
  createdAt: string;
};

const statusTone: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const ReportTab = ({ reports }: { reports: UserReport[] }) => {
  const [state, action, isPending] = useActionState(
    submitScamReport,
    undefined,
  );

  return (
    <div className="space-y-4">
      <Card className="border-red-100 dark:border-red-900/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Report a Scam</CardTitle>
          </div>
          <CardDescription>
            Help protect the community by reporting scams you've encountered.
          </CardDescription>
        </CardHeader>
        <form action={action}>
          <CardContent className="space-y-4 pb-5">
            {state?.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="scamType">Scam Type</Label>
                <Select name="scamType" defaultValue="phishing">
                  <SelectTrigger id="scamType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phishing">Phishing Email</SelectItem>
                    <SelectItem value="smishing">SMS / Text Message</SelectItem>
                    <SelectItem value="vishing">Voice Call</SelectItem>
                    <SelectItem value="website">Malicious Website</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity / Impact</Label>
                <Select name="severity" defaultValue="attempt">
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attempt">Attempt Only</SelectItem>
                    <SelectItem value="info_loss">
                      Information Stolen
                    </SelectItem>
                    <SelectItem value="monetary_loss">
                      Financial Loss
                    </SelectItem>
                    <SelectItem value="system_compromise">
                      Device Infected
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scammerContact">Scammer Contact Info</Label>
              <Input
                id="scammerContact"
                name="scammerContact"
                placeholder="Email, Phone Number, or Username used by scammer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relatedUrl">Related URL (if any)</Label>
              <Input
                id="relatedUrl"
                name="relatedUrl"
                placeholder="https://malicious-site.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description of Incident</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what happened. What did they ask for? What did they say?"
                className="min-h-25"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
            {state?.success && (
              <Alert className="bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/50">
                <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle>Report Submitted</AlertTitle>
                <AlertDescription>
                  Thank you for reporting this. We will analyze it to improve
                  our detection.
                </AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              variant="destructive"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? "Submitting Report..." : "Submit Scam Report"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Reports</CardTitle>
          <CardDescription>
            Scam reports saved in your personal account space.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-muted-foreground rounded-md border py-8 text-center text-sm">
              You have not submitted any scam reports yet.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report._id} className="rounded-md border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium capitalize">
                          {report.scamType.replaceAll("_", " ")}
                        </p>
                        <Badge
                          variant="outline"
                          className={`capitalize ${statusTone[report.status] ?? ""}`}
                        >
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {report.severity.replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm">
                    {report.description}
                  </p>
                  {(report.scammerContact || report.relatedUrl) && (
                    <div className="text-muted-foreground mt-3 space-y-1 text-xs">
                      {report.scammerContact && (
                        <p>Contact: {report.scammerContact}</p>
                      )}
                      {report.relatedUrl && <p>URL: {report.relatedUrl}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportTab;
