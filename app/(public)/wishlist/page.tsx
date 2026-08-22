import { BRAND } from "@/lib/brand";
import WishlistContents from "@/components/products/WishlistContents";

export const metadata = {
  title: `Your Wishlist — ${BRAND.name}`,
  description: "The handmade pieces you've saved for later.",
  // A personal, device-local list — nothing for search engines here.
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <WishlistContents />
    </div>
  );
}
