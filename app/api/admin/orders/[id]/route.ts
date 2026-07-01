import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Order from "@/models/Order";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { status, courierName, trackingUrl, estimatedDelivery } = body;

  await connectDB();

  const updated = await Order.findByIdAndUpdate(
    params.id,
    {
      ...(status && { status }),
      ...(courierName && { courierName }),
      ...(trackingUrl && { trackingUrl }),
      ...(estimatedDelivery && { estimatedDelivery }),
    },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order: updated });
}