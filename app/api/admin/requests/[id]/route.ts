import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Request from "@/models/Request";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { status, quotedPrice, estimatedCraftTime, adminNotes } = body;

  await connectDB();

  const updated = await Request.findByIdAndUpdate(
    params.id,
    {
      ...(status && { status }),
      ...(quotedPrice !== undefined && { quotedPrice }),
      ...(estimatedCraftTime && { estimatedCraftTime }),
      ...(adminNotes && { adminNotes }),
    },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  return NextResponse.json({ request: updated });
}