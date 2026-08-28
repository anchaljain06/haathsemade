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
  /** Google's `sub`. The durable identity key post-Clerk. */
  googleId?: string;
  /**
   * Legacy Clerk id, kept only so accounts created before the Google OAuth
   * migration stay recognisable. Nothing writes it any more.
   */
  clerkId?: string;
  name: string;
  phone: string;
  email: string;
  image?: string;
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
    // Both id fields are sparse: a document has one or the other, and a plain
    // `unique` index would treat every missing value as a duplicate null.
    googleId: { type: String, unique: true, sparse: true },
    clerkId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    email: { type: String, required: true, lowercase: true, trim: true },
    image: { type: String, default: "" },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    addresses: [AddressSchema],
  },
  { timestamps: true }
);

// Sign-in falls back to an email match for accounts that predate googleId
// (auth.ts), and `findOne` returns an arbitrary match — so a duplicate email
// would attach a returning customer to whichever document Mongo happened to
// hand back. Verified duplicate-free before making this unique.
//
// NOTE: Mongoose will not convert an existing index to different options; it
// calls createIndex and gets an IndexOptionsConflict it does not surface
// loudly. Changing these options requires dropping the old index first — see
// scripts/fix-user-indexes.mjs.
UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);