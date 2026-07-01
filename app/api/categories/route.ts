import { connectDB } from "@/lib/db"
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function GET(){
  await connectDB();
  try{
    const categories = await Category.find({
      isActive: true,
    }).sort({name: 1});
    return NextResponse.json({categories});
  }
  catch(err){
    return NextResponse.json(
      { error: "Error getting categories" },
      { status: 500 }
    );
  }
}

