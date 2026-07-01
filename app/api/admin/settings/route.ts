import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Settings from "@/models/Settings";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { whatsappNumber } = await req.json();

  if (!whatsappNumber) {
    return NextResponse.json(
      { error: "WhatsApp number is required" },
      { status: 400 }
    );
  }

  await connectDB();

  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ whatsappNumber });
  } else {
    settings.whatsappNumber = whatsappNumber;
    await settings.save();
  }

  return NextResponse.json({ whatsappNumber: settings.whatsappNumber });
}

