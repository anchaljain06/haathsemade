import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Order from "@/models/Order";
import { redirect } from "next/navigation";
import Link from "next/link";

const statusSteps = [
  "PAYMENT_COMPLETED",
  "CRAFTING",
  "QUALITY_CHECK",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
];

const statusLabels: Record<string, string> = {
  PAYMENT_COMPLETED: "Payment Completed",
  CRAFTING: "Crafting",
  QUALITY_CHECK: "Quality Check",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

async function getOrders() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await connectDB();
  return Order.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
}

export default async function OrdersPage() {
  const orders = await getOrders();

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-heading text-3xl text-foreground mb-3">
          No Orders Yet
        </h1>
        <p className="text-foreground-muted mb-8">
          Your placed orders will show up here.
        </p>
        <Link
          href="/products"
          className="bg-primary text-white px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-heading text-3xl text-foreground mb-8">
        My Orders
      </h1>

      <div className="space-y-4">
        {orders.map((order: any) => {
          const currentIndex = statusSteps.indexOf(order.status);
          return (
            <div
              key={order._id.toString()}
              className="bg-card border border-border rounded-lg p-5"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-foreground-muted">
                    Order placed{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-foreground font-medium mt-1">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}{" "}
                    — ₹{order.totalAmount.toLocaleString()}
                  </p>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  {statusLabels[order.status]}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center mb-4">
                {statusSteps.map((step, i) => (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        i <= currentIndex ? "bg-primary" : "bg-border"
                      }`}
                    />
                    {i < statusSteps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 ${
                          i < currentIndex ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Items */}
              <div className="space-y-1 mb-3">
                {order.items.map((item: any, i: number) => (
                  <p key={i} className="text-xs text-foreground-muted">
                    {item.name} × {item.quantity}
                  </p>
                ))}
              </div>

              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Track Shipment →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
