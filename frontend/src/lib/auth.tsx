import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types";
import { authApi } from "./api/auth";
import { getAccessToken, setTokens, subscribeToAuthChanges } from "./api/client";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  refreshToken: string | null;
  login: (loginId: string, password: string) => Promise<User>;
  signup: (input: { name: string; phone: string; password: string; email?: string }) => Promise<User>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem("quantaliez_auto_tokens");
    return raw ? JSON.parse(raw).refresh_token ?? null : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(readStoredRefreshToken());

  const reloadUser = async () => {
    if (!getAccessToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reloadUser();
    return subscribeToAuthChanges((tokens) => {
      setRefreshTokenValue(tokens?.refresh_token ?? null);
      if (!tokens) setUser(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (loginId: string, password: string): Promise<User> => {
    const loggedInUser = await authApi.login(loginId, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const signup = async (input: { name: string; phone: string; password: string; email?: string }): Promise<User> => {
    const newUser = await authApi.signup(input);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    if (refreshTokenValue) {
      try {
        await authApi.logout(refreshTokenValue);
      } catch {
        setTokens(null);
      }
    } else {
      setTokens(null);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshToken: refreshTokenValue, login, signup, logout, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
