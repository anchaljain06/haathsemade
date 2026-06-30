"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { buildOrderWhatsAppLink } from "@/lib/buildWhatsAppLink";

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

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCartStore();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  useEffect(() => {
    fetch("/api/profile/addresses")
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data.addresses ?? []);
        const def = data.addresses?.find((a: Address) => a.isDefault);
        if (def) setSelectedAddress(def);
        else if (data.addresses?.length) setSelectedAddress(data.addresses[0]);
        else setShowNewAddress(true);
      })
      .catch(() => setShowNewAddress(true));
  }, []);

  async function handleAddAddress() {
    if (!newAddress.line1 || !newAddress.city || !newAddress.pincode) {
      toast.error("Please fill all required address fields");
      return;
    }
    const res = await fetch("/api/profile/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddress),
    });
    const data = await res.json();
    setAddresses(data.addresses);
    setSelectedAddress(newAddress);
    setShowNewAddress(false);
  }

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          totalAmount,
          shippingAddress: selectedAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === "PHONE_REQUIRED") {
          toast.error("Please add your phone number before checkout");
          router.push("/profile?reason=phone_required&redirect=/checkout");
          return;
        }
        throw new Error(data.error);
      }

      const settingsRes = await fetch("/api/settings");
      const { whatsappNumber } = await settingsRes.json();
      const link = buildOrderWhatsAppLink(
        whatsappNumber,
        data.order._id,
        items,
        totalAmount
      );

      clearCart();
      window.location.href = link;
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-foreground-muted">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-heading text-3xl text-foreground mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Address Selection */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="font-heading text-lg text-foreground mb-4">
              Delivery Address
            </h2>

            {addresses.map((addr, i) => (
              <label
                key={i}
                className="flex items-start gap-3 mb-3 cursor-pointer"
              >
                <input
                  type="radio"
                  checked={selectedAddress?.line1 === addr.line1}
                  onChange={() => setSelectedAddress(addr)}
                  className="mt-1 accent-primary"
                />
                <div className="text-sm">
                  <p className="text-foreground font-medium">{addr.label}</p>
                  <p className="text-foreground-muted">
                    {addr.line1}, {addr.line2 ? addr.line2 + ", " : ""}
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>
              </label>
            ))}

            {!showNewAddress ? (
              <button
                onClick={() => setShowNewAddress(true)}
                className="text-primary text-sm hover:underline"
              >
                + Add new address
              </button>
            ) : (
              <div className="space-y-3 mt-4 border-t border-border pt-4">
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
                <button
                  onClick={handleAddAddress}
                  className="text-sm bg-primary text-white px-4 py-2 rounded-md hover:opacity-90"
                >
                  Save Address
                </button>
              </div>
            )}
          </div>

          {/* Order Review */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="font-heading text-lg text-foreground mb-4">
              Order Items
            </h2>
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between text-sm py-2 border-b border-border last:border-0"
              >
                <span className="text-foreground-muted">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-foreground font-medium">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-background-secondary rounded-lg p-6 h-fit">
          <h2 className="font-heading text-lg text-foreground mb-4">
            Total
          </h2>
          <div className="flex justify-between text-sm text-foreground-muted mb-4">
            <span>Amount Payable</span>
            <span className="text-foreground font-medium">
              ₹{totalAmount.toLocaleString()}
            </span>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={loading || !selectedAddress}
            className="w-full bg-primary text-white py-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
