import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import User from "@/models/User";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ addresses: user.addresses ?? [] });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const newAddress = await req.json();

  await connectDB();

  // If marked default, unset previous defaults
  if (newAddress.isDefault) {
    user.addresses.forEach((a: any) => (a.isDefault = false));
  }

  user.addresses.push(newAddress);
  await user.save();

  return NextResponse.json({ addresses: user.addresses });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { index } = await req.json();

  await connectDB();
  user.addresses.splice(index, 1);
  await user.save();

  return NextResponse.json({ addresses: user.addresses });
}
