"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlatformAdmin } from "@/context/PlatformAdminContext";

export default function ProtectedPlatformRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = usePlatformAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
    }
  }, [loading, token, router]);

  if (loading || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate">
        Checking your session…
      </div>
    );
  }

  return <>{children}</>;
}
