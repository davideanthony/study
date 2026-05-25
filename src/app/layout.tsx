import type { Metadata } from "next";
import Link from "next/link";
import { Nunito } from "next/font/google";
import { Header } from "@/components/Header";
import { PlausibleProvider } from "@/components/PlausibleProvider";
import { SITE_NAME, LOGO_SRC, FAVICON_SRC } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const siteDescription =
  "Condividi e trova appunti universitari. Cerca per corso e università, scarica PDF, metti cuore e commenta.";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: `${SITE_NAME} — Appunti universitari`,
    template: `%s | ${SITE_NAME}`,
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Appunti universitari`,
    description: siteDescription,
    images: [
      {
        url: LOGO_SRC,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Appunti universitari`,
    description: siteDescription,
    images: [LOGO_SRC],
  },
  icons: {
    icon: [{ url: FAVICON_SRC, type: "image/png" }],
    apple: [{ url: FAVICON_SRC, type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-light bg-surface/60 py-8 text-center text-sm text-muted shadow-[var(--shadow-soft)]">
          <p>{SITE_NAME} — appunti universitari, semplici.</p>
          <p className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link href="/privacy" className="font-medium text-sage hover:underline">
              Privacy
            </Link>
            <Link href="/termini" className="font-medium text-sage hover:underline">
              Termini
            </Link>
          </p>
        </footer>
        <PlausibleProvider />
      </body>
    </html>
  );
}
