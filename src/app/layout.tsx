import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "@/components/ui/Footer";
import Logo from "@/components/ui/Logo";
import SessionManager from "@/components/SessionManager";

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
  description: "Buy and sell textbooks and other items on campus",
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
        <SessionManager>
          <header className="p-4 bg-white shadow flex items-center sticky top-0 z-50">
            <Logo className="h-10 w-auto" />
            <h1 className="ml-4 text-xl font-bold">Campus Marketplace</h1>
          </header>

          {/* Main content grows to fill available space */}
          <main className="flex-grow pt-10">{children}</main>

          {/* Footer at bottom */}
          <Footer />
        </SessionManager>
      </body>
    </html>
  );
}
