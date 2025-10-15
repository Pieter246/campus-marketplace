import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "@/components/ui/Footer";
import Header from "@/components/ui/Header";
import SessionManager from "@/components/SessionManager";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/auth";
import CookieNotice from "@/components/CookieNotice"; // New import

const rubikSans = localFont({
  src: "./fonts/Rubik-Var.ttf",
  variable: "--font-rubik-sans",
});

const rubikItalic = localFont({
  src: "./fonts/Rubik-Italic-Var.ttf",
  variable: "--font-rubik-italic",
});

export const metadata: Metadata = {
  title: "Campus Marketplace",
  description: "Buy and sell on campus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rubikSans.variable} ${rubikItalic.variable} antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
            <SessionManager />
            <Header />
            <main className="flex-grow pt-10">{children}</main>
            <Footer />
            <Toaster richColors closeButton />
            <CookieNotice /> {/* Added here */}
        </AuthProvider>
      </body>
    </html>
  );
}