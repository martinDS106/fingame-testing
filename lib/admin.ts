function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseAdminEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((e) => normalizeEmail(e))
    .filter(Boolean);
}

function parseBoolean(raw: string | undefined): boolean {
  if (!raw) return false;
  const v = raw.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

/**
 * Lightweight admin gate for MVP.
 *
 * Configure via env:
 *   EXPO_PUBLIC_ADMIN_EMAILS="admin1@example.com,admin2@example.com"
 *   EXPO_PUBLIC_ENABLE_ADMIN_UI=true
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = parseAdminEmails(process.env.EXPO_PUBLIC_ADMIN_EMAILS);
  if (!admins.length) return false;
  return admins.includes(normalizeEmail(email));
}

export function isAdminUIEnabled(): boolean {
  return parseBoolean(process.env.EXPO_PUBLIC_ENABLE_ADMIN_UI);
}

