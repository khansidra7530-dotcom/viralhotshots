import { LegalPage } from "@/components/legal/legal-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact",
  description: "Get in touch with the InsightPress editorial team.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <LegalPage title="Contact Us">
      <p>For editorial inquiries, partnerships, or corrections:</p>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:hello@insightpress.com">hello@insightpress.com</a>
      </p>
      <p>We typically respond within 2–3 business days.</p>
    </LegalPage>
  );
}
