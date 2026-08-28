import mongoose, { Schema, Document } from "mongoose";

export type OrderStatus =
  | "PENDING_CONFIRMATION"
  | "PAYMENT_COMPLETED"
  | "CRAFTING"
  | "QUALITY_CHECK"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

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
  /**
   * What this order actually took out of stock, recorded at creation.
   *
   * Only READY_STOCK lines decrement, and the order items themselves do not
   * carry inventoryMode — so without this there is no way to know what to give
   * back on a cancel, and reading inventoryMode later would be wrong if it
   * changed in the meantime.
   */
  reservedStock: { productId: mongoose.Types.ObjectId; quantity: number }[];
  /** Set once, when the reserved units are handed back. Guards double-release. */
  stockReleasedAt?: Date;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: object;
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
    reservedStock: [
      {
        _id: false,
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
      },
    ],
    stockReleasedAt: Date,
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "PENDING_CONFIRMATION",
        "PAYMENT_COMPLETED",
        "CRAFTING",
        "QUALITY_CHECK",
        "PACKED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PENDING_CONFIRMATION",
    },
    shippingAddress: { type: Object, required: true },
    courierName: String,
    trackingUrl: String,
    estimatedDelivery: Date,
  },
  { timestamps: true }
);

// "My orders", newest first.
OrderSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);