"use server";

import connectToDatabase from "@/lib/db/connect";
import Scan, { IScan } from "@/lib/db/models/scan.model";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { tmpdir } from "os";

const MICROSERVICE_URL =
  process.env.MICROSERVICE_URL || "http://localhost:8000";

const MODEL_MAP: Record<string, string> = {
  email: "cybersectony/phishing-email-detection-distilbert_v2.1",
  url: "darshan8950/phishing_url_detection_BERT",
  file: "heuristic-file-scanner",
  audio: "librosa-spectral-analysis",
  prompt: "protectai/deberta-v3-base-prompt-injection-v2",
};

async function callScanMicroservice(
  modality: string,
  payload: Record<string, unknown>,
) {
  const response = await fetch(`${MICROSERVICE_URL}/scan/${modality}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Scan service returned ${response.status}: ${body}`);
  }

  return await response.json();
}

export async function performScan(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const modality = formData.get("modality") as string;
  const content = formData.get("content") as string;
  const fileObj = formData.get("file") as File | null;

  if (!modality) {
    return { error: "Modality is required" };
  }

  let inputPayload: Record<string, unknown> = {};
  let dbInput: Record<string, unknown> = {};
  let tempFilePath: string | null = null;

  switch (modality) {
    case "email":
    case "prompt":
      if (!content) return { error: "Text content is required." };
      inputPayload = { text: content };
      dbInput = { text: content };
      break;

    case "url":
      if (!content) return { error: "URL is required." };
      inputPayload = { url: content };
      dbInput = { url: content };
      break;

    case "file":
    case "audio": {
      if (fileObj && fileObj.size > 0) {
        const uploadDir = join(tmpdir(), "scam-detection-uploads");
        await mkdir(uploadDir, { recursive: true });
        const ext = fileObj.name.split(".").pop() || "bin";
        tempFilePath = join(uploadDir, `${randomUUID()}.${ext}`);
        const bytes = await fileObj.arrayBuffer();
        await writeFile(tempFilePath, Buffer.from(bytes));

        inputPayload = { file_url: tempFilePath };
        dbInput = {
          fileName: fileObj.name,
          fileSize: fileObj.size,
          mimeType: fileObj.type,
        };
      } else if (content) {
        inputPayload = { text: content };
        dbInput = { fileName: content };
      } else {
        return { error: "A file or filename is required." };
      }
      break;
    }

    default:
      return { error: `Unsupported modality: ${modality}` };
  }

  try {
    await connectToDatabase();

    const startTime = Date.now();
    const analysisResult = await callScanMicroservice(modality, inputPayload);
    const durationMs = Date.now() - startTime;

    const newScan = await Scan.create({
      userId: session.user.id,
      modality,
      input: dbInput,
      analysis: {
        riskScore: analysisResult.risk_score,
        riskTier: analysisResult.risk_tier,
        confidence: analysisResult.confidence,
        signals: analysisResult.signals,
        explanation: analysisResult.explanation,
        analystSummary: analysisResult.analyst_summary,
        recommendedAction: analysisResult.recommended_action,
      },
      processing: {
        model: MODEL_MAP[modality] || "unknown",
        version: "2.0.0",
        durationMs,
      },
      status: "completed",
    });

    revalidatePath("/dashboard");
    revalidatePath("/history");

    return {
      success: true,
      scanId: newScan._id.toString(),
      data: {
        riskScore: newScan.analysis.riskScore,
        riskTier: newScan.analysis.riskTier,
        confidence: newScan.analysis.confidence,
        signals: [...newScan.analysis.signals],
        explanation: newScan.analysis.explanation ?? "",
        analystSummary: newScan.analysis.analystSummary ?? "",
        recommendedAction: newScan.analysis.recommendedAction ?? "",
      },
    };
  } catch (error: any) {
    console.error("Scan Error:", error);
    return { error: error.message || "Failed to process scan." };
  } finally {
    if (tempFilePath) {
      unlink(tempFilePath).catch(() => {});
    }
  }
}

export async function getDashboardStats() {
  const session = await getSession();
  if (!session) return null;

  await connectToDatabase();

  const totalScans = await Scan.countDocuments({ userId: session.user.id });
  const threatsBlocked = await Scan.countDocuments({
    userId: session.user.id,
    "analysis.riskTier": { $in: ["high", "critical"] },
  });

  const criticalCount = await Scan.countDocuments({
    userId: session.user.id,
    "analysis.riskTier": "critical",
  });

  let riskStatus = "Low";
  if (criticalCount > 0) riskStatus = "Critical";
  else if (threatsBlocked > 5) riskStatus = "Medium";

  return {
    totalScans,
    threatsBlocked,
    riskStatus,
    activeProtection: true,
  };
}

export async function getThreatTrends() {
  const session = await getSession();
  if (!session) return [];

  await connectToDatabase();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const pipeline = [
    {
      $match: {
        userId: session.user.id,
        createdAt: { $gte: oneWeekAgo },
        "analysis.riskTier": { $in: ["low", "medium", "high", "critical"] },
      },
    },
    { $group: { _id: "$modality", count: { $sum: 1 } } },
    { $sort: { count: -1 as const } },
  ];

  const results = await Scan.aggregate(pipeline);
  const total = results.reduce((sum: number, r: any) => sum + r.count, 0);

  if (total === 0) return [];

  const labelMap: Record<string, string> = {
    email: "Phishing Emails",
    url: "Malicious Links",
    file: "Fake Files",
    audio: "Deepfakes",
    prompt: "Prompt Injections",
  };

  const colorMap: Record<string, string> = {
    email: "bg-red-500",
    url: "bg-orange-500",
    file: "bg-yellow-500",
    audio: "bg-blue-500",
    prompt: "bg-purple-500",
  };

  return results.map((r: any) => ({
    modality: r._id as string,
    label: labelMap[r._id] || r._id,
    count: r.count as number,
    percentage: Math.round((r.count / total) * 100),
    color: colorMap[r._id] || "bg-gray-500",
  }));
}

export async function getRecentScans() {
  const session = await getSession();
  if (!session) return [];

  await connectToDatabase();

  const scans = await Scan.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return scans.map((scan) => ({
    ...scan,
    _id: scan._id.toString(),
    createdAt: scan.createdAt.toISOString(),
  }));
}

export async function getScanHistory(params?: {
  page?: number;
  limit?: number;
  modality?: string;
  riskTier?: string;
  search?: string;
}) {
  const session = await getSession();
  if (!session)
    return { scans: [], total: 0, page: 1, totalPages: 0, limit: 10 };

  await connectToDatabase();

  const page = Math.max(1, params?.page ?? 1);
  const limit = Math.min(50, Math.max(1, params?.limit ?? 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { userId: session.user.id };

  if (params?.modality && params.modality !== "all") {
    filter.modality = params.modality;
  }
  if (params?.riskTier && params.riskTier !== "all") {
    filter["analysis.riskTier"] = params.riskTier;
  }
  if (params?.search) {
    const searchRegex = new RegExp(params.search, "i");
    filter.$or = [
      { "input.text": searchRegex },
      { "input.url": searchRegex },
      { "input.fileName": searchRegex },
      { "analysis.explanation": searchRegex },
    ];
  }

  const [scans, total] = await Promise.all([
    Scan.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Scan.countDocuments(filter),
  ]);

  return {
    scans: scans.map((scan: any) => ({
      ...scan,
      _id: scan._id.toString(),
      createdAt: scan.createdAt.toISOString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  };
}

export async function getScanById(scanId: string) {
  const session = await getSession();
  if (!session) return null;

  await connectToDatabase();

  const scan = await Scan.findOne({
    _id: scanId,
    userId: session.user.id,
  }).lean();

  if (!scan) return null;

  return {
    ...(scan as any),
    _id: (scan as any)._id.toString(),
    createdAt: (scan as any).createdAt.toISOString(),
    updatedAt: (scan as any).updatedAt?.toISOString?.() ?? null,
  };
}
