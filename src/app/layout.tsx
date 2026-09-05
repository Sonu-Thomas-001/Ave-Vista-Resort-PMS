import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = "https://avevistaresortspms.vercel.app";
const APP_TITLE = "Ave Vista Resort & Hotels — Luxury PMS Workstation";
const APP_DESCRIPTION = "Comprehensive enterprise Property Management System for Ave Vista Resort & Hotels. Streamlining reservations, front desk guest folios, room inventory, restaurant POS dining, and executive night audit intelligence.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_TITLE,
    template: "%s | Ave Vista Resort PMS",
  },
  description: APP_DESCRIPTION,
  applicationName: "Ave Vista Resort PMS",
  keywords: [
    "Ave Vista Resort",
    "Ave Vista PMS",
    "Property Management System",
    "Hotel Operations Software",
    "Luxury Resort Workstation",
    "Front Desk Folio Management",
    "Guest Reservation System",
    "Restaurant POS Billing",
    "Night Audit Intelligence",
    "Calicut Resort"
  ],
  authors: [{ name: "Ave Vista Resort & Hotels", url: APP_URL }],
  creator: "Ave Vista Resort & Hotels",
  publisher: "MidCell Studios",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "Ave Vista Resort PMS",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/ui-img.png",
        width: 1200,
        height: 630,
        alt: "Ave Vista Resort PMS Enterprise Workstation Preview",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    images: ["/ui-img.png"],
    creator: "@avevistaresort",
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        url: '/favicon/favicon.ico',
      },
    ],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ave Vista PMS",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
