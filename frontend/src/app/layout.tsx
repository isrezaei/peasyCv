import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts/fonts";
import { t } from "@/lib/i18n";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: t.app.title,
  description: t.app.title,
  // The studio (studio.peasycv.ir) is an application, not content — keep it out
  // of search indexes. The marketing site (peasycv.ir) is what should rank; it
  // never lists the studio in its sitemap. Paired with an X-Robots-Tag header in
  // next.config.ts so non-HTML responses are covered too.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
  auth,
}: Readonly<{
  children: React.ReactNode;
  // The @auth parallel slot: the login modal when /login is soft-navigated to
  // from inside the app (interception), null otherwise (see app/@auth).
  auth: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: next-themes (mounted by the editor app only)
    // sets the color-mode class on <html> before hydration, which React would
    // otherwise report as a server/client attribute mismatch.
    <html lang="fa" dir="rtl" className={fontVariables} suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          {auth}
        </Providers>
      </body>
    </html>
  );
}
