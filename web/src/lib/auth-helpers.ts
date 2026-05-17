import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

export async function requireAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (!isAdminRole(session.user.role)) redirect("/account");
  return session;
}

export async function requireCustomerPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireAdminApi() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      session: null,
    };
  }
  return { error: null, session };
}

export async function requireAuthApi() {
  const session = await auth();
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }
  return { error: null, session };
}
