import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

// Configure Inter font with CSS variable
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Configure Roboto Mono font with CSS variable
const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

// Metadata for the application
export const metadata: Metadata = {
  title: "HW6",
  description: "A Next.js project built with TypeScript and Tailwind CSS",
};

/**
 * Root layout component that wraps all pages
 * Provides font configuration and global styles
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

