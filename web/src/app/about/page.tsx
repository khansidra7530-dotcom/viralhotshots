import { LegalPage } from "@/components/legal/legal-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Us",
  description: "Learn about our mission to deliver trustworthy, expert content.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <LegalPage title="About InsightPress">
      <p>
        InsightPress is an independent publishing platform focused on in-depth guides,
        honest product comparisons, and expert analysis. Our content follows Google EEAT
        principles—written for humans first, optimized for search second.
      </p>
      <p>
        We cover finance, technology, health, gaming, crypto, business, and travel—with
        transparent affiliate disclosures on every monetized page.
      </p>
    </LegalPage>
  );
}
