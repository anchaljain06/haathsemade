import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-foreground-muted text-sm">
            Sign in with your phone number to continue
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-card border border-border rounded-lg",
              headerTitle: "font-heading",
              formButtonPrimary:
                "bg-primary hover:bg-primary/90 text-white",
            },
          }}
        />
      </div>
    </main>
  );
}
