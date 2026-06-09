import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { Analytics } from "@vercel/analytics/react";
import { branding } from "@/lib/branding";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const { company, urls, paths, metadata: meta } = branding;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  icons: {
    icon: [
      { url: paths.icon, type: "image/svg+xml" },
      { url: paths.logoSymbol, sizes: "any" },
      { url: paths.favicon, sizes: "any" },
    ],
    apple: [
      { url: paths.logoSymbol },
      { url: paths.icon },
    ],
  },
  openGraph: {
    title: meta.openGraph.title,
    description: meta.openGraph.description,
    url: urls.website,
    siteName: meta.openGraph.siteName,
    type: "website",
    images: [
      {
        url: paths.logoFull,
        width: branding.logoDimensions.full.width,
        height: branding.logoDimensions.full.height,
        alt: company.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: meta.twitter.title,
    description: meta.twitter.description,
    images: [paths.logoFull],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {/* Skip-to-content link for keyboard users */}
        <a
          href="#main-content"
          className="fixed -top-full left-4 z-[100] rounded-b-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-all focus:top-0 focus:outline-none"
        >
          Skip to content
        </a>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
