import mongoose, { Schema, Document } from "mongoose";

export type OrderStatus =
  | "PAYMENT_COMPLETED"
  | "CRAFTING"
  | "QUALITY_CHECK"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: object;
  paymentId: string;
  razorpayOrderId: string;
  courierName?: string;
  trackingUrl?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  name: String,
  image: String,
  price: Number,
  quantity: Number,
});

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PAYMENT_COMPLETED", "CRAFTING", "QUALITY_CHECK", "PACKED", "SHIPPED", "DELIVERED"],
      default: "PAYMENT_COMPLETED",
    },
    shippingAddress: { type: Object, required: true },
    paymentId: { type: String, default: "" },
    razorpayOrderId: { type: String, default: "" },
    courierName: String,
    trackingUrl: String,
    estimatedDelivery: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);