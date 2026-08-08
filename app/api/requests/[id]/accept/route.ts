import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Request from "@/models/Request";

export async function PATCH(
  req: globalThis.Request,
  props: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  await connectDB();

  const requestDoc = await Request.findOne({
    _id: id,
    userId: user._id,
  });

  if (!requestDoc) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (requestDoc.status !== "QUOTATION_READY") {
    return NextResponse.json(
      { error: "Request is not ready to be accepted" },
      { status: 400 }
    );
  }

  if (!requestDoc.quotedPrice || requestDoc.quotedPrice <= 0) {
    return NextResponse.json(
      { error: "This request has no price quoted yet" },
      { status: 409 }
    );
  }

  requestDoc.status = "ACCEPTED";
  await requestDoc.save();

  // Return enough info for the client to add it to cart. The cart is keyed by
  // requestId, not productId — checkout re-reads quotedPrice server-side, so
  // the price below is for display only.
  return NextResponse.json({
    request: requestDoc,
    cartItem: {
      requestId: requestDoc._id.toString(),
      name: requestDoc.description.slice(0, 50),
      image: "",
      price: requestDoc.quotedPrice,
      quantity: 1,
    },
  });
}
