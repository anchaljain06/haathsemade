"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OrderItem {
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: any;
  courierName?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  userId?: { name: string; phone: string; email: string };
}

const statusOptions = [
  "PENDING_CONFIRMATION",
  "PAYMENT_COMPLETED",
  "CRAFTING",
  "QUALITY_CHECK",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function OrderDetailManager({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [courierName, setCourierName] = useState(order.courierName ?? "");
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl ?? "");
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order.estimatedDelivery?.slice(0, 10) ?? ""
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          courierName: courierName || undefined,
          trackingUrl: trackingUrl || undefined,
          estimatedDelivery: estimatedDelivery || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Order updated");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const whatsappLink = order.userId?.phone
    ? `https://wa.me/${order.userId.phone}?text=${encodeURIComponent(
        `Hi ${order.userId.name}, regarding your order...`
      )}`
    : null;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        {/* Items */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-heading text-lg text-foreground mb-4">Items</h2>
          {order.items.map((item, i) => (
            <div
              key={i}
              className="flex justify-between text-sm py-2 border-b border-border last:border-0"
            >
              <span className="text-foreground-muted">
                {item.name} × {item.quantity}
              </span>
              <span className="text-foreground font-medium">
                ₹{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between text-sm pt-3 mt-2 border-t border-border font-medium">
            <span>Total</span>
            <span>₹{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Customer */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-heading text-lg text-foreground mb-3">
            Customer
          </h2>
          <p className="text-sm text-foreground-muted">
            {order.userId?.name} · {order.userId?.phone} · {order.userId?.email}
          </p>
        </div>

        {/* Shipping Address */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-heading text-lg text-foreground mb-3">
            Shipping Address
          </h2>
          <p className="text-sm text-foreground-muted">
            {order.shippingAddress?.line1}, {order.shippingAddress?.line2}
            <br />
            {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
            {order.shippingAddress?.pincode}
          </p>
        </div>
      </div>

      {/* Status Management */}
      <div className="bg-card border border-border rounded-lg p-5 h-fit space-y-4">
        <h2 className="font-heading text-lg text-foreground">
          Order Status
        </h2>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-border rounded-md px-3 py-2 text-sm"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        {status === "SHIPPED" && (
          <>
            <input
              placeholder="Courier name"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
            />
            <input
              placeholder="Tracking URL"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
            />
          </>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-white py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="block w-full text-center border border-green-300 text-green-700 py-2.5 rounded-md text-sm font-medium hover:bg-green-50 transition-colors"
          >
            Open WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
