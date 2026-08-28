import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Request from "@/models/Request";
import Order from "@/models/Order";
import User from "@/models/User";

export async function POST(
  req: globalThis.Request,
  props: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;

  // Without this a malformed id reaches findById and throws a CastError,
  // which surfaces as a 500 rather than a 400.
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
  }

  await connectDB();

  const requestDoc = await Request.findById(id).populate(
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

  if (!customer) {
    return NextResponse.json(
      { error: "The customer who made this request no longer exists" },
      { status: 409 }
    );
  }

  // No `?? {}` fallback here: Mongoose's `required` on an Object path is
  // satisfied by an empty object, so falling back would happily create a
  // PAYMENT_COMPLETED order with nowhere to ship it.
  const defaultAddress =
    customer.addresses?.find((a: any) => a.isDefault) ?? customer.addresses?.[0];

  if (!defaultAddress) {
    return NextResponse.json(
      {
        error:
          "This customer has no saved delivery address — ask them to add one before converting.",
      },
      { status: 409 }
    );
  }

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
    shippingAddress: defaultAddress.toObject(),
  });

  requestDoc.status = "ACCEPTED";
  await requestDoc.save();

  return NextResponse.json({ order }, { status: 201 });
}
