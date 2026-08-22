import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { parseBody } from "@/lib/validate";
import { addressSchema, deleteAddressSchema } from "@/schemas/zodValidations";

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

  const parsed = await parseBody(req, addressSchema);
  if (parsed.response) return parsed.response;
  const newAddress = parsed.data;

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

  const parsed = await parseBody(req, deleteAddressSchema);
  if (parsed.response) return parsed.response;
  const { index } = parsed.data;

  await connectDB();

  // Guard the upper bound too: splice() would silently no-op past the end,
  // and a negative index (rejected by the schema) would delete from the tail.
  if (index >= user.addresses.length) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  user.addresses.splice(index, 1);
  await user.save();

  return NextResponse.json({ addresses: user.addresses });
}
