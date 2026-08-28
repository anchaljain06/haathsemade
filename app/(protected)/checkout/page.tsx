"use client";

import { useState, useEffect } from "react";
import { useCartStore, cartItemKey } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { buildOrderWhatsAppLink } from "@/lib/buildWhatsAppLink";
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

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCartStore();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  // Selection is held as an index, not as the address object. Matching on
  // line1 collided whenever a customer had two addresses on the same street.
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
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

  const selectedAddress =
    selectedIndex === null ? null : addresses[selectedIndex] ?? null;

  useEffect(() => {
    fetch("/api/profile/addresses")
      .then((res) => res.json())
      .then((data) => {
        const list: Address[] = data.addresses ?? [];
        setAddresses(list);

        if (list.length === 0) {
          setShowNewAddress(true);
          return;
        }

        const defaultIndex = list.findIndex((a) => a.isDefault);
        setSelectedIndex(defaultIndex >= 0 ? defaultIndex : 0);
      })
      .catch(() => setShowNewAddress(true));
  }, []);

  async function handleAddAddress() {
    // Validate against the same schema the route uses. The old check covered
    // only line1/city/pincode, so a 3-character line1 or a missing state came
    // back as a 400 that the success path then treated as a fresh list.
    const parsed = addressSchema.safeParse(newAddress);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid address");
      return;
    }

    setSavingAddress(true);
    try {
      const res = await fetch("/api/profile/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error ?? "Could not save that address");
        return;
      }

      const list: Address[] = data.addresses ?? [];
      setAddresses(list);
      setSelectedIndex(list.length ? list.length - 1 : null);
      setShowNewAddress(false);
    } catch {
      toast.error("Could not save that address");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setLoading(true);
    try {
      // Read the WhatsApp number *before* creating anything. If it is missing,
      // creating the order first would strand it: the cart gets cleared and the
      // customer lands on wa.me/?text=... with no one to send the message to.
      const settingsRes = await fetch("/api/settings");
      const settings = await settingsRes.json().catch(() => ({}));
      const whatsappNumber: string = settings?.whatsappNumber ?? "";

      if (!settingsRes.ok || !whatsappNumber) {
        toast.error(
          "Ordering is temporarily unavailable. Please try again shortly."
        );
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Only ids and quantities — the server looks up prices itself.
          items: items.map((i) =>
            i.requestId
              ? { requestId: i.requestId, quantity: 1 }
              : { productId: i.productId, quantity: i.quantity }
          ),
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
        if (data.error === "RATE_LIMITED") {
          // The cart is deliberately left intact — this is a "try again in a
          // moment", not a failed order.
          toast.error(data.message ?? "Too many attempts. Please wait a moment.");
          return;
        }
        throw new Error(data.error);
      }

      // Use the server's authoritative items and total, not the local cart.
      const link = buildOrderWhatsAppLink(
        whatsappNumber,
        data.order._id,
        data.order.items,
        data.order.totalAmount
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
                key={addr._id ?? i}
                className="flex items-start gap-3 mb-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="shipping-address"
                  checked={selectedIndex === i}
                  onChange={() => setSelectedIndex(i)}
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
                <div>
                  <label
                    htmlFor="line1"
                    className="block text-sm text-foreground-muted mb-1"
                  >
                    Address Line 1
                  </label>
                  <input
                    id="line1"
                    value={newAddress.line1}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, line1: e.target.value })
                    }
                    className="w-full border border-border rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="line2"
                    className="block text-sm text-foreground-muted mb-1"
                  >
                    Address Line 2 (optional)
                  </label>
                  <input
                    id="line2"
                    value={newAddress.line2}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, line2: e.target.value })
                    }
                    className="w-full border border-border rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm text-foreground-muted mb-1"
                    >
                      City
                    </label>
                    <input
                      id="city"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="w-full border border-border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm text-foreground-muted mb-1"
                    >
                      State
                    </label>
                    <input
                      id="state"
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                      className="w-full border border-border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="pincode"
                      className="block text-sm text-foreground-muted mb-1"
                    >
                      Pincode
                    </label>
                    <input
                      id="pincode"
                      inputMode="numeric"
                      value={newAddress.pincode}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, pincode: e.target.value })
                      }
                      className="w-full border border-border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddAddress}
                  disabled={savingAddress}
                  className="text-sm bg-primary text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  {savingAddress ? "Saving..." : "Save Address"}
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
                key={cartItemKey(item)}
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
