import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import ProductForm from "@/components/admin/ProductForm";

async function getCategories() {
  await connectDB();
  return Category.find({ isActive: true }).lean();
}

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-heading text-3xl text-foreground mb-6">
        Add New Product
      </h1>
      <ProductForm categories={JSON.parse(JSON.stringify(categories))} />
    </div>
  );
}
