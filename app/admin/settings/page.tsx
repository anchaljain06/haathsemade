import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import SettingsForm from "@/components/admin/SettingsForm";

async function getSettings() {
  await connectDB();
  let settings = await Settings.findOne().lean();
  if (!settings) {
    settings = await Settings.create({ whatsappNumber: "" });
    settings = settings.toObject();
  }
  return settings;
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="font-heading text-3xl text-foreground mb-6">Settings</h1>
      <SettingsForm
        initialWhatsappNumber={(settings as any).whatsappNumber ?? ""}
      />
    </div>
  );
}
