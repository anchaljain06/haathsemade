import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  whatsappNumber: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    whatsappNumber: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);