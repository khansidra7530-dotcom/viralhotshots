import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { getAuthSecret } from "@/lib/auth-env";

export default NextAuth({
  ...authConfig,
  secret: getAuthSecret(),
  providers: [],
}).auth;

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/account",
    "/account/:path*",
    "/login",
    "/register",
  ],
};
