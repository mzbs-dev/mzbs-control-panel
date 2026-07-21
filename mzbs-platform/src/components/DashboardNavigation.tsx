"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";

interface NavPage {
  name: string;
  path: string;
}

const MAIN_NAV_PAGES: NavPage[] = [
  { name: "Tenants", path: "/dashboard" },
  { name: "Signups", path: "/dashboard/signups" },
  { name: "Create Tenant", path: "/dashboard/tenants/create" },
];

export function DashboardNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const currentIndex = useMemo(() => {
    // For tenant detail pages, treat them as viewing from dashboard
    if (pathname.startsWith("/dashboard/") && !pathname.includes("/signups") && !pathname.includes("/tenants/create")) {
      return 0;
    }
    
    return MAIN_NAV_PAGES.findIndex((page) => pathname === page.path);
  }, [pathname]);

  const previousPage = useMemo(() => {
    if (currentIndex === -1) return null;
    const prevIndex = (currentIndex - 1 + MAIN_NAV_PAGES.length) % MAIN_NAV_PAGES.length;
    return MAIN_NAV_PAGES[prevIndex];
  }, [currentIndex]);

  const nextPage = useMemo(() => {
    if (currentIndex === -1) return null;
    const nextIndex = (currentIndex + 1) % MAIN_NAV_PAGES.length;
    return MAIN_NAV_PAGES[nextIndex];
  }, [currentIndex]);

  if (currentIndex === -1) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 flex items-center justify-center gap-4 px-6 pointer-events-none">
      {previousPage && (
        <Link
          href={previousPage.path}
          className="pointer-events-auto p-3 rounded-full bg-slate/10 hover:bg-slate/20 text-slate hover:text-ink transition-all duration-200 group"
          title={`Go to ${previousPage.name}`}
        >
          <svg
            className="w-5 h-5 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      )}

      <div className="hidden sm:flex items-center gap-2">
        {MAIN_NAV_PAGES.map((page, idx) => (
          <div key={page.path} className="flex items-center gap-2">
            <Link
              href={page.path}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                idx === currentIndex
                  ? "bg-accent/20 text-accent font-semibold"
                  : "bg-slate/10 text-slate hover:bg-slate/20 hover:text-ink"
              }`}
            >
              {page.name}
            </Link>
            {idx < MAIN_NAV_PAGES.length - 1 && (
              <span className="text-slate/30">•</span>
            )}
          </div>
        ))}
      </div>

      {nextPage && (
        <Link
          href={nextPage.path}
          className="pointer-events-auto p-3 rounded-full bg-slate/10 hover:bg-slate/20 text-slate hover:text-ink transition-all duration-200 group"
          title={`Go to ${nextPage.name}`}
        >
          <svg
            className="w-5 h-5 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}
