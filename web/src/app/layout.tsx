import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, Source_Serif_4 } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { buildMetadata } from "@/lib/seo";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = buildMetadata({
  title: `${process.env.NEXT_PUBLIC_SITE_NAME ?? "Viral Hotshots"} — Trending News & Expert Guides`,
  description:
    "Breaking trends, expert guides, and honest reviews across finance, tech, AI, health, and more.",
  path: "/",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${display.variable} ${serif.variable} flex min-h-screen flex-col antialiased`}
      >
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
