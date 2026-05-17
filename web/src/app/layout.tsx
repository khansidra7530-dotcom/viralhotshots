import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, Source_Serif_4 } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { OrganizationJsonLd } from "@/components/seo/organization-jsonld";
import { buildMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ff3d57" },
    { media: "(prefers-color-scheme: dark)", color: "#ff5c72" },
  ],
};

export const metadata: Metadata = {
  ...buildMetadata({
    title: `${SITE_NAME} — Trending News & Expert Guides`,
    description:
      "Breaking trends, expert guides, and honest reviews across finance, tech, AI, health, and more.",
    path: "/",
  }),
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${display.variable} ${serif.variable} flex min-h-screen flex-col antialiased`}
      >
        <OrganizationJsonLd />
        <AuthSessionProvider>
          <ThemeProvider>
            <Header />
            <main className="flex-1 overflow-x-hidden">{children}</main>
            <Footer />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
