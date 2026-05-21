import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "viralhotshots.com" }],
        destination: "https://www.viralhotshots.com/:path*",
        permanent: true,
      },
      {
        source: "/author/editorial-team",
        destination: "/authors",
        permanent: true,
      },
      {
        source: "/blog/ai-prompts-for-productivity-2",
        destination: "/blog/ai-prompts-for-productivity",
        permanent: true,
      },
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "**.amazon.com" },
    ],
  },
};

export default nextConfig;
