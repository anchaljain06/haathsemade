import mongoose, { Schema, Document } from "mongoose";

export interface IGalleryItem extends Document {
  image: string;
  title?: string;
  type: "INSPIRATION" | "CUSTOMER_MEMORY";
  isApproved: boolean;
  submittedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    image: { type: String, required: true },
    title: String,
    type: {
      type: String,
      enum: ["INSPIRATION", "CUSTOMER_MEMORY"],
      default: "INSPIRATION",
    },
    isApproved: { type: Boolean, default: false },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Public gallery: approved items by type, newest first.
GalleryItemSchema.index({ isApproved: 1, type: 1, createdAt: -1 });

export default mongoose.models.GalleryItem ||
  mongoose.model<IGalleryItem>("GalleryItem", GalleryItemSchema);