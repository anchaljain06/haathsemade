import mongoose, { Schema, Document } from "mongoose";

export interface IAddress {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  clerkId: string;
  name: string;
  phone: string;
  email: string;
  addresses: IAddress[];
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  label: { type: String, default: "Home" },
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    email: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    addresses: [AddressSchema],
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);