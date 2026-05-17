import { LegalPage } from "@/components/legal/legal-page";
import { SocialLinks } from "@/components/layout/social-links";
import { SITE_NAME } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact",
  description: `Get in touch with the ${SITE_NAME} editorial team.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <LegalPage title="Contact Us">
      <p>For editorial inquiries, partnerships, or corrections:</p>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:hello@viralhotshots.com">hello@viralhotshots.com</a>
      </p>
      <p>We typically respond within 2–3 business days.</p>
      <div className="mt-8">
        <p className="mb-3 font-semibold">Follow us</p>
        <SocialLinks
          className="[&_a]:border-border [&_a]:bg-muted [&_a]:text-foreground"
          iconClassName="h-5 w-5"
        />
      </div>
    </LegalPage>
  );
}
