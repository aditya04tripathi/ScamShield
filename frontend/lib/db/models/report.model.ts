import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReport extends Document {
  type:
    | "training_insight"
    | "pattern_cluster"
    | "threat_brief"
    | "escalation_note";
  title: string;
  content: string;
  generatedBy: string;
  relatedScans?: mongoose.Types.ObjectId[];
  metadata?: {
    periodStart?: Date;
    periodEnd?: Date;
    signalCount?: number;
    riskDistribution?: Record<string, number>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "training_insight",
        "pattern_cluster",
        "threat_brief",
        "escalation_note",
      ],
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    generatedBy: { type: String },
    relatedScans: [{ type: Schema.Types.ObjectId, ref: "Scan" }],
    metadata: {
      periodStart: { type: Date },
      periodEnd: { type: Date },
      signalCount: { type: Number },
      riskDistribution: { type: Map, of: Number },
    },
  },
  {
    timestamps: true,
  },
);

const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);

export default Report;
