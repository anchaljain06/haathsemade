import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: {slug: string}}){
  await connectDB();
  const product = await Product.findOne({ slug: params.slug }).populate("categoryId", "name");

  if(!product || product.isPublished === false){
    return NextResponse.json(
      {error: 'Not Found'},
      {status: 404});
  }
  
  return NextResponse.json({ product });
}