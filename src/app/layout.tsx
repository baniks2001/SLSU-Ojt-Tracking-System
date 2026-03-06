import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SLSU OJT Tracking System",
  description: "Southern Leyte State University - OJT Tracking System (Daily Time Record)",
  metadataBase: new URL('https://slsu-ojt-tracking.vercel.app'),
  keywords: ['OJT', 'Time Tracking', 'SLSU', 'Daily Time Record', 'Student Management'],
  authors: [{ name: 'Southern Leyte State University' }],
  openGraph: {
    title: 'SLSU OJT Tracking System',
    description: 'Comprehensive time tracking and attendance management for OJT students',
    url: 'https://slsu-ojt-tracking.vercel.app',
    siteName: 'SLSU OJT Tracking',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SLSU OJT Tracking System',
    description: 'Comprehensive time tracking and attendance management for OJT students',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
