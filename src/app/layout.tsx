import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
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
  title: {
    default: "PDF Toolkit - Privacy-First PDF Tools",
    template: "%s | PDF Toolkit"
  },
  description: "Merge, split, compress, and convert PDFs locally in your browser. No uploads, no sign-ups. 100% free and secure.",
  keywords: ["pdf tools", "merge pdf", "split pdf", "compress pdf", "pdf to word", "client-side pdf", "privacy first", "local pdf"],
  authors: [{ name: "PDF Toolkit" }],
  creator: "PDF Toolkit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pdf-toolkit.vercel.app",
    title: "PDF Toolkit - Privacy-First PDF Tools",
    description: "Merge, split, compress, and convert PDFs locally in your browser. No uploads, no sign-ups.",
    siteName: "PDF Toolkit",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Toolkit - Privacy-First PDF Tools",
    description: "Merge, split, compress, and convert PDFs locally in your browser. No uploads, no sign-ups.",
    creator: "@pdftoolkit",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
