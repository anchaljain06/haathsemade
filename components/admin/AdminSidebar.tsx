"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  MessageSquareText,
  Images,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { SignOutButton } from "@clerk/nextjs";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/requests", label: "Requests", icon: MessageSquareText },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border flex items-center justify-between px-4 h-14">
        <span className="font-heading text-lg text-foreground">Admin</span>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? (
            <X className="w-5 h-5 text-foreground" />
          ) : (
            <Menu className="w-5 h-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-card border-r border-border w-60 shrink-0 md:flex flex-col fixed md:static top-14 md:top-0 bottom-0 left-0 z-30 transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="hidden md:block p-6 border-b border-border">
          <span className="font-heading text-xl text-foreground">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "text-foreground-muted hover:bg-background-secondary"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <SignOutButton>
            <button className="text-sm text-destructive hover:opacity-70">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Spacer for mobile fixed top bar */}
      <div className="md:hidden h-14" />
    </>
  );
}
