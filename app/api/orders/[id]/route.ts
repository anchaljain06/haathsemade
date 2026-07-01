import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Order from "@/models/Order";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;

  await connectDB();

  const order = await Order.findById(id);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.userId.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Unauthorized access to order" }, { status: 403 });
  }

  return NextResponse.json({ order });
}
