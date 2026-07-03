import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saarthi — Executive intelligence for MPs",
  description:
    "AI-powered executive intelligence platform for India's Members of Parliament.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
