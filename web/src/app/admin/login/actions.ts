"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

export async function adminLoginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/login?error=credentials");
    }
    throw error;
  }

  const session = await auth();
  if (!isAdminRole(session?.user?.role)) {
    await signOut({ redirect: false });
    redirect("/admin/login?error=notadmin");
  }

  redirect("/admin");
}
