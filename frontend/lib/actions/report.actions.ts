"use server";

import connectToDatabase from "@/lib/db/connect";
import ScamReport from "@/lib/db/models/scam-report.model";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const MICROSERVICE_URL =
  process.env.MICROSERVICE_URL || "http://localhost:8000";

async function syncReportToHeuristic(report: {
  scamType: string;
  severity: string;
  description: string;
  scammerContact?: string;
  relatedUrl?: string;
  reportId?: string;
}) {
  try {
    await fetch(`${MICROSERVICE_URL}/reports/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scam_type: report.scamType,
        severity: report.severity,
        description: report.description,
        scammer_contact: report.scammerContact || null,
        related_url: report.relatedUrl || null,
        report_id: report.reportId || null,
      }),
    });
  } catch (err) {
    console.warn("Failed to sync report to heuristic engine:", err);
  }
}

export async function submitScamReport(prevState: any, formData: FormData) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Unauthorized" };
    }

    const scamType = formData.get("scamType") as string;
    const severity = formData.get("severity") as string;
    const scammerContact = formData.get("scammerContact") as string;
    const relatedUrl = formData.get("relatedUrl") as string;
    const description = formData.get("description") as string;

    if (!scamType || !severity || !description) {
      return { error: "Please fill in all required fields." };
    }

    await connectToDatabase();

    const newReport = await ScamReport.create({
      userId: session.user.id,
      scamType,
      severity,
      scammerContact: scammerContact || undefined,
      relatedUrl: relatedUrl || undefined,
      description,
      status: "pending",
    });

    await syncReportToHeuristic({
      scamType,
      severity,
      description,
      scammerContact: scammerContact || undefined,
      relatedUrl: relatedUrl || undefined,
      reportId: newReport._id.toString(),
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    console.error("Report submission error:", error);
    return {
      error: error.message || "Something went wrong while submitting report.",
    };
  }
}

export async function getUserReports() {
  try {
    const session = await getSession();
    if (!session) return [];

    await connectToDatabase();

    const reports = await ScamReport.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return reports.map((report: any) => ({
      ...report,
      _id: report._id.toString(),
      createdAt: report.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching user reports:", error);
    return [];
  }
}

export async function syncAllReportsToHeuristic() {
  try {
    await connectToDatabase();

    const reports = await ScamReport.find({}).lean();
    if (reports.length === 0) return { synced: 0 };

    const payload = reports.map((r: any) => ({
      scam_type: r.scamType,
      severity: r.severity,
      description: r.description,
      scammer_contact: r.scammerContact || null,
      related_url: r.relatedUrl || null,
      report_id: r._id.toString(),
    }));

    const resp = await fetch(`${MICROSERVICE_URL}/reports/ingest/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reports: payload }),
    });

    if (resp.ok) {
      const data = await resp.json();
      return {
        synced: data.reports_processed,
        indicators: data.indicators_added,
      };
    }
    return { synced: 0, error: "Backend returned non-OK status" };
  } catch (error) {
    console.error("Bulk sync error:", error);
    return { synced: 0, error: String(error) };
  }
}
