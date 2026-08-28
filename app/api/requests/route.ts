import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { parseBody } from "@/lib/validate";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { createRequestSchema } from "@/schemas/zodValidations";
import Request from "@/models/Request";

export async function POST(req: globalThis.Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.phone) {
    return NextResponse.json({ error: "PHONE_REQUIRED" }, { status: 403 });
  }

  // Tighter window than orders: every custom request turns into manual work
  // over WhatsApp, so a flood costs real time rather than just rows.
  const limit = await rateLimit(`requests:${user._id}`, 5, 600_000);
  if (!limit.ok) {
    return rateLimitResponse(
      limit,
      "Too many requests submitted just now. Please wait a few minutes and try again."
    );
  }
  
  const parsed = await parseBody(req, createRequestSchema);
  if (parsed.response) return parsed.response;
  const { type, productId, description, referenceLinks, budget, neededBy } =
    parsed.data;

  await connectDB();

  const newRequest = await Request.create({
    userId: user._id,
    productId: productId || undefined,
    type,
    description,
    referenceLinks: referenceLinks ?? [],
    budget: budget || undefined,
    neededBy: neededBy || undefined,
  });

  return NextResponse.json({ request: newRequest }, { status: 201 });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const requests = await Request.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .populate("productId", "name images")
    .lean();

  return NextResponse.json({ requests });
}
