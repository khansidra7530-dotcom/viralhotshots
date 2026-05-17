export type AppRole = "ADMIN" | "CUSTOMER";

export function isAdminRole(role?: string | null): role is "ADMIN" {
  return role === "ADMIN";
}

export function isCustomerRole(role?: string | null): role is "CUSTOMER" {
  return role === "CUSTOMER";
}
