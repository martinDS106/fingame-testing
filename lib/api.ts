import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

export const API_SESSION_EXPIRED_EVENT = 'fin-game/api-session-expired';

type ApiError = { message: string };

type AuthRefreshResponse = {
  tokens: { accessToken: string; refreshToken: string };
};

const apiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/+$/, '');
export const isApiConfigured = Boolean(apiBaseUrl);

// Debug aid: show which base URL the app is actually using.
// This helps diagnose "Network request timed out" issues on device.
try {
  // eslint-disable-next-line no-undef
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console
    console.log('[api] EXPO_PUBLIC_API_BASE_URL =', apiBaseUrl || '(empty)');
  }
} catch {
  // ignore
}

export const API_ACCESS_TOKEN_KEY = 'fin-game/api-access-token';
export const API_REFRESH_TOKEN_KEY = 'fin-game/api-refresh-token';

export function getApiBaseUrl(): string {
  return apiBaseUrl;
}

let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

let refreshPromise: Promise<boolean> | null = null;

export function setApiAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getApiAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function getApiRefreshToken(): string | null {
  return inMemoryRefreshToken;
}

export function setApiRefreshToken(token: string | null): void {
  inMemoryRefreshToken = token;
}

export async function loadApiAccessToken(): Promise<string | null> {
  const t = (await AsyncStorage.getItem(API_ACCESS_TOKEN_KEY)) ?? null;
  inMemoryAccessToken = t;
  return t;
}

export async function loadApiRefreshToken(): Promise<string | null> {
  const t = (await AsyncStorage.getItem(API_REFRESH_TOKEN_KEY)) ?? null;
  inMemoryRefreshToken = t;
  return t;
}

export async function loadApiTokens(): Promise<void> {
  await loadApiAccessToken();
  await loadApiRefreshToken();
}

export async function persistApiAccessToken(token: string | null): Promise<void> {
  if (!token) {
    await AsyncStorage.removeItem(API_ACCESS_TOKEN_KEY);
    inMemoryAccessToken = null;
    return;
  }
  await AsyncStorage.setItem(API_ACCESS_TOKEN_KEY, token);
  inMemoryAccessToken = token;
}

export async function persistApiRefreshToken(token: string | null): Promise<void> {
  if (!token) {
    await AsyncStorage.removeItem(API_REFRESH_TOKEN_KEY);
    inMemoryRefreshToken = null;
    return;
  }
  await AsyncStorage.setItem(API_REFRESH_TOKEN_KEY, token);
  inMemoryRefreshToken = token;
}

export async function persistApiAuthTokens(
  accessToken: string | null,
  refreshToken: string | null
): Promise<void> {
  await persistApiAccessToken(accessToken);
  await persistApiRefreshToken(refreshToken);
}

export async function clearPersistedApiAccessToken(
  opts: { emitSessionExpired?: boolean } = {},
): Promise<void> {
  await AsyncStorage.multiRemove([API_ACCESS_TOKEN_KEY, API_REFRESH_TOKEN_KEY]);
  inMemoryAccessToken = null;
  inMemoryRefreshToken = null;
  if (opts.emitSessionExpired) {
    try {
      DeviceEventEmitter.emit(API_SESSION_EXPIRED_EVENT);
    } catch {
      // ignore
    }
  }
}

async function postRefreshRequest(refreshToken: string): Promise<AuthRefreshResponse> {
  const url = buildUrl('/auth/refresh');
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12000);
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      // Include path + timeout for easier debugging on device.
      throw new Error(`Network request timed out (12000ms) @ /auth/refresh`);
    }
    throw err instanceof Error ? err : new Error('Network request failed');
  } finally {
    clearTimeout(t);
  }
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as Partial<ApiError>;
      if (body?.message) msg = String(body.message);
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return (await res.json()) as AuthRefreshResponse;
}

/**
 * Uses stored refresh token to obtain new access (+ rotated refresh). Single-flight.
 */
export async function refreshApiTokensWithStoredRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      await loadApiRefreshToken();
      const refresh = getApiRefreshToken();
      if (!refresh) return false;

      const data = await postRefreshRequest(refresh);
      if (!data?.tokens?.accessToken || !data?.tokens?.refreshToken) return false;

      await persistApiAuthTokens(data.tokens.accessToken, data.tokens.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * After app cold start: if access is missing but refresh exists, obtain access.
 */
export async function bootstrapApiSessionFromRefresh(): Promise<boolean> {
  await loadApiTokens();
  if (getApiAccessToken()) return true;
  if (!getApiRefreshToken()) return false;
  return refreshApiTokensWithStoredRefresh();
}

function buildUrl(path: string): string {
  if (!isApiConfigured) {
    throw new Error('API not configured (missing EXPO_PUBLIC_API_BASE_URL).');
  }
  return `${apiBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

async function parseErrorMessage(res: Response): Promise<string> {
  let msg = `HTTP ${res.status}`;
  try {
    const body = (await res.json()) as Partial<ApiError>;
    if (body?.message) msg = String(body.message);
  } catch {
    // ignore
  }
  return msg;
}

export async function apiRequestJson<T>(
  path: string,
  init: RequestInit & {
    timeoutMs?: number;
    auth?: boolean;
    /** @internal retry once after refresh */
    _refreshRetried?: boolean;
  }
): Promise<T> {
  const url = buildUrl(path);
  const { timeoutMs: timeoutMsOpt, auth, _refreshRetried, ...fetchInit } = init;
  // Mobile networks / tunnels can be slow; use a more forgiving default.
  const timeoutMs = timeoutMsOpt ?? 20000;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const headers = new Headers(fetchInit.headers ?? {});
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');

  const token = auth ? getApiAccessToken() : null;
  if (auth) {
    if (!token) throw new Error('Not authenticated (missing API access token).');
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...fetchInit,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Network request timed out');
    }
    throw err instanceof Error ? err : new Error('Network request failed');
  } finally {
    clearTimeout(t);
  }

  if (res.status === 401 && auth && !_refreshRetried) {
    await res.text();
    const ok = await refreshApiTokensWithStoredRefresh();
    if (ok) {
      return apiRequestJson<T>(path, { ...init, _refreshRetried: true });
    }
    await clearPersistedApiAccessToken({ emitSessionExpired: true });
    throw new Error('Session expired. Please sign in again.');
  }
  // If we already retried after refresh and still got 401, clear tokens to avoid
  // endless "Unauthorized" spam loops.
  if (res.status === 401 && auth && _refreshRetried) {
    await res.text();
    await clearPersistedApiAccessToken({ emitSessionExpired: true });
    throw new Error('Session expired. Please sign in again.');
  }

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }

  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export async function apiGetJson<T>(
  path: string,
  opts?: { timeoutMs?: number; auth?: boolean }
): Promise<T> {
  return apiRequestJson<T>(path, {
    method: 'GET',
    auth: opts?.auth,
    timeoutMs: opts?.timeoutMs,
  });
}

export async function apiPostJson<TResponse, TBody extends object>(
  path: string,
  body: TBody,
  opts?: { timeoutMs?: number; auth?: boolean }
): Promise<TResponse> {
  return apiRequestJson<TResponse>(path, {
    method: 'POST',
    auth: opts?.auth,
    timeoutMs: opts?.timeoutMs,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function apiPatchJson<TResponse, TBody extends object>(
  path: string,
  body: TBody,
  opts?: { timeoutMs?: number; auth?: boolean }
): Promise<TResponse> {
  return apiRequestJson<TResponse>(path, {
    method: 'PATCH',
    auth: opts?.auth,
    timeoutMs: opts?.timeoutMs,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
