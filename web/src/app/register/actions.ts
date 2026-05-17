"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { FIXED_ADMIN } from "@/lib/admin-constants";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 8) {
    redirect("/register?error=invalid");
  }

  if (email === FIXED_ADMIN.email.toLowerCase()) {
    redirect("/register?error=reserved");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/register?error=exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, name, passwordHash, role: "CUSTOMER" },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/account",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=created");
    }
    throw error;
  }
}
