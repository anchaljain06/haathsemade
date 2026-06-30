import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import OrdersTable from "@/components/admin/OrdersTable";

async function getOrders() {
  await connectDB();
  return Order.find()
    .sort({ createdAt: -1 })
    .populate("userId", "name phone email")
    .lean();
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div>
      <h1 className="font-heading text-3xl text-foreground mb-6">Orders</h1>
      <OrdersTable orders={JSON.parse(JSON.stringify(orders))} />
    </div>
  );
}
