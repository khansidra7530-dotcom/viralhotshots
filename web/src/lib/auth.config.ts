import type { NextAuthConfig } from "next-auth";
import { isAdminRole } from "@/lib/roles";

/** Valid session must include user id (avoids redirect loops with stale JWT cookies). */
function isLoggedIn(auth: { user?: { id?: string | null; email?: string | null } } | null) {
  return Boolean(auth?.user?.id ?? auth?.user?.email);
}

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const path = nextUrl.pathname;

      if (path === "/admin/register") {
        return Response.redirect(new URL("/admin/login", nextUrl));
      }

      const isAdminArea = path.startsWith("/admin");
      const isAdminLogin = path === "/admin/login";
      const isAccount = path.startsWith("/account");
      const isCustomerAuth = path === "/login" || path === "/register";
      const loggedIn = isLoggedIn(auth);

      if (isAdminArea && !isAdminLogin) {
        if (!loggedIn) return false;
        if (!isAdminRole(auth!.user!.role)) {
          return Response.redirect(new URL("/account", nextUrl));
        }
        return true;
      }

      if (isAdminLogin && loggedIn) {
        if (isAdminRole(auth!.user!.role)) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return Response.redirect(new URL("/account", nextUrl));
      }

      // /account is public; the page shows sign-in UI when logged out
      if (isAccount) {
        return true;
      }

      if (isCustomerAuth && loggedIn) {
        return Response.redirect(new URL("/account", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      const userId = (token.id ?? token.sub) as string | undefined;
      if (!userId) {
        return { ...session, user: undefined };
      }
      if (session.user) {
        session.user.id = userId;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
