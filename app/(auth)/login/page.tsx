"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { BRAND } from "@/lib/brand";

/** Google's mark, inlined — the CSP won't load it from a remote host. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="w-5 h-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86a5.36 5.36 0 0 1-5.03-3.71H1.05v2.34A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71A5.4 5.4 0 0 1 3.97 7.3V4.96H1.05a9 9 0 0 0 0 8.09l2.92-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.59A8.98 8.98 0 0 0 1.05 4.96L3.97 7.3A5.36 5.36 0 0 1 9 3.58Z"
      />
    </svg>
  );
}

function LoginCard() {
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);

  // Only ever trust an in-app path here. An absolute URL from the query string
  // would turn this into an open redirect.
  const raw = searchParams.get("redirect") ?? "/";
  const redirectTo = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";

  const failed = searchParams.get("error");

  return (
    <div className="w-full max-w-md px-4">
      <div className="text-center mb-8">
        <h1 className="font-heading text-3xl text-foreground mb-2">
          Welcome to {BRAND.name}
        </h1>
        <p className="text-foreground-muted text-sm">
          Sign in to track orders and request custom pieces.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        {failed && (
          <p
            role="alert"
            className="mb-4 text-sm text-destructive text-center"
          >
            That didn&apos;t work. Please try again.
          </p>
        )}

        <button
          onClick={() => {
            setPending(true);
            signIn("google", { redirectTo });
          }}
          disabled={pending}
          className="w-full flex items-center justify-center gap-3 border border-border rounded-md px-4 py-3 text-sm font-medium text-foreground bg-background hover:bg-background-secondary transition-colors disabled:opacity-50"
        >
          <GoogleMark />
          {pending ? "Redirecting…" : "Continue with Google"}
        </button>

        <p className="mt-5 text-xs text-foreground-muted text-center leading-relaxed">
          We&apos;ll ask for your phone number at checkout so we can confirm
          your order on WhatsApp.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      {/* useSearchParams needs a Suspense boundary to prerender. */}
      <Suspense fallback={null}>
        <LoginCard />
      </Suspense>
    </main>
  );
}
