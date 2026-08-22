import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { parseBody } from "@/lib/validate";
import { adminOrderUpdateSchema } from "@/schemas/zodValidations";
import Order from "@/models/Order";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const parsed = await parseBody(req, adminOrderUpdateSchema);
  if (parsed.response) return parsed.response;

  await connectDB();

  const updated = await Order.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true, runValidators: true }
  );

  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order: updated });
}
