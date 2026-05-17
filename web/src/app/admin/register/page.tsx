import { redirect } from "next/navigation";

/** Admin accounts are created via seed/env — not public registration. */
export default function AdminRegisterPage() {
  redirect("/admin/login");
}
