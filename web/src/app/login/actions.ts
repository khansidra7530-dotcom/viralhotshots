"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { safeCallbackUrl } from "@/lib/safe-callback-url";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = safeCallbackUrl(String(formData.get("callbackUrl") ?? "/account"));

  if (!email || !password) {
    redirect("/login?error=missing");
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=credentials&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw error;
  }
}
