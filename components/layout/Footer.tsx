import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-background-secondary border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-heading text-lg text-foreground mb-3">
              Handmade Boutique
            </h3>
            <p className="text-foreground-muted text-sm leading-relaxed mb-4">
              Every piece crafted with love and care, made just for you.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-foreground-muted hover:text-primary text-sm transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noreferrer"
                className="text-foreground-muted hover:text-primary text-sm transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Explore
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/products", label: "Products" },
                { href: "/gallery", label: "Gallery" },
                { href: "/custom-orders", label: "Custom Orders" },
                { href: "/about", label: "About Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-muted hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Account
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/orders", label: "My Orders" },
                { href: "/requests", label: "My Requests" },
                { href: "/profile", label: "Profile" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-muted hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Info
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms & Conditions" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-muted hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-10 pt-6 text-center">
          <p className="text-foreground-muted text-xs">
            © {new Date().getFullYear()} Handmade Boutique. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}