"use client";

import { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AUTH_ROUTES } from "@/constants/ApiRoutes";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  _id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  skillLevel: string;
  assessmentStatus: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, skillLevel?: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function authFetch(url: string, body: object) {
  const res  = await fetch(url, {
    method:      "POST",
    headers:     { "Content-Type": "application/json" },
    credentials: "include",
    body:        JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Request failed");
  return data;
}

async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch(AUTH_ROUTES.ME, {
    credentials: "include",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user ?? null;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Single source of truth — validated against /auth/me using the httpOnly cookie.
  const { data: user = null, isLoading } = useQuery<AuthUser | null>({
    queryKey:          ["auth", "me"],
    queryFn:           fetchMe,
    staleTime:         5 * 60 * 1000,  // re-validate every 5 min
    retry:             false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authFetch(AUTH_ROUTES.LOGIN, { email, password }),
    onSuccess: (data) => {
      // cookie is set by the backend response
      queryClient.setQueryData(["auth", "me"], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password, skillLevel }: { name: string; email: string; password: string; skillLevel: string }) =>
      authFetch(AUTH_ROUTES.REGISTER, { name, email, password, skillLevel }),
    onSuccess: (data) => {
      // cookie is set by the backend response
      queryClient.setQueryData(["auth", "me"], data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () =>
      fetch(AUTH_ROUTES.LOGOUT, { method: "POST", credentials: "include" }).catch(() => {}),
    onSettled: () => {
      queryClient.setQueryData(["auth", "me"], null);
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (name: string, email: string, password: string, skillLevel = "medium") => {
    await registerMutation.mutateAsync({ name, email, password, skillLevel });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
