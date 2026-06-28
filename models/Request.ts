import mongoose, { Schema, Document } from "mongoose";

export type RequestStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "NEED_DISCUSSION"
  | "QUOTATION_READY"
  | "REJECTED"
  | "ACCEPTED";

export interface IRequest extends Document {
  userId: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;
  type: "MADE_TO_ORDER" | "CUSTOM_ONLY";
  description: string;
  referenceImages: string[];
  budget?: number;
  neededBy?: Date;
  status: RequestStatus;
  quotedPrice?: number;
  estimatedCraftTime?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    type: {
      type: String,
      enum: ["MADE_TO_ORDER", "CUSTOM_ONLY"],
      required: true,
    },
    description: { type: String, required: true },
    referenceImages: [{ type: String }],
    budget: Number,
    neededBy: Date,
    status: {
      type: String,
      enum: ["SUBMITTED", "UNDER_REVIEW", "NEED_DISCUSSION", "QUOTATION_READY", "REJECTED", "ACCEPTED"],
      default: "SUBMITTED",
    },
    quotedPrice: Number,
    estimatedCraftTime: String,
    adminNotes: String,
  },
  { timestamps: true }
);

export default mongoose.models.Request ||
  mongoose.model<IRequest>("Request", RequestSchema);