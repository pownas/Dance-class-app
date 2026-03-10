import * as SecureStore from 'expo-secure-store';

const API_BASE_URL_KEY = 'dance_app_api_base_url';
const DEFAULT_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://din-backend-api.com/api';

/**
 * Returns the currently configured backend base URL.
 * Falls back to the compile-time default when no custom URL is stored.
 */
export async function getApiBaseUrl(): Promise<string> {
  const stored = await SecureStore.getItemAsync(API_BASE_URL_KEY);
  return stored ?? DEFAULT_API_BASE_URL;
}

/**
 * Persists a custom backend base URL in device secure storage.
 * The URL must not end with a trailing slash.
 */
export async function setApiBaseUrl(url: string): Promise<void> {
  const normalised = url.replace(/\/+$/, '');
  await SecureStore.setItemAsync(API_BASE_URL_KEY, normalised);
}

/**
 * Removes any stored custom backend URL, reverting to the default.
 */
export async function clearApiBaseUrl(): Promise<void> {
  await SecureStore.deleteItemAsync(API_BASE_URL_KEY);
}

/**
 * Helper used by service modules to build a full endpoint URL.
 */
export async function buildUrl(path: string): Promise<string> {
  const base = await getApiBaseUrl();
  return `${base}${path}`;
}
