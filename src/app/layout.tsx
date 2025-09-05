import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { AuthProvider } from "@/context/auth";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import AuthButtons from "@/components/auth-buttons";

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
        <AuthProvider>
          <header className="bg-sky-950 shadow p-4 flex items-center justify-between sticky top-0 z-10"> {/* justify-between very important */}  
            <Link href="/" className="text-3xl tracking-widest flex gap-2 items-center uppercase">
              <Logo className="h-10 w-auto"/>
              <span>Campus Marketplace</span>
            </Link>
            <ul className="flex gap-6 items-center">
              <li>
                <Link href="/property-search" className="uppercase tracking-widest hover:underline">Property search</Link>
              </li>              
              <li>
                <AuthButtons />
              </li>
            </ul>
          </header>

          {/* Main content grows to fill available space */}
          <main className="flex-grow">{children}</main>

          {/* Footer at bottom */}
          <Footer />
          <Toaster richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
