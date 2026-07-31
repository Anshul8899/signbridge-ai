import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SignBridge AI – Breaking Communication Barriers Through AI",
  description:
    "Learn American Sign Language with AI-powered interactive lessons, 3D avatars, and real-time practice feedback.",
  keywords: ["sign language", "ASL", "AI learning", "accessibility", "deaf community"],
  openGraph: {
    title: "SignBridge AI",
    description: "Breaking Communication Barriers Through AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
