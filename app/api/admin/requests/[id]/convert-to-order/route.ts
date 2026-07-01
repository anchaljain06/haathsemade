import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Request from "@/models/Request";
import Order from "@/models/Order";
import User from "@/models/User";

export async function POST(
  req: globalThis.Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const requestDoc = await Request.findById(params.id).populate(
    "productId",
    "name images"
  );

  if (!requestDoc) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (!requestDoc.quotedPrice || requestDoc.quotedPrice <= 0) {
    return NextResponse.json(
      { error: "Set a quoted price before converting to an order" },
      { status: 400 }
    );
  }

  const customer = await User.findById(requestDoc.userId);
  const defaultAddress =
    customer?.addresses?.find((a: any) => a.isDefault) ??
    customer?.addresses?.[0] ??
    {};

  const productName =
    (requestDoc.productId as any)?.name ??
    requestDoc.description.slice(0, 50);

  const order = await Order.create({
    userId: requestDoc.userId,
    items: [
      {
        productId: requestDoc.productId ?? requestDoc._id,
        name: productName,
        image: (requestDoc.productId as any)?.images?.[0] ?? "",
        price: requestDoc.quotedPrice,
        quantity: 1,
      },
    ],
    totalAmount: requestDoc.quotedPrice,
    status: "PAYMENT_COMPLETED",
    shippingAddress: defaultAddress,
  });

  requestDoc.status = "ACCEPTED";
  await requestDoc.save();

  return NextResponse.json({ order }, { status: 201 });
}