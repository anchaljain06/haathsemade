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

  requestDoc.status = "ACCEPTED";
  await requestDoc.save();

  // Return enough info for the client to add it to cart
  return NextResponse.json({
    request: requestDoc,
    cartItem: {
      productId: requestDoc.productId?.toString() ?? requestDoc._id.toString(),
      name: requestDoc.description.slice(0, 50),
      image: "",
      price: requestDoc.quotedPrice,
      quantity: 1,
    },
  });
}
