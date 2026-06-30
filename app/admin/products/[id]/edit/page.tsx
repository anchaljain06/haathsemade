import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import ProductForm from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

async function getData(id: string) {
  await connectDB();
  const [product, categories] = await Promise.all([
    Product.findById(id).lean(),
    Category.find({ isActive: true }).lean(),
  ]);
  return { product, categories };
}

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { product, categories } = await getData(params.id);
  if (!product) notFound();

  const p = product as any;
  const initialData = {
    _id: p._id.toString(),
    name: p.name,
    description: p.description,
    images: p.images,
    price: p.price,
    categoryId: p.categoryId.toString(),
    inventoryMode: p.inventoryMode,
    isCustomizable: p.isCustomizable,
    estimatedCraftTime: p.estimatedCraftTime,
    stock: p.stock,
    isPublished: p.isPublished,
  };

  return (
    <div>
      <h1 className="font-heading text-3xl text-foreground mb-6">
        Edit Product
      </h1>
      <ProductForm
        categories={JSON.parse(JSON.stringify(categories))}
        initialData={initialData}
      />
    </div>
  );
}
