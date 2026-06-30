"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";

const statusConfig: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: "Submitted", className: "bg-gray-100 text-gray-600" },
  UNDER_REVIEW: { label: "Under Review", className: "bg-blue-100 text-blue-600" },
  NEED_DISCUSSION: { label: "Need Discussion", className: "bg-orange-100 text-orange-600" },
  QUOTATION_READY: { label: "Quotation Ready", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-600" },
  ACCEPTED: { label: "Accepted", className: "bg-primary/10 text-primary" },
};

interface Request {
  _id: string;
  type: string;
  description: string;
  status: string;
  quotedPrice?: number;
  estimatedCraftTime?: string;
  productId?: { name: string; images: string[] };
  createdAt: string;
}

export default function RequestCard({ request }: { request: Request }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const status = statusConfig[request.status];

  async function handleAccept() {
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${request._id}/accept`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      addItem(data.cartItem);
      toast.success("Quote accepted! Item added to cart.");
      router.push("/cart");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs text-foreground-muted mb-1">
            {request.type === "MADE_TO_ORDER" ? "Made to Order" : "Custom Order"}{" "}
            ·{" "}
            {new Date(request.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </p>
          <p className="text-sm text-foreground font-medium">
            {request.productId?.name ?? request.description.slice(0, 60)}
          </p>
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <p className="text-sm text-foreground-muted mb-4">
        {request.description}
      </p>

      {request.status === "QUOTATION_READY" && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-3">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-foreground-muted">Quoted Price</span>
            <span className="text-foreground font-medium">
              ₹{request.quotedPrice?.toLocaleString()}
            </span>
          </div>
          {request.estimatedCraftTime && (
            <div className="flex justify-between text-sm mb-3">
              <span className="text-foreground-muted">Craft Time</span>
              <span className="text-foreground font-medium">
                {request.estimatedCraftTime}
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1 bg-primary text-white py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Processing..." : "Accept Quote"}
            </button>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noreferrer"
              className="flex-1 border border-green-300 text-green-700 py-2 rounded-md text-sm font-medium text-center hover:bg-green-50 transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}

      {request.status === "NEED_DISCUSSION" && (
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noreferrer"
          className="inline-block border border-orange-300 text-orange-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-50 transition-colors"
        >
          Discuss on WhatsApp
        </a>
      )}
    </div>
  );
}
