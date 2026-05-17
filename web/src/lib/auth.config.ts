import type { NextAuthConfig } from "next-auth";
import { isAdminRole } from "@/lib/roles";

/** Valid session must include user id (avoids redirect loops with stale JWT cookies). */
function isLoggedIn(auth: { user?: { id?: string | null } } | null) {
  return Boolean(auth?.user?.id);
}

export const authConfig = {
  trustHost: true,
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
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (!token.id) {
        return { ...session, user: undefined };
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
