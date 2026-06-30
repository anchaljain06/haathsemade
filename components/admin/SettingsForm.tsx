"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function SettingsForm({
  initialWhatsappNumber,
}: {
  initialWhatsappNumber: string;
}) {
  const [whatsappNumber, setWhatsappNumber] = useState(initialWhatsappNumber);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber }),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-sm bg-card border border-border rounded-lg p-5">
      <label className="block text-sm font-medium text-foreground mb-2">
        WhatsApp Number
      </label>
      <p className="text-xs text-foreground-muted mb-3">
        Used for all "Place Order" and "Submit Request" redirects. Include
        country code without + or spaces (e.g. 919876543210).
      </p>
      <input
        value={whatsappNumber}
        onChange={(e) => setWhatsappNumber(e.target.value)}
        placeholder="919876543210"
        className="w-full border border-border rounded-md px-4 py-2.5 text-sm mb-4"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
