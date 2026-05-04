/**
 * Dev fallbacks match `backend/.env.example`. In production, set env vars explicitly.
 */
export const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret_change_me';

export const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret_change_me';
