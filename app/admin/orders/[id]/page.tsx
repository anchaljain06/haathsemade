import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { notFound } from "next/navigation";
import OrderDetailManager from "@/components/admin/OrderDetailManager";

async function getOrder(id: string) {
  await connectDB();
  return Order.findById(id).populate("userId", "name phone email").lean();
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrder(params.id);
  if (!order) notFound();

  return (
    <div>
      <h1 className="font-heading text-3xl text-foreground mb-6">
        Order #{params.id.slice(-8)}
      </h1>
      <OrderDetailManager order={JSON.parse(JSON.stringify(order))} />
    </div>
  );
}
