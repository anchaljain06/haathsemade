import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Link from "next/link";
import ProductsTable from "@/components/admin/ProductsTable";

async function getProducts() {
  await connectDB();
  const [products, categories] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).populate("categoryId", "name").lean(),
    Category.find().lean(),
  ]);
  return { products, categories };
}

export default async function AdminProductsPage() {
  const { products, categories } = await getProducts();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-3xl text-foreground">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Add Product
        </Link>
      </div>

      <ProductsTable
        products={JSON.parse(JSON.stringify(products))}
        categories={JSON.parse(JSON.stringify(categories))}
      />
    </div>
  );
}
