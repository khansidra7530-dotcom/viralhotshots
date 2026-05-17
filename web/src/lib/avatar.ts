/** Profile image URL — custom upload URL or generated initials avatar. */
export function resolveAvatarUrl(name: string, avatar?: string | null): string {
  if (avatar?.trim()) return avatar.trim();
  const encoded = encodeURIComponent(name || "User");
  return `https://ui-avatars.com/api/?name=${encoded}&background=0d9488&color=fff&size=256&bold=true`;
}
