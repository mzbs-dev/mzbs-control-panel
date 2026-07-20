"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { STORAGE_KEY } from "@/api/client";

interface PlatformAdminContextValue {
  token: string | null;
  setToken: (token: string | null) => void;
  loading: boolean;
}

const PlatformAdminContext = createContext<PlatformAdminContextValue>({
  token: null,
  setToken: () => {},
  loading: true,
});

export function PlatformAdminProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    setTokenState(stored);
    setLoading(false);
  }, []);

  function setToken(next: string | null) {
    setTokenState(next);
    if (next) {
      sessionStorage.setItem(STORAGE_KEY, next);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  return (
    <PlatformAdminContext.Provider value={{ token, setToken, loading }}>
      {children}
    </PlatformAdminContext.Provider>
  );
}

export function usePlatformAdmin() {
  return useContext(PlatformAdminContext);
}
