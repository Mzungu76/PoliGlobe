import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoPulse",
  description: "AI-native geopolitics surface for analysts"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
