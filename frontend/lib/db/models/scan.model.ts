import mongoose, { Schema, Document, Model } from "mongoose";

export interface IScan extends Document {
  userId?: string;
  modality: "email" | "url" | "file" | "audio" | "prompt";
  input: {
    text?: string;
    url?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
  analysis: {
    riskScore: number;
    riskTier: "safe" | "low" | "medium" | "high" | "critical";
    confidence: number;
    signals: string[];
    explanation?: string;
    analystSummary?: string;
    recommendedAction?: string;
  };
  processing: {
    model: string;
    version: string;
    durationMs: number;
  };
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScanSchema: Schema = new Schema(
  {
    userId: { type: String, index: true },
    modality: {
      type: String,
      required: true,
      enum: ["email", "url", "file", "audio", "prompt"],
    },
    input: {
      text: { type: String },
      url: { type: String },
      fileUrl: { type: String },
      fileName: { type: String },
      fileSize: { type: Number },
      mimeType: { type: String },
    },
    analysis: {
      riskScore: { type: Number, min: 0, max: 100 },
      riskTier: {
        type: String,
        enum: ["safe", "low", "medium", "high", "critical"],
      },
      confidence: { type: Number, min: 0, max: 1 },
      signals: [{ type: String }],
      explanation: { type: String },
      analystSummary: { type: String },
      recommendedAction: { type: String },
    },
    processing: {
      model: { type: String },
      version: { type: String },
      durationMs: { type: Number },
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    errorMessage: { type: String },
  },
  {
    timestamps: true,
  },
);

ScanSchema.index({ userId: 1, createdAt: -1 });

ScanSchema.index({ "analysis.riskTier": 1, createdAt: -1 });

const Scan: Model<IScan> =
  mongoose.models.Scan || mongoose.model<IScan>("Scan", ScanSchema);

export default Scan;
