import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Nomi",
  title: {
    default: "Nomi | Adaptive AI Learning Companion",
    template: "%s | Nomi",
  },
  description: "Nomi learns how you learn, adapting practice, guidance and support to your learning journey.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nomi",
  },
  icons: {
    icon: [
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "Nomi",
    title: "Nomi | Adaptive AI Learning Companion",
    description: "Nomi learns how you learn, adapting practice, guidance and support to your learning journey.",
    images: [
      {
        url: "/brand/nomi/social/nomi-site-preview.png",
        width: 1200,
        height: 630,
        alt: "Nomi learns how you learn.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nomi | Adaptive AI Learning Companion",
    description: "Nomi learns how you learn, adapting practice, guidance and support to your learning journey.",
    images: ["/brand/nomi/social/nomi-site-preview.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#6C3CFF",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} ${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
