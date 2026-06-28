export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading text-4xl text-foreground mb-6">
        Terms & Conditions
      </h1>
      <div className="space-y-6 text-foreground-muted text-sm leading-relaxed">
        <section>
          <h2 className="font-heading text-xl text-foreground mb-2">Orders</h2>
          <p>
            All orders are subject to availability. For made-to-order and
            custom products, orders are confirmed only after admin review and
            your acceptance of the quoted price.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-foreground mb-2">
            Payments
          </h2>
          <p>
            Payments are processed securely via Razorpay. Full payment is
            required before crafting begins for custom and made-to-order items.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-foreground mb-2">
            Cancellations & Refunds
          </h2>
          <p>
            Ready stock orders can be cancelled before shipping. Custom and
            made-to-order items cannot be cancelled once crafting has begun.
            Refunds are processed within 5-7 business days.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-foreground mb-2">
            Shipping
          </h2>
          <p>
            We ship across India. Delivery timelines vary by product type and
            location. Tracking information will be shared once your order is
            shipped.
          </p>
        </section>
      </div>
    </div>
  );
}
