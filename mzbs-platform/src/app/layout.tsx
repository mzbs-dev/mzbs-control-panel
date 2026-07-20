import type { Metadata } from "next";
import "./globals.css";
import { PlatformAdminProvider } from "@/context/PlatformAdminContext";

export const metadata: Metadata = {
  title: "mzbs",
  description: "School management platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink font-sans antialiased">
        <PlatformAdminProvider>{children}</PlatformAdminProvider>
      </body>
    </html>
  );
}
