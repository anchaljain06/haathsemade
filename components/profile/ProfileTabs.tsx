"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { addressSchema } from "@/schemas/zodValidations";

interface Address {
  _id?: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
}

export default function ProfileTabs({ 
  user,
  redirectAfterSave
}: { 
  user: User;
  redirectAfterSave?: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"profile" | "addresses">("profile");
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [addresses, setAddresses] = useState<Address[]>(user.addresses ?? []);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Profile updated");

      if (redirectAfterSave && phone) {
        router.push(redirectAfterSave);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddAddress() {
    const result = addressSchema.safeParse(newAddress);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    if (!newAddress.line1 || !newAddress.city || !newAddress.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    const res = await fetch("/api/profile/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddress),
    });
    const data = await res.json();
    setAddresses(data.addresses);
    setShowNewAddress(false);
    setNewAddress({
      label: "Home",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    });
    toast.success("Address added");
  }

  async function handleDeleteAddress(index: number) {
    const res = await fetch("/api/profile/addresses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index }),
    });
    const data = await res.json();
    setAddresses(data.addresses);
    toast.success("Address removed");
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-border">
        <button
          onClick={() => setTab("profile")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "profile"
              ? "border-primary text-primary"
              : "border-transparent text-foreground-muted"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setTab("addresses")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "addresses"
              ? "border-primary text-primary"
              : "border-transparent text-foreground-muted"
          }`}
        >
          Addresses
        </button>
      </div>

      {tab === "profile" && (
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-card focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <input
              value={user.email}
              disabled
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-background-secondary text-foreground-muted"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phone (used for WhatsApp updates)
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-card focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-primary text-white px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {tab === "addresses" && (
        <div className="space-y-4">
          {addresses.map((addr, i) => (
            <div
              key={i}
              className="flex justify-between items-start bg-card border border-border rounded-lg p-4"
            >
              <div className="text-sm">
                <p className="text-foreground font-medium">
                  {addr.label} {addr.isDefault && "· Default"}
                </p>
                <p className="text-foreground-muted">
                  {addr.line1}, {addr.line2 ? addr.line2 + ", " : ""}
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
              </div>
              <button
                onClick={() => handleDeleteAddress(i)}
                className="text-destructive hover:opacity-70"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {!showNewAddress ? (
            <button
              onClick={() => setShowNewAddress(true)}
              className="text-primary text-sm hover:underline"
            >
              + Add new address
            </button>
          ) : (
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <input
                placeholder="Label (e.g. Home, Work)"
                value={newAddress.label}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, label: e.target.value })
                }
                className="w-full border border-border rounded-md px-3 py-2 text-sm"
              />
              <input
                placeholder="Address Line 1"
                value={newAddress.line1}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, line1: e.target.value })
                }
                className="w-full border border-border rounded-md px-3 py-2 text-sm"
              />
              <input
                placeholder="Address Line 2 (optional)"
                value={newAddress.line2}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, line2: e.target.value })
                }
                className="w-full border border-border rounded-md px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                  className="border border-border rounded-md px-3 py-2 text-sm"
                />
                <input
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, state: e.target.value })
                  }
                  className="border border-border rounded-md px-3 py-2 text-sm"
                />
                <input
                  placeholder="Pincode"
                  value={newAddress.pincode}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, pincode: e.target.value })
                  }
                  className="border border-border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground-muted">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, isDefault: e.target.checked })
                  }
                  className="accent-primary"
                />
                Set as default address
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleAddAddress}
                  className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
                >
                  Save Address
                </button>
                <button
                  onClick={() => setShowNewAddress(false)}
                  className="text-foreground-muted text-sm px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
