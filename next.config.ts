import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy.
 *
 * Notes on the non-obvious entries:
 * - `'unsafe-inline'` in script-src: Next injects inline bootstrap/flight
 *   scripts. A nonce would be stricter but has to be minted per-request in
 *   middleware, and `proxy.ts` runs on every request already — revisit only
 *   with a nonce plumbed through there.
 * - `'unsafe-eval'` is dev-only (React refresh / Turbopack).
 * - upload-widget.cloudinary.com: `CldUploadWidget` loads its script from
 *   there and renders the picker in an iframe, so it needs both script-src
 *   and frame-src. api.cloudinary.com is where the signed upload PUTs go.
 *   Drop these and admin image upload silently stops working.
 * - lh3.googleusercontent.com: Google account avatars from the OAuth profile.
 *
 * If you add a third-party embed (analytics, a map, a chat widget), it needs a
 * directive here or it will be blocked with no visible error but a console
 * message.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://upload-widget.cloudinary.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  `connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com${isDev ? " ws: wss:" : ""}`,
  "frame-src 'self' https://upload-widget.cloudinary.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  // accounts.google.com: sign-in POSTs to our own /api/auth/... which then
  // 302s to Google. Some browsers check redirect hops against form-action, so
  // omitting it can break Google login.
  "form-action 'self' https://accounts.google.com",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
]
  .map((directive) => directive.replace(/\s+/g, " ").trim())
  .join("; ");

const nextConfig: NextConfig = {
  // Don't advertise the framework.
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          ...(isDev
            ? []
            : [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]),
        ],
      },
    ];
  },
};

export default nextConfig;
