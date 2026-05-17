import { LegalPage } from "@/components/legal/legal-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How we collect, use, and protect your personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>
      <h2>Information We Collect</h2>
      <p>
        We collect information you provide directly (e.g., newsletter signup, comments)
        and automatic data via cookies and analytics (IP address, browser type, pages visited).
      </p>
      <h2>How We Use Information</h2>
      <p>
        We use data to deliver content, improve our site, send newsletters (with consent),
        and display relevant advertising through partners like Google AdSense.
      </p>
      <h2>Your Rights</h2>
      <p>
        You may request access, correction, or deletion of your personal data by contacting us.
      </p>
    </LegalPage>
  );
}
