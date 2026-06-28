export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading text-4xl text-foreground mb-6">
        Privacy Policy
      </h1>
      <div className="space-y-6 text-foreground-muted text-sm leading-relaxed">
        <section>
          <h2 className="font-heading text-xl text-foreground mb-2">
            Information We Collect
          </h2>
          <p>
            We collect your name, email address, phone number, and delivery
            address when you place an order or create an account. We also
            collect information you provide when making custom order requests.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-foreground mb-2">
            How We Use Your Information
          </h2>
          <p>
            Your information is used solely to process orders, communicate
            about your requests, and deliver your products. We do not sell your
            data to third parties.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-foreground mb-2">
            Data Security
          </h2>
          <p>
            We use industry-standard security measures to protect your personal
            information. Payments are processed securely through Razorpay.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-foreground mb-2">
            Contact
          </h2>
          <p>
            For any privacy concerns, please contact us at
            hello@handmadeboutique.com.
          </p>
        </section>
      </div>
    </div>
  );
}
