"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, Heart } from "lucide-react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { BRAND } from "@/lib/brand";
import { useHydrated } from "@/hooks/useHydrated";
import SearchBox from "@/components/layout/SearchBox";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/gallery", label: "Gallery" },
  { href: "/custom-orders", label: "Custom Orders" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems);
  const savedCount = useWishlistStore((s) => s.items.length);

  // The cart is persisted in localStorage, so the server renders 0 while the
  // client rehydrates a real count. Gate the badge on hydration so both renders
  // agree and React doesn't report a mismatch.
  const hydrated = useHydrated();

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="font-heading text-xl text-foreground">
            {BRAND.name}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors hover:text-primary ${
                  pathname === link.href
                    ? "text-primary font-medium"
                    : "text-foreground-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search — desktop */}
          <div className="hidden lg:block flex-1 max-w-xs mx-6">
            <SearchBox />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative p-2"
            >
              <Heart className="w-5 h-5 text-foreground-muted hover:text-primary transition-colors" />
              {hydrated && savedCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-primary text-white border-0">
                  {savedCount}
                </Badge>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" aria-label="Cart" className="relative p-2">
              <ShoppingCart className="w-5 h-5 text-foreground-muted hover:text-primary transition-colors" />
              {hydrated && totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-primary text-white border-0">
                  {totalItems}
                </Badge>
              )}
            </Link>

            {/* Auth */}
            {isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="w-8 h-8 cursor-pointer">
                    <AvatarFallback className="bg-primary text-white text-xs">
                      {user?.firstName?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/requests">My Requests</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <SignOutButton>
                    <DropdownMenuItem className="text-destructive cursor-pointer">
                      Sign Out
                    </DropdownMenuItem>
                  </SignOutButton>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="text-sm bg-primary text-white px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <button className="p-2">
                  <Menu className="w-5 h-5 text-foreground-muted" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-background">
                <div className="mt-8">
                  <SearchBox />
                </div>
                <div className="flex flex-col gap-6 mt-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`text-base transition-colors hover:text-primary ${
                        pathname === link.href
                          ? "text-primary font-medium"
                          : "text-foreground-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}