import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductCard from "@/components/products/ProductCard";
import ProductFilters from "@/components/products/ProductFilters";
import Pagination from "@/components/products/Pagination";
import { serialize } from "@/lib/serialize";
import { BRAND } from "@/lib/brand";
import type { QueryFilter } from "mongoose";
import type { IProduct } from "@/models/Product";
import { parseInventoryMode, substringSearchFilter } from "@/lib/productSearch";
import { Suspense } from "react";

const PAGE_SIZE = 12;

const CARD_FIELDS =
  "name slug price images inventoryMode estimatedCraftTime stock isCustomizable description";

interface SearchParams {
  category?: string;
  mode?: string;
  sort?: string;
  page?: string;
  q?: string;
}

export const metadata = {
  title: `All Products — ${BRAND.name}`,
  description: BRAND.description,
};

async function getProducts(params: SearchParams) {
  await connectDB();

  const query: QueryFilter<IProduct> = { isPublished: true };
  const mode = parseInventoryMode(params.mode);
  if (mode) query.inventoryMode = mode;

  // Applied at query time, not stored on `query`, so the substring fallback
  // below can reuse the same filters without it.
  const search = params.q?.trim();

  if (params.category) {
    // isActive matters: a deactivated category must stop filtering, not keep
    // quietly narrowing the catalogue.
    const cat = await Category.findOne({
      slug: params.category,
      isActive: true,
    })
      .select("_id")
      .lean();

    // An unknown category should return nothing, not silently show everything.
    if (!cat) {
      const categories = await Category.find({ isActive: true })
        .select("name slug")
        .lean();
      return {
        products: [],
        total: 0,
        categories: serialize(categories),
        page: 1,
        totalPages: 0,
      };
    }
    query.categoryId = (cat as any)._id;
  }

  let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
  if (params.sort === "price_asc") sortQuery = { price: 1 };
  if (params.sort === "price_desc") sortQuery = { price: -1 };

  const parsedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const skip = (page - 1) * PAGE_SIZE;

  const run = (filter: QueryFilter<IProduct>) =>
    Promise.all([
      Product.find(filter)
        .select(CARD_FIELDS)
        .sort(sortQuery)
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean(),
      Product.countDocuments(filter),
    ]);

  const [[products, total], categories] = await Promise.all([
    run(search ? { ...query, $text: { $search: search } } : query),
    Category.find({ isActive: true }).select("name slug").lean(),
  ]);

  // Whole-word $text found nothing — retry as a substring match so "bouq"
  // still turns up "bouquet".
  const [finalProducts, finalTotal] =
    search && total === 0
      ? await run({ ...query, ...substringSearchFilter(search) })
      : [products, total];

  return {
    products: serialize(finalProducts),
    total: finalTotal,
    categories: serialize(categories),
    page,
    totalPages: Math.ceil(finalTotal / PAGE_SIZE),
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { products, total, categories, page, totalPages } =
    await getProducts(params);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-heading text-4xl text-foreground mb-2">
          {params.q ? `Results for “${params.q}”` : "All Products"}
        </h1>
        <p className="text-foreground-muted text-sm">
          {total} {total === 1 ? "item" : "items"} found
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-56 shrink-0">
          <Suspense
            fallback={
              <div className="text-sm text-foreground-muted">
                Loading filters...
              </div>
            }
          >
            <ProductFilters
              categories={categories as any}
              currentCategory={params.category}
              currentMode={params.mode}
              currentSort={params.sort}
            />
          </Suspense>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-heading text-xl text-foreground mb-2">
                Nothing here yet
              </p>
              <p className="text-foreground-muted text-sm">
                {params.q
                  ? "Try a different search term, or browse all products."
                  : "Try adjusting your filters."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((p: any, i: number) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    priority={i < 3}
                  />
                ))}
              </div>

              <Suspense fallback={null}>
                <Pagination page={page} totalPages={totalPages} />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
