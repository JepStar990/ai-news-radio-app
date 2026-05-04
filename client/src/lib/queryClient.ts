import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getStoredToken, clearTokens } from "./api";

// Content API base URL (Express, same-origin fallback)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
// User API base URL (Go backend)
const USER_API_BASE = import.meta.env.VITE_USER_API_BASE_URL as string | undefined;

// Routes that should go to the user (Go) backend
const USER_API_PREFIXES = ["/api/auth", "/api/private"];

function isUserApiRoute(url: string): boolean {
  return USER_API_PREFIXES.some((p) => url.startsWith(p)) && !!USER_API_BASE;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  let fullUrl: string;
  const headers: Record<string, string> = {};

  if (isUserApiRoute(url)) {
    fullUrl = `${USER_API_BASE}${url}`;
    const token = getStoredToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } else {
    fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  }

  if (data !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (res.status === 401 && isUserApiRoute(url)) {
    clearTokens();
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    let fullUrl: string;
    const headers: Record<string, string> = {};

    if (isUserApiRoute(url)) {
      fullUrl = `${USER_API_BASE}${url}`;
      const token = getStoredToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    } else {
      fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    }

    const res = await fetch(fullUrl, { headers, credentials: "include" });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    if (res.status === 401 && isUserApiRoute(url)) {
      clearTokens();
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
