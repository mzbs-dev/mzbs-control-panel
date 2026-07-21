"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { STORAGE_KEY } from "@/api/client";

interface PlatformAdminContextValue {
  token: string | null;
  adminName: string | null;
  setToken: (token: string | null) => void;
  loading: boolean;
}

const PlatformAdminContext = createContext<PlatformAdminContextValue>({
  token: null,
  adminName: null,
  setToken: () => {},
  loading: true,
});

function decodeAdminName(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(padded));
    return typeof decoded?.name === "string" && decoded.name.trim() ? decoded.name : null;
  } catch {
    return null;
  }
}

export function PlatformAdminProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    setTokenState(stored);
    setAdminName(decodeAdminName(stored));
    setLoading(false);
  }, []);

  function setToken(next: string | null) {
    setTokenState(next);
    setAdminName(decodeAdminName(next));
    if (next) {
      sessionStorage.setItem(STORAGE_KEY, next);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  return (
    <PlatformAdminContext.Provider value={{ token, adminName, setToken, loading }}>
      {children}
    </PlatformAdminContext.Provider>
  );
}

export function usePlatformAdmin() {
  return useContext(PlatformAdminContext);
}
