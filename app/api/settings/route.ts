import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";

export async function GET() {
  await connectDB();
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ whatsappNumber: "" });
  }
  return NextResponse.json({ whatsappNumber: settings.whatsappNumber });
}