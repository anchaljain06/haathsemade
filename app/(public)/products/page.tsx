import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductCard from "@/components/products/ProductCard";
import ProductFilters from "@/components/products/ProductFilters";
import { Suspense } from "react";

interface SearchParams {
  category?: string;
  mode?: string;
  sort?: string;
  page?: string;
}

async function getProducts(params: SearchParams) {
  await connectDB();

  const query: any = { isPublished: true };
  if (params.mode) query.inventoryMode = params.mode;

  if (params.category) {
    const cat = await Category.findOne({ slug: params.category });
    if (cat) query.categoryId = cat._id;
  }

  let sortQuery: any = { createdAt: -1 };
  if (params.sort === "price_asc") sortQuery = { price: 1 };
  if (params.sort === "price_desc") sortQuery = { price: -1 };

  const page = parseInt(params.page ?? "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const [products, total, categories] = await Promise.all([
    Product.find(query).sort(sortQuery).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
    Category.find({ isActive: true }).lean(),
  ]);

  return { products, total, categories, page, totalPages: Math.ceil(total / limit) };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { products, total, categories, page, totalPages } =
    await getProducts(searchParams);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-heading text-4xl text-foreground mb-2">
          All Products
        </h1>
        <p className="text-foreground-muted text-sm">{total} items found</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-56 shrink-0">
          <Suspense fallback={<div className="text-sm text-foreground-muted">Loading filters...</div>}>
            <ProductFilters
              categories={categories as any}
              currentCategory={searchParams.category}
              currentMode={searchParams.mode}
              currentSort={searchParams.sort}
            />
          </Suspense>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20 text-foreground-muted">
              No products found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((p: any) => (
                  <ProductCard key={p._id.toString()} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <a
                        key={n}
                        href={`?page=${n}`}
                        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm border transition-colors ${
                          n === page
                            ? "bg-primary text-white border-primary"
                            : "border-border text-foreground-muted hover:border-primary hover:text-primary"
                        }`}
                      >
                        {n}
                      </a>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
