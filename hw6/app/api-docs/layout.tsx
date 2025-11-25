import type { Metadata } from "next";

/**
 * Layout for API documentation page
 */
export const metadata: Metadata = {
  title: "API Documentation",
  description: "Interactive API documentation for HW6 LINE Bot",
};

export default function ApiDocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

