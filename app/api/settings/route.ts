import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";

export async function GET() {
  try {
    await connectDB();

    // Read-only: this endpoint is public, so it must never create documents.
    const settings = await Settings.findOne()
      .select("whatsappNumber")
      .lean<{ whatsappNumber?: string }>();

    return NextResponse.json({ whatsappNumber: settings?.whatsappNumber ?? "" });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
