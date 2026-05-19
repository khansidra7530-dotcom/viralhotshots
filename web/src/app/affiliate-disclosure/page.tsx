import { LegalPage } from "@/components/legal/legal-page";
import { SITE_NAME } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Affiliate Disclosure",
  description: "How we earn commissions and maintain editorial independence.",
  path: "/affiliate-disclosure",
});

export default function AffiliateDisclosurePage() {
  return (
    <LegalPage title="Affiliate Disclosure">
      <p>
        {SITE_NAME} participates in affiliate programs including the Amazon Associates Program.
        When you click links on our site and make a purchase, we may earn a commission at no
        extra cost to you.
      </p>
      <p>
        Affiliate relationships do not influence our editorial opinions. We only recommend
        products we believe provide genuine value to readers.
      </p>
    </LegalPage>
  );
}
