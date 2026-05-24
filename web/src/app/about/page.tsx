import { LegalPage } from "@/components/legal/legal-page";
import { SITE_NAME } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Us",
  description:
    "Viral Hotshots is an independent publisher of trending news explainers and expert guides across finance, tech, AI, health, gaming, crypto, business, and travel — written for everyday readers with EEAT standards.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <LegalPage title={`About ${SITE_NAME}`}>
      <p>
        {SITE_NAME} is an independent publishing platform focused on in-depth guides,
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
