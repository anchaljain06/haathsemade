import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Request from "@/models/Request";
import Product from "@/models/Product";
import Link from "next/link";

async function getDashboardData() {
  await connectDB();

  const [
    totalOrders,
    pendingRequests,
    totalProducts,
    revenueAgg,
    recentOrders,
    recentRequests,
  ] = await Promise.all([
    Order.countDocuments(),
    Request.countDocuments({
      status: { $in: ["SUBMITTED", "UNDER_REVIEW", "NEED_DISCUSSION"] },
    }),
    Product.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: "PENDING_CONFIRMATION" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(10).lean(),
    Request.find().sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  return {
    totalOrders,
    pendingRequests,
    totalProducts,
    totalRevenue: revenueAgg[0]?.total ?? 0,
    recentOrders,
    recentRequests,
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const stats = [
    { label: "Total Orders", value: data.totalOrders },
    { label: "Pending Requests", value: data.pendingRequests },
    { label: "Total Products", value: data.totalProducts },
    { label: "Total Revenue", value: `₹${data.totalRevenue.toLocaleString()}` },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-3xl text-foreground">Dashboard</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/products/new"
            className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/requests"
            className="border border-border text-foreground-muted px-4 py-2 rounded-md text-sm font-medium hover:border-primary hover:text-primary transition-colors"
          >
            View Requests
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-lg p-5"
          >
            <p className="text-foreground-muted text-xs mb-2">{s.label}</p>
            <p className="font-heading text-2xl text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading text-lg text-foreground">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-foreground-muted">No orders yet</p>
            ) : (
              data.recentOrders.map((o: any) => (
                <Link
                  key={o._id.toString()}
                  href={`/admin/orders/${o._id}`}
                  className="flex justify-between items-center text-sm border-b border-border pb-2 last:border-0 hover:text-primary"
                >
                  <span className="text-foreground-muted">
                    {o.items.length} item(s) — ₹{o.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-xs bg-background-secondary px-2 py-1 rounded-full">
                    {o.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading text-lg text-foreground">
              Recent Requests
            </h2>
            <Link
              href="/admin/requests"
              className="text-xs text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentRequests.length === 0 ? (
              <p className="text-sm text-foreground-muted">No requests yet</p>
            ) : (
              data.recentRequests.map((r: any) => (
                <Link
                  key={r._id.toString()}
                  href={`/admin/requests/${r._id}`}
                  className="flex justify-between items-center text-sm border-b border-border pb-2 last:border-0 hover:text-primary"
                >
                  <span className="text-foreground-muted line-clamp-1">
                    {r.description.slice(0, 40)}
                  </span>
                  <span className="text-xs bg-background-secondary px-2 py-1 rounded-full shrink-0 ml-2">
                    {r.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
