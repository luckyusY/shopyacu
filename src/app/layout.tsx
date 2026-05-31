import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { FloatingSupport } from "@/components/FloatingSupport";
import { InstallPrompt } from "@/components/InstallPrompt";
import { SmoothMotionProvider } from "@/components/SmoothMotionProvider";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Shopyacu Online Store",
  description: "Shop practical home, kitchen, bathroom, fitness, office, and outdoor products in Kigali.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Shopyacu" },
};

export const viewport: Viewport = {
  themeColor: "#f68b1e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothMotionProvider>
          {children}
          <FloatingSupport />
          <InstallPrompt />
        </SmoothMotionProvider>
      </body>
    </html>
  );
}
