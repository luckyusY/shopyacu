import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { FloatingSupport } from "@/components/FloatingSupport";
import { InstallPrompt } from "@/components/InstallPrompt";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ScrollProgressIndicator } from "@/components/ScrollProgressIndicator";
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-M7CDRBWQL9"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-M7CDRBWQL9');
          `}
        </Script>
        <PostHogProvider>
          <SmoothMotionProvider>
            {children}
            <ScrollProgressIndicator />
            <FloatingSupport />
            <InstallPrompt />
          </SmoothMotionProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
