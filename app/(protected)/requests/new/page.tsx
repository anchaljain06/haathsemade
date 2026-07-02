"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { buildRequestWhatsAppLink } from "@/lib/buildWhatsAppLink";

const schema = z.object({
  description: z.string().min(5, "Please add a short message"),
  budget: z.string().optional(),
  neededBy: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function NewRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const type = searchParams.get("type") ?? "MADE_TO_ORDER";
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState("");

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => setProductName(data.product?.name ?? ""))
      .catch(() => {});
  }, [productId]);

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
          type,
          productId: productId ?? undefined,
          description: data.description,
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

      toast.success("Request submitted!");
      const settingsRes = await fetch("/api/settings");
      const { whatsappNumber } = await settingsRes.json();
      const link = buildRequestWhatsAppLink(
        whatsappNumber,
        type as any,
        data.description,
      );
      window.location.href = link;
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-foreground mb-2">
          Request Availability
        </h1>
        {productName && (
          <p className="text-foreground-muted text-sm">
            For:{" "}
            <span className="text-foreground font-medium">{productName}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Message / Special Requirements *
          </label>
          <textarea
            {...register("description")}
            rows={4}
            placeholder="Let us know any specific requirements, colors, or timing preferences..."
            className="w-full border border-border rounded-md px-4 py-2.5 text-sm text-foreground bg-card focus:outline-none focus:border-primary resize-none"
          />
          {errors.description && (
            <p className="text-destructive text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Budget expectation (₹) — optional
          </label>
          <input
            {...register("budget")}
            type="number"
            placeholder="e.g. 800"
            className="w-full border border-border rounded-md px-4 py-2.5 text-sm text-foreground bg-card focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Needed by — optional
          </label>
          <input
            {...register("neededBy")}
            type="date"
            className="w-full border border-border rounded-md px-4 py-2.5 text-sm text-foreground bg-card focus:outline-none focus:border-primary"
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
    </div>
  );
}

export default function NewRequestPage() {
  return (
    <Suspense
      fallback={<div className="max-w-xl mx-auto px-4 py-16">Loading...</div>}
    >
      <NewRequestContent />
    </Suspense>
  );
}
