import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Shopyacu Online Store",
  description: "Shop practical home, kitchen, bathroom, fitness, office, and outdoor products in Kigali.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothMotionProvider>{children}</SmoothMotionProvider>
      </body>
    </html>
  );
}
