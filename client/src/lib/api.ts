// Dual-backend API client
// - userApi → Go user-profile backend (VITE_USER_API_BASE_URL)
// - contentApi → Express BFF (same-origin, for articles/podcasts/live)

const USER_API_BASE = import.meta.env.VITE_USER_API_BASE_URL as string | undefined;

const TOKEN_KEY = "radioai_token";
const REFRESH_KEY = "radioai_refresh";
const USER_KEY = "radioai_user";

// ---- Auth helpers ----

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefresh(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isUserBackendAvailable(): boolean {
  return !!USER_API_BASE;
}

export interface UserInfo {
  userId: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
}

export function getStoredUser(): UserInfo | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(u: UserInfo): void {
  localStorage.setItem(USER_KEY, JSON.stringify(u));
}

// ---- Generic fetch helpers ----

export function extractErrorMessage(status: number, body: string): string {
  try {
    const json = JSON.parse(body);
    if (json?.error?.message) return json.error.message;
    if (json?.message) return json.message;
    if (json?.error) return String(json.error);
  } catch {}
  return `${status}: ${body || "Request failed"}`;
}

async function request(
  baseUrl: string | undefined,
  method: string,
  path: string,
  data?: unknown,
  auth: boolean = false,
): Promise<Response> {
  const fullUrl = baseUrl ? `${baseUrl}${path}` : path;
  const headers: Record<string, string> = {};
  if (data !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getStoredToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
  if (res.status === 401 && auth) {
    clearTokens();
  }
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(extractErrorMessage(res.status, text));
  }
  return res;
}

// ---- User API (Go backend) ----

export async function userApi(
  method: string,
  path: string,
  data?: unknown,
  auth: boolean = true,
): Promise<Response> {
  return request(USER_API_BASE, method, path, data, auth);
}

export async function userApiJson<T>(
  method: string,
  path: string,
  data?: unknown,
  auth: boolean = true,
): Promise<T> {
  const res = await userApi(method, path, data, auth);
  return res.json();
}

// ---- Content API (Express, same-origin) ----

export async function contentApi(
  method: string,
  path: string,
  data?: unknown,
): Promise<Response> {
  return request(undefined, method, path, data, false);
}

// ---- Convenience wrappers ----

// Auth
export function registerUser(email: string, username: string, password: string) {
  return userApiJson("POST", "/api/auth/register", { email, username, password }, false);
}

export function loginUser(email: string, password: string) {
  return userApiJson("POST", "/api/auth/login", { email, password }, false);
}

// Profile
export function getProfile() {
  return userApiJson<UserInfo>("GET", "/api/private/profile");
}

export function updateProfile(fullName: string, bio: string) {
  return userApiJson("PUT", "/api/private/profile", { fullName: fullName, bio: bio });
}

export function changePassword(oldPassword: string, newPassword: string) {
  return userApiJson("POST", "/api/private/profile/change-password", {
    oldPassword,
    newPassword,
  });
}

// Settings
export function getSettings() {
  return userApiJson<Record<string, any>>("GET", "/api/private/settings");
}

export function updateSettings(section: string, data: Record<string, any>) {
  return userApiJson("PUT", `/api/private/settings/${section}`, data);
}

// Favorites
export function getFavorites() {
  return userApiJson("GET", "/api/private/favorites");
}

export function addFavorite(contentId: string, contentType: string = "article") {
  return userApiJson("POST", "/api/private/favorites", {
    content_id: contentId,
    content_type: contentType,
  });
}

export function removeFavorite(contentId: string, contentType: string = "article") {
  return userApiJson("DELETE", "/api/private/favorites", {
    content_id: contentId,
    content_type: contentType,
  });
}

// Downloads
export function getDownloads() {
  return userApiJson("GET", "/api/private/downloads");
}

export function addDownload(contentId: string, contentType: string = "article", quality: string = "high") {
  return userApiJson("POST", "/api/private/downloads", {
    content_id: contentId,
    content_type: contentType,
    download_quality: quality,
  });
}

export function removeDownload(contentId: string, contentType: string = "article") {
  return userApiJson("DELETE", "/api/private/downloads", {
    content_id: contentId,
    content_type: contentType,
  });
}

// History
export function getHistory() {
  return userApiJson("GET", "/api/private/history");
}

export function updateProgress(contentId: string, contentType: string, positionSec: number, durationSec: number) {
  return userApiJson("POST", "/api/private/history/progress", {
    content_id: contentId,
    content_type: contentType,
    position_sec: positionSec,
    duration_sec: durationSec,
  });
}

export function getHistoryStats() {
  return userApiJson("GET", "/api/private/history/stats");
}

export function clearHistory() {
  return userApiJson("DELETE", "/api/private/history");
}
