import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Order from "@/models/Order";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.phone) {
    return NextResponse.json({ error: "PHONE_REQUIRED" }, { status: 403 });
  }
  
  const { items, totalAmount, shippingAddress } = await req.json();

  if (!items?.length || !totalAmount || !shippingAddress) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  await connectDB();

  const order = await Order.create({
    userId: user._id,
    items,
    totalAmount,
    shippingAddress,
    status: "PENDING_CONFIRMATION",
  });

  return NextResponse.json({ order }, { status: 201 });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const orders = await Order.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ orders });
}
