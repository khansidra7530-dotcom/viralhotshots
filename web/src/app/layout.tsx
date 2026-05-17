import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { buildMetadata } from "@/lib/seo";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = buildMetadata({
  title: `${process.env.NEXT_PUBLIC_SITE_NAME ?? "InsightPress"} — Expert Guides & Reviews`,
  description:
    "Premium affiliate blog with expert guides, honest reviews, and insights across finance, tech, health, and more.",
  path: "/",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable} min-h-screen antialiased`}>
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
