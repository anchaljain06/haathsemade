"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RequestData {
  _id: string;
  type: string;
  status: string;
  description: string;
  referenceLinks: string[];
  budget?: number;
  neededBy?: string;
  quotedPrice?: number;
  estimatedCraftTime?: string;
  adminNotes?: string;
  userId?: { name: string; phone: string; email: string };
  productId?: { name: string };
}

export default function RequestDetailManager({
  request,
}: {
  request: RequestData;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(request.status);
  const [quotedPrice, setQuotedPrice] = useState(
    request.quotedPrice?.toString() ?? ""
  );
  const [estimatedCraftTime, setEstimatedCraftTime] = useState(
    request.estimatedCraftTime ?? ""
  );
  const [adminNotes, setAdminNotes] = useState(request.adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);

  async function handleSave(newStatus?: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/requests/${request._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus ?? status,
          quotedPrice: quotedPrice ? Number(quotedPrice) : undefined,
          estimatedCraftTime: estimatedCraftTime || undefined,
          adminNotes: adminNotes || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      if (newStatus) setStatus(newStatus);
      toast.success("Request updated");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleConvertToOrder() {
    if (!quotedPrice || Number(quotedPrice) <= 0) {
      toast.error("Please set a quoted price before converting to an order");
      return;
    }
    if (
      !confirm(
        "This will create an order marked as paid (offline payment confirmed). Continue?"
      )
    )
      return;

    setConverting(true);
    try {
      const res = await fetch(
        `/api/admin/requests/${request._id}/convert-to-order`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Order created from request");
      router.push(`/admin/orders/${data.order._id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to convert");
    } finally {
      setConverting(false);
    }
  }

  const whatsappLink = request.userId?.phone
    ? `https://wa.me/${request.userId.phone}?text=${encodeURIComponent(
        `Hi ${request.userId.name}, regarding your request...`
      )}`
    : null;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        {/* Customer & Request Info */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-heading text-lg text-foreground mb-3">
            {request.productId?.name ?? "Custom Request"}
          </h2>
          <p className="text-sm text-foreground-muted mb-4">
            {request.userId?.name} · {request.userId?.phone} ·{" "}
            {request.userId?.email}
          </p>
          <p className="text-sm text-foreground-muted whitespace-pre-line mb-4">
            {request.description}
          </p>

          {request.budget && (
            <p className="text-sm text-foreground-muted mb-1">
              Budget: ₹{request.budget.toLocaleString()}
            </p>
          )}
          {request.neededBy && (
            <p className="text-sm text-foreground-muted mb-1">
              Needed by: {new Date(request.neededBy).toLocaleDateString("en-IN")}
            </p>
          )}

          {request.referenceLinks?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-foreground mb-2">
                Reference Links
              </p>
              <div className="space-y-1">
                {request.referenceLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-primary hover:underline break-all"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Notes */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-heading text-lg text-foreground mb-3">
            Admin Notes
          </h2>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            placeholder="Internal notes about this request..."
            className="w-full border border-border rounded-md px-3 py-2 text-sm resize-none"
          />
        </div>
      </div>

      {/* Actions Sidebar */}
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-5 space-y-3">
          <h2 className="font-heading text-lg text-foreground mb-1">
            Status
          </h2>
          <p className="text-xs text-foreground-muted mb-3">
            Current: <span className="font-medium">{status.replace(/_/g, " ")}</span>
          </p>

          <button
            onClick={() => handleSave("UNDER_REVIEW")}
            disabled={saving}
            className="w-full border border-blue-300 text-blue-700 py-2 rounded-md text-sm hover:bg-blue-50 transition-colors"
          >
            Mark Under Review
          </button>
          <button
            onClick={() => handleSave("NEED_DISCUSSION")}
            disabled={saving}
            className="w-full border border-orange-300 text-orange-700 py-2 rounded-md text-sm hover:bg-orange-50 transition-colors"
          >
            Mark Need Discussion
          </button>
          <button
            onClick={() => handleSave("REJECTED")}
            disabled={saving}
            className="w-full border border-red-300 text-red-700 py-2 rounded-md text-sm hover:bg-red-50 transition-colors"
          >
            Reject Request
          </button>
        </div>

        {/* Quote */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-3">
          <h2 className="font-heading text-lg text-foreground mb-1">
            Set Quote
          </h2>
          <input
            type="number"
            placeholder="Price (₹)"
            value={quotedPrice}
            onChange={(e) => setQuotedPrice(e.target.value)}
            className="w-full border border-border rounded-md px-3 py-2 text-sm"
          />
          <input
            placeholder="Craft time (e.g. 4 days)"
            value={estimatedCraftTime}
            onChange={(e) => setEstimatedCraftTime(e.target.value)}
            className="w-full border border-border rounded-md px-3 py-2 text-sm"
          />
          <button
            onClick={() => handleSave("QUOTATION_READY")}
            disabled={saving}
            className="w-full bg-primary text-white py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Mark Quotation Ready
          </button>
        </div>

        {/* Offline Conversion */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 space-y-2">
          <h2 className="font-heading text-base text-amber-800 mb-1">
            Offline / WhatsApp Deal
          </h2>
          <p className="text-xs text-amber-700 mb-3">
            If this was already discussed and paid for outside the app (cash,
            UPI, WhatsApp), convert it directly into a confirmed order —
            skips customer Accept Quote step.
          </p>
          <button
            onClick={handleConvertToOrder}
            disabled={converting}
            className="w-full bg-amber-600 text-white py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {converting ? "Converting..." : "Convert to Order (Offline Paid)"}
          </button>
        </div>

        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="block w-full text-center border border-green-300 text-green-700 py-2.5 rounded-md text-sm font-medium hover:bg-green-50 transition-colors"
          >
            Open WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
