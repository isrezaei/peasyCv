import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts/fonts";
import { t } from "@/lib/i18n";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: t.app.title,
  description: t.app.title,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: next-themes (mounted by the editor app only)
    // sets the color-mode class on <html> before hydration, which React would
    // otherwise report as a server/client attribute mismatch.
    <html lang="fa" dir="rtl" className={fontVariables} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
