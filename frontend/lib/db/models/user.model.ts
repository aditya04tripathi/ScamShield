import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  bio?: string;
  role: "user" | "admin" | "analyst";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false },
    firstName: { type: String },
    lastName: { type: String },
    bio: { type: String },
    imageUrl: { type: String },
    role: {
      type: String,
      enum: ["user", "admin", "analyst"],
      default: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
