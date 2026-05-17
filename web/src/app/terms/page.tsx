import { LegalPage } from "@/components/legal/legal-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of Service",
  description: "Terms governing use of this website.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        By accessing this website, you agree to these terms. Content is for informational
        purposes only and does not constitute professional advice.
      </p>
      <p>
        We reserve the right to modify content, suspend access, or update these terms at any time.
      </p>
    </LegalPage>
  );
}
