import Link from "next/link";
import Image from "next/image";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group relative aspect-square rounded-lg overflow-hidden bg-background-secondary border border-border hover:shadow-hover transition-shadow"
    >
      {category.image ? (
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full bg-background-secondary" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="font-heading text-white text-sm">{category.name}</h3>
      </div>
    </Link>
  );
}
