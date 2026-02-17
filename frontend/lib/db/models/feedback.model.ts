import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeedback extends Document {
  scanId: mongoose.Types.ObjectId;
  reviewerId: string;
  verdict:
    | "true_positive"
    | "false_positive"
    | "true_negative"
    | "false_negative"
    | "uncertain";
  suggestedRiskTier?: "safe" | "low" | "medium" | "high" | "critical";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema(
  {
    scanId: {
      type: Schema.Types.ObjectId,
      ref: "Scan",
      required: true,
      index: true,
    },
    reviewerId: { type: String, required: true },
    verdict: {
      type: String,
      enum: [
        "true_positive",
        "false_positive",
        "true_negative",
        "false_negative",
        "uncertain",
      ],
      required: true,
    },
    suggestedRiskTier: {
      type: String,
      enum: ["safe", "low", "medium", "high", "critical"],
    },
    notes: { type: String },
  },
  {
    timestamps: true,
  },
);

const Feedback: Model<IFeedback> =
  mongoose.models.Feedback ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);

export default Feedback;
