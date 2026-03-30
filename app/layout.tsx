import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GeoPulse",
  description: "AI-native geopolitics analysis on a live Cesium globe."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
