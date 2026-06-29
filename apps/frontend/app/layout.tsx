import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StartupOS — tools for building stuff",
  description: "A bunch of tools I wish existed while building projects. Made by a student.",
  keywords: "startup, founder, side project, tools",
  icons: {
    icon: [
      { url: "/logo-square.png", sizes: "any" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/logo-square.png" }],
  },
  openGraph: {
    title: "StartupOS — tools for building stuff",
    description: "A bunch of tools I wish existed while building projects.",
    type: "website",
    siteName: "StartupOS",
  },
  twitter: {
    card: "summary_large_image",
    title: "StartupOS — tools for building stuff",
    description: "A bunch of tools I wish existed while building projects.",
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
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground" suppressHydrationWarning>
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
