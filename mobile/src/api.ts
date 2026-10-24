import { clearSavedToken, loadSavedToken, saveToken as saveTokenToStorage } from './tokenStore';

export const API_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000'
).replace(/\/+$/, '');

const TOKEN_KEY = 'viatech_access_token';
let token: string | null = null;
let onUnauthorized: (() => void) | undefined;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export async function loadToken() {
  token = await loadSavedToken(TOKEN_KEY);
  return token;
}

export async function saveToken(value: string) {
  token = value;
  await saveTokenToStorage(TOKEN_KEY, value);
}

export async function clearToken() {
  token = null;
  await clearSavedToken(TOKEN_KEY);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      cache: 'no-store',
    });
  } catch {
    throw new Error(`Cannot reach ${API_URL}. Check the API address and network connection.`);
  }

  if (response.status === 401) {
    if (token) {
      await clearToken();
      onUnauthorized?.();
    }
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message.join(', ');
      else if (body.message) message = body.message;
    } catch {
      // Use the HTTP status when the response is not JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const jsonBody = (body: unknown) => JSON.stringify(body);
