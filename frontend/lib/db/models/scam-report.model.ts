import mongoose, { Schema, Document, Model } from "mongoose";

export interface IScamReport extends Document {
  userId: string;
  scamType:
    | "phishing"
    | "smishing"
    | "vishing"
    | "website"
    | "social"
    | "other";
  severity: "attempt" | "info_loss" | "monetary_loss" | "system_compromise";
  scammerContact?: string;
  relatedUrl?: string;
  description: string;
  status: "pending" | "reviewed" | "resolved";
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScamReportSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    scamType: {
      type: String,
      required: true,
      enum: ["phishing", "smishing", "vishing", "website", "social", "other"],
    },
    severity: {
      type: String,
      required: true,
      enum: ["attempt", "info_loss", "monetary_loss", "system_compromise"],
    },
    scammerContact: { type: String },
    relatedUrl: { type: String },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
    reviewedBy: { type: String },
    reviewNotes: { type: String },
  },
  {
    timestamps: true,
  },
);

const ScamReport: Model<IScamReport> =
  mongoose.models.ScamReport ||
  mongoose.model<IScamReport>("ScamReport", ScamReportSchema);

export default ScamReport;
