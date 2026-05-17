import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });

  return (
    <div>
      <h1 className="text-2xl font-bold">Site Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Site and publishing configuration
      </p>
      {settings && <SettingsForm settings={settings} />}
    </div>
  );
}
