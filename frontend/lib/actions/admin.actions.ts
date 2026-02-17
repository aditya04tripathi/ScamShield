"use server";

import connectToDatabase from "@/lib/db/connect";
import Scan from "@/lib/db/models/scan.model";
import Feedback from "@/lib/db/models/feedback.model";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getPendingReviews() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return [];
    }

    await connectToDatabase();

    const reviewedScanIds = await Feedback.distinct("scanId");

    const pendingScans = await Scan.find({
      _id: { $nin: reviewedScanIds },
      "analysis.riskTier": { $in: ["high", "critical"] },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return pendingScans.map((scan: any) => ({
      _id: scan._id.toString(),
      modality: scan.modality,
      input: scan.input,
      analysis: scan.analysis,
      userId: scan.userId,
      createdAt: scan.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    return [];
  }
}

export async function markScanAsSafe(scanId: string) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    await connectToDatabase();

    await Feedback.create({
      scanId,
      reviewerId: session.user.id,
      verdict: "false_positive",
      suggestedRiskTier: "safe",
      notes: "Marked as safe by admin review",
    });

    await Scan.findByIdAndUpdate(scanId, {
      "analysis.riskTier": "safe",
      "analysis.riskScore": 0,
    });

    revalidatePath("/admin/review");
    return { success: true };
  } catch (error: any) {
    console.error("Error marking scan as safe:", error);
    return { error: error.message || "Failed to mark as safe" };
  }
}

export async function confirmThreat(scanId: string, notes?: string) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    await connectToDatabase();

    await Feedback.create({
      scanId,
      reviewerId: session.user.id,
      verdict: "true_positive",
      notes: notes || "Confirmed as threat by admin review",
    });

    revalidatePath("/admin/review");
    return { success: true };
  } catch (error: any) {
    console.error("Error confirming threat:", error);
    return { error: error.message || "Failed to confirm threat" };
  }
}

export async function getAdminStats() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return null;
    }

    await connectToDatabase();

    const totalScans = await Scan.countDocuments();
    const pendingReviews = await Scan.countDocuments({
      "analysis.riskTier": { $in: ["high", "critical"] },
    });
    const reviewedToday = await Feedback.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    return {
      totalScans,
      pendingReviews,
      reviewedToday,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return null;
  }
}
