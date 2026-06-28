export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading text-4xl text-foreground mb-6">Contact Us</h1>
      <p className="text-foreground-muted mb-8">
        We'd love to hear from you. Reach out via WhatsApp for the fastest
        response.
      </p>
      <div className="space-y-4">
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-md text-sm font-medium hover:bg-green-100 transition-colors w-fit"
        >
          💬 Chat on WhatsApp
        </a>
        <a
          href="mailto:hello@handmadeboutique.com"
          className="flex items-center gap-3 bg-background-secondary border border-border text-foreground-muted px-5 py-3 rounded-md text-sm font-medium hover:border-primary hover:text-primary transition-colors w-fit"
        >
          ✉️ hello@handmadeboutique.com
        </a>
      </div>
    </div>
  );
}
