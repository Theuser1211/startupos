import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { Analytics } from "@vercel/analytics/react";
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

export const metadata: Metadata = {
  title: {
    default: "StartupOS — The Operating System for Modern Founders",
    template: "%s — StartupOS",
  },
  description:
    "Build your startup with AI-powered insights, brand analysis, revenue modeling, and strategic roadmaps. The complete founder toolkit.",
  keywords: ["startup", "founder", "AI", "business", "brand", "roadmap"],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: { url: "/icon.svg" },
  },
  openGraph: {
    title: "StartupOS — The Operating System for Modern Founders",
    description:
      "Build your startup with AI-powered insights, brand analysis, revenue modeling, and strategic roadmaps.",
    url: "https://startupos.app",
    siteName: "StartupOS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StartupOS — The Operating System for Modern Founders",
    description:
      "Build your startup with AI-powered insights, brand analysis, revenue modeling, and strategic roadmaps.",
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
