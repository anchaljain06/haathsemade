import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { parseBody } from "@/lib/validate";
import { adminOrderUpdateSchema } from "@/schemas/zodValidations";
import Order from "@/models/Order";
import { releaseStock } from "@/lib/stock";
import { revalidatePath } from "next/cache";

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

  // Cancelling has a side effect the other transitions do not: the units this
  // order took out of stock have to go back on the shelf. An order sits in
  // PENDING_CONFIRMATION until payment is confirmed over WhatsApp, and until
  // then it is holding inventory nobody has paid for.
  if (parsed.data.status === "CANCELLED") {
    // Claim the release and apply the update in one conditional write, so two
    // admins cancelling the same order cannot both hand the stock back. Only
    // the write that matches `stockReleasedAt: null` proceeds.
    const claimed = await Order.findOneAndUpdate(
      { _id: id, stockReleasedAt: { $in: [null, undefined] } },
      { $set: { ...parsed.data, stockReleasedAt: new Date() } },
      { new: true, runValidators: true }
    );

    if (claimed) {
      await releaseStock(claimed.reservedStock ?? []);
      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${id}`);
      revalidatePath("/products");
      return NextResponse.json({ order: claimed });
    }
    // Fell through: either the order is gone, or its stock was already
    // released. A plain update below covers both — it 404s on the first and
    // is a harmless no-op re-cancel on the second.
  }

  const updated = await Order.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true, runValidators: true }
  );

  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);

  return NextResponse.json({ order: updated });
}
