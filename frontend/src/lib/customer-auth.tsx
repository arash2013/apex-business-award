"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const STORAGE_KEY = "customer_token";

export interface CustomerSession {
  access_token: string;
  customer_id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextValue {
  session: CustomerSession | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (token: string) => {
    const res = await fetch(`${API_BASE}/api/v1/customer/auth/verify?token=${encodeURIComponent(token)}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail ?? "Invalid or expired link");
    }
    const data: CustomerSession = await res.json();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSession(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
}

export async function customerFetch(
  path: string,
  token: string,
  init?: RequestInit,
) {
  const res = await fetch(`${API_BASE}/api/v1/customer${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export async function requestMagicLink(email: string) {
  const res = await fetch(`${API_BASE}/api/v1/customer/auth/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail ?? "Failed to send login link");
  }
  return res.json() as Promise<{ message: string; magic_url?: string }>;
}
