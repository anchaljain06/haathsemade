import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const {name, description, image, price, categoryId, inventoryMode, isCustomizable, estimatedCraftTime, stock, isPublished} = body;

  if(!name || !description || !categoryId || !inventoryMode){
    return NextResponse.json({ error : "Empty fields"}, {status: 400});
  }

  if(price <= 0){
    return NextResponse.json({error: "Price should be greater than 0"}, {status: 400});
  }

  await connectDB();

  const category = await Category.findById(categoryId);
  if(!category){
    return NextResponse.json({error: "Category not found"}, {status: 404});
  }
  
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const productData = { ...body, slug };

  const product = await Product.create(productData);
  return NextResponse.json({ product }, { status: 201 });
}
