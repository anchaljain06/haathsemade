import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import CategoriesManager from "@/components/admin/CategoriesManager";

async function getCategories() {
  await connectDB();
  return Category.find().sort({ createdAt: -1 }).lean();
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-heading text-3xl text-foreground mb-6">
        Categories
      </h1>
      <CategoriesManager
        initialCategories={JSON.parse(JSON.stringify(categories))}
      />
    </div>
  );
}
