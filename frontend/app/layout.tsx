import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/providers/AuthProvider";
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
  title: "AI Stock Advisor",
  description:
    "AI-powered personalized investment analysis with multi-agent research",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="en" className="dark">
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <AuthProvider>{children}</AuthProvider>
    </body>
  </html>
);

export default RootLayout;
