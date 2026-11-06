
import { useEffect, useState, type ReactNode } from "react";
import { apiRequest, ApiError } from "../services/api";
import type { AuthResponse, MeResponse, User } from "../types/auth";
import { AuthContext } from "./auth-context";

const TOKEN_KEY = "goldmanstacks_token";

export function AuthProvider({ children }: { children: ReactNode }) {
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(
  () => sessionStorage.getItem(TOKEN_KEY) !== null,
);

useEffect(() => {
  const token = sessionStorage.getItem(TOKEN_KEY);

  if (!token) {
    return;
  }

  let cancelled = false;

  async function restoreSession() {
    try {
      const response = await apiRequest<MeResponse>("/auth/me");

      if (!cancelled) {
        setUser(response.user);
      }
    } catch (error) {
      if (cancelled) return;

      if (error instanceof ApiError && error.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
      }

      setUser(null);
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void restoreSession();

  return () => {
    cancelled = true;
  };
}, []);

  async function login(email: string, password: string) {
    const response = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    sessionStorage.setItem(TOKEN_KEY, response.token);
    setUser(response.user);
  }

  async function register(email: string, password: string) {
    const response = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    sessionStorage.setItem(TOKEN_KEY, response.token);
    setUser(response.user);
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
