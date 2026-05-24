import { NICHES, SITE_NAME, SITE_TAGLINE, SITE_URL, SOCIAL_LINKS } from "@/lib/constants";
import { ORG_ID, WEBSITE_ID } from "@/lib/aeo/schema-ids";
import { normalizeMetaDescription } from "@/lib/seo";

export function OrganizationJsonLd() {
  const description = normalizeMetaDescription(
    `${SITE_TAGLINE}. Expert guides and trending news across ${NICHES.map((n) => n.label.toLowerCase()).join(", ")}.`
  );

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: SITE_NAME,
        url: SITE_URL,
        description,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/icon`,
          width: 32,
          height: 32,
        },
        sameAs: SOCIAL_LINKS.map((l) => l.href),
        email: "hello@viralhotshots.com",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "hello@viralhotshots.com",
          url: `${SITE_URL}/contact`,
        },
        knowsAbout: NICHES.map((n) => n.label),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        description,
        inLanguage: "en-US",
        publisher: { "@id": ORG_ID },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export { ORG_ID, WEBSITE_ID } from "@/lib/aeo/schema-ids";
