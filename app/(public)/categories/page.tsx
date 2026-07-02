import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import CategoryCard from "@/components/products/CategoryCard";

async function getCategories() {
  await connectDB();
  return Category.find({ isActive: true }).lean();
}

export const metadata = {
  title: "Browse Categories — Handmade Boutique",
  description: "Explore our handmade collections by category.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl text-foreground mb-3">
          Browse Categories
        </h1>
        <p className="text-foreground-muted">
          Explore our collection by category
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20 text-foreground-muted">
          No categories found.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c: any) => (
            <CategoryCard key={c._id.toString()} category={c} />
          ))}
        </div>
      )}
    </div>
  );
}
