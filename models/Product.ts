import mongoose, { Schema, Document } from "mongoose";

export type InventoryMode = "READY_STOCK" | "MADE_TO_ORDER" | "CUSTOM_ONLY";

export interface IProduct extends Document {
  name: string;
  description: string;
  images: string[];
  price: number;
  categoryId: mongoose.Types.ObjectId;
  inventoryMode: InventoryMode;
  isCustomizable: boolean;
  estimatedCraftTime: string;
  stock: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    inventoryMode: {
      type: String,
      enum: ["READY_STOCK", "MADE_TO_ORDER", "CUSTOM_ONLY"],
      required: true,
    },
    isCustomizable: { type: Boolean, default: false },
    estimatedCraftTime: { type: String, default: "" },
    stock: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);