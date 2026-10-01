import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memo — Food tracking that learns you",
  description: "A food tracker that gets easier the more you use it.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
