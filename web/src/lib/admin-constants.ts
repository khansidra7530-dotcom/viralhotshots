/** Fixed admin identity — not editable in the dashboard. */
export const FIXED_ADMIN = {
  name: process.env.ADMIN_NAME ?? "Viral Hotshots Editorial",
  email: process.env.ADMIN_EMAIL ?? "admin@viralhotshots.com",
  bio: "Official editorial account for Viral Hotshots.",
} as const;
