import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  isUserBackendAvailable,
  getStoredToken,
  getStoredUser,
  setTokens,
  clearTokens,
  setStoredUser,
  loginUser,
  registerUser,
  getProfile,
  type UserInfo,
} from "./api";

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isBackendAvailable: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const available = isUserBackendAvailable();

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginUser(email, password) as any;
    const access = data.access_token || data.accessToken;
    const refresh = data.refresh_token || data.refreshToken;
    setTokens(access, refresh);
    setToken(access);
    // Fetch profile after login
    try {
      const profile = await getProfile();
      setStoredUser(profile);
      setUser(profile);
    } catch {
      // profile fetch can fail gracefully
    }
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    await registerUser(email, username, password);
    // Auto-login after register
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setToken(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await getProfile();
      setStoredUser(profile);
      setUser(profile);
    } catch {
      // silently fail
    }
  }, [token]);

  // Try to load profile on mount if token exists
  useEffect(() => {
    if (token && available && !user) {
      refreshProfile();
    }
  }, [token, available, user, refreshProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isBackendAvailable: available,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
