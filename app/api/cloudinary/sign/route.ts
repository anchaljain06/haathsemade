import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  // Ensure only authenticated admins can sign upload requests
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { paramsToSign } = body;

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string
    );

    return NextResponse.json({ signature });
  } catch (error) {
    return NextResponse.json({ error: "Failed to sign" }, { status: 500 });
  }
}