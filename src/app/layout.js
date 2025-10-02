import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ScrollRestoration from "./scroll-restoration";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Aura - Modern Job Portal & ATS Platform",
  description: "The AI-native job platform for candidates and teams. Find jobs, hire talent, and streamline recruitment with intelligent matching and ATS tools.",
  keywords: "jobs, hiring, recruitment, ATS, AI matching, resume parser, job portal, career platform",
  authors: [{ name: "Aura" }],
  creator: "Aura",
  publisher: "Aura",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://aura-jobs.com'), // Update with your actual domain
  openGraph: {
    title: "Aura - Modern Job Portal & ATS Platform",
    description: "The AI-native job platform for candidates and teams. Find jobs, hire talent, and streamline recruitment with intelligent matching and ATS tools.",
    type: "website",
    siteName: "Aura",
    images: [
      {
        url: "/logo.svg",
        width: 40,
        height: 40,
        alt: "Aura Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aura - Modern Job Portal & ATS Platform",
    description: "The AI-native job platform for candidates and teams. Find jobs, hire talent, and streamline recruitment with intelligent matching and ATS tools.",
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32x32.svg" sizes="32x32" type="image/svg+xml" />
        <link rel="icon" href="/favicon-16x16.svg" sizes="16x16" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Navbar />
          {children}
          <Footer />
          <ScrollRestoration />
        </Providers>
      </body>
    </html>
  );
}
