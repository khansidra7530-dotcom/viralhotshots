import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { buildAmazonUrl } from "@/lib/affiliate";

export const dynamic = "force-dynamic";

export default async function AdminAffiliatesPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const links = await prisma.affiliateLink.findMany({ orderBy: { createdAt: "desc" } });
  const tag = process.env.AMAZON_ASSOCIATE_TAG;

  return (
    <div>
      <h1 className="text-2xl font-bold">Affiliate Links</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Amazon tag: {tag ?? "Not configured"}
      </p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Network</th>
              <th className="p-4">URL</th>
              <th className="p-4">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.id} className="border-b border-border/50">
                <td className="p-4 font-medium">{link.name}</td>
                <td className="p-4">{link.network}</td>
                <td className="max-w-xs truncate p-4 text-muted-foreground">
                  {link.asin ? buildAmazonUrl(link.asin, tag) : link.url}
                </td>
                <td className="p-4">{link.clickCount}</td>
              </tr>
            ))}
            {links.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No affiliate links. Add via Prisma Studio or seed script.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
