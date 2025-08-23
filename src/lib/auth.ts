export function requireAdmin(key: string | null | undefined) {
  const expected = process.env.ADMIN_KEY || "changeme";
  return key === expected;
}
