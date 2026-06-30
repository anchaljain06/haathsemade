import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { redirect } from "next/navigation";
import ProfileTabs from "@/components/profile/ProfileTabs";

async function getProfile() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await connectDB();
  return JSON.parse(JSON.stringify(user));
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { reason?: string; redirect?: string };
}) {
  const user = await getProfile();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-heading text-3xl text-foreground mb-4">Profile</h1>

      {searchParams.reason === "phone_required" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-md px-4 py-3 mb-6">
          Please add your phone number to continue — we use it to keep you
          updated on WhatsApp about your order or request.
        </div>
      )}

      <ProfileTabs
        user={user}
        redirectAfterSave={searchParams.redirect}
      />
    </div>
  );
}
