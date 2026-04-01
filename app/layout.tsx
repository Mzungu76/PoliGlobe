import type { Metadata } from "next";
import Script from "next/script";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoPulse",
  description: "AI-native geopolitics surface for analysts"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <Script id="cesium-base-url" strategy="beforeInteractive">
          {`window.CESIUM_BASE_URL = "/cesium/";`}
        </Script>
        {children}
      </body>
    </html>
  );
}
