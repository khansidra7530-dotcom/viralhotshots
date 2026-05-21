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
