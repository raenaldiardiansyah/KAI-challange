import type { Metadata } from "next";
import "./globals.css";
import { AppFrame } from "@/components/layout/AppFrame";

export const metadata: Metadata = {
  title: "TEL-U Insight System",
  description: "RAMS Rail Assets Monitoring System frontend dashboard",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
