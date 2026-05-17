import type { NextAuthConfig } from "next-auth";
import { isAdminRole } from "@/lib/roles";

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const path = nextUrl.pathname;
      const isAdminArea = path.startsWith("/admin");
      const isAdminLogin = path === "/admin/login";
      const isAccount = path.startsWith("/account");
      const isCustomerAuth = path === "/login" || path === "/register";

      if (isAdminArea && !isAdminLogin) {
        if (!auth) return false;
        if (!isAdminRole(auth.user?.role)) {
          return Response.redirect(new URL("/account", nextUrl));
        }
        return true;
      }

      if (isAdminLogin && auth?.user) {
        if (isAdminRole(auth.user.role)) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return Response.redirect(new URL("/account", nextUrl));
      }

      if (isAccount) {
        return !!auth;
      }

      if (isCustomerAuth && auth) {
        return Response.redirect(new URL("/account", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
