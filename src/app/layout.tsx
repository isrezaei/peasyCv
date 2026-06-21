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
    <html lang="fa" dir="rtl" className={fontVariables}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
