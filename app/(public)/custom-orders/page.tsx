"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { buildRequestWhatsAppLink } from "@/lib/buildWhatsAppLink";

const schema = z.object({
  description: z.string().min(10, "Please describe what you'd like in detail"),
  referenceLinks: z.string().optional(),
  budget: z.string().optional(),
  neededBy: z.string().optional(),
  otherDetails: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function CustomOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CUSTOM_ONLY",
          productId: productId ?? undefined,
          description: data.description,
          referenceLinks: data.referenceLinks
            ? data.referenceLinks
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean)
            : [],
          budget: data.budget ? parseFloat(data.budget) : undefined,
          neededBy: data.neededBy || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.error === "Unauthorized") {
          router.push("/login");
          return;
        }
        if (err.error === "PHONE_REQUIRED") {
          router.push("/profile?reason=phone_required&redirect=/custom-orders");
          return;
        }
        throw new Error(err.error);
      }

      toast.success("Request submitted! We'll get back to you soon.");
      const settingsRes = await fetch("/api/settings");
      const { whatsappNumber } = await settingsRes.json();
      const link = buildRequestWhatsAppLink(whatsappNumber, "CUSTOM_ONLY", data.description);
      window.location.href = link;
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl text-foreground mb-3">
          Custom Order
        </h1>
        <p className="text-foreground-muted">
          Tell us what you have in mind and we'll bring it to life.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            What would you like? *
          </label>
          <textarea
            {...register("description")}
            rows={5}
            placeholder="Describe your vision - colors, size, occasion, materials..."
            className="w-full border border-border rounded-md px-4 py-2.5 text-sm text-foreground bg-card focus:outline-none focus:border-primary resize-none"
          />
          {errors.description && (
            <p className="text-destructive text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Reference Links */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Reference links (optional)
          </label>
          <textarea
            {...register("referenceLinks")}
            rows={2}
            placeholder="Paste Pinterest, Instagram, or image links here (one per line)"
            className="w-full border border-border rounded-md px-4 py-2.5 text-sm text-foreground bg-card focus:outline-none focus:border-primary resize-none"
          />
          <p className="text-xs text-foreground-muted mt-1">
            Share any links to images that show what you're imagining
          </p>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Budget (₹) - optional
          </label>
          <input
            {...register("budget")}
            type="number"
            placeholder="e.g. 500"
            className="w-full border border-border rounded-md px-4 py-2.5 text-sm text-foreground bg-card focus:outline-none focus:border-primary"
          />
        </div>

        {/* Needed By */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Needed by (optional)
          </label>
          <input
            {...register("neededBy")}
            type="date"
            className="w-full border border-border rounded-md px-4 py-2.5 text-sm text-foreground bg-card focus:outline-none focus:border-primary"
          />
        </div>

        {/* Other Details */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Any other details (optional)
          </label>
          <textarea
            {...register("otherDetails")}
            rows={3}
            placeholder="Anything else we should know..."
            className="w-full border border-border rounded-md px-4 py-2.5 text-sm text-foreground bg-card focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      <div className="mt-8 bg-background-secondary rounded-md p-4 text-sm text-foreground-muted">
        <p className="font-medium text-foreground mb-1">What happens next?</p>
        <p>
          We'll review your request and reach out via WhatsApp within 24 hours
          to discuss details and share a quote.
        </p>
      </div>
    </div>
  );
}

export default function CustomOrdersPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-16">Loading...</div>}>
      <CustomOrdersContent />
    </Suspense>
  );
}
