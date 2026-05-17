import { requireAdminPage } from "@/lib/auth-helpers";
import { FIXED_ADMIN } from "@/lib/admin-constants";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminPage();

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });

  return (
    <div>
      <h1 className="text-2xl font-bold">Site Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Site and publishing configuration
      </p>
      <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/30 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Admin account (fixed)
        </p>
        <p className="mt-2 font-semibold">{FIXED_ADMIN.name}</p>
        <p className="text-sm text-muted-foreground">{FIXED_ADMIN.email}</p>
        <p className="mt-2 text-sm text-muted-foreground">{FIXED_ADMIN.bio}</p>
      </div>
      {settings && <SettingsForm settings={settings} />}
    </div>
  );
}
