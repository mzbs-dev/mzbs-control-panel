import type { Metadata } from "next";
import MarketingHeader from "./components/MarketingHeader";
import MarketingFooter from "./components/MarketingFooter";

export const metadata: Metadata = {
  title: "mzbs — School Management Platform",
  description: "Modern school management for schools of every size. Manage students, attendance, exams, staff, fees, and more — all in one platform.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
