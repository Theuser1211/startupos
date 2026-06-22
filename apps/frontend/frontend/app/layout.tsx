import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
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
  title: "StartupOS — AI-Powered Founder Toolkit",
  description: "The operating system for modern founders. Clarify your vision, align your team, and execute with precision.",
  keywords: "startup, founder, AI, business plan, blueprint, MVP",
  icons: {
    icon: [
      { url: "/logo-square.png", sizes: "any" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/logo-square.png" }],
  },
  openGraph: {
    title: "StartupOS — AI-Powered Founder Toolkit",
    description: "The operating system for modern founders.",
    type: "website",
    siteName: "StartupOS",
  },
  twitter: {
    card: "summary_large_image",
    title: "StartupOS — AI-Powered Founder Toolkit",
    description: "The operating system for modern founders.",
  },
  robots: { index: true, follow: true },
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
        <a
          href="#main-content"
          className="fixed -top-full left-4 z-[100] rounded-b-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-all focus:top-0 focus:outline-none"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
