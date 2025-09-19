import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "@/components/ui/Footer";
import Logo from "@/components/ui/Logo";
import SessionManager from "@/components/SessionManager";
import Link from "next/link";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/auth";
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
          <SessionManager>
<header className="bg-white shadow sticky top-0 z-10">
  <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-4">
    {/* Left side: Logo + Links */}
    <div className="flex items-center gap-4">
      <Link
        href="/"
        className="flex gap-2 items-center font-semibold text-lg hover:opacity-90 transition"
      >
        <Logo className="h-10 w-auto" />
        <span>Campus Marketplace</span>
      </Link>
      <div className="h-6 w-[1px] bg-gray-500/50"/>
      <nav className="flex gap-5">
        <Link
          href="/"
          className="text-gray-700 hover:text-accent hover:underline underline-offset-4 transition"
        >
          Marketplace
        </Link>
        <Link
          href="/profile/user"
          className="text-gray-700 hover:text-accent hover:underline underline-offset-4 transition"
        >
          Profile
        </Link>
        <Link
          href="/cart"
          className="text-gray-700 hover:text-accent hover:underline underline-offset-4 transition"
        >
          Cart
        </Link>
      </nav>
    </div>

    {/* Right side: Auth buttons */}
    <ul className="flex gap-4 items-center">
      <li>
        <AuthButtons />
      </li>
    </ul>
  </div>
</header>



          {/* Main content grows to fill available space */}
          <main className="flex-grow pt-10">{children}</main>

          {/* Footer at bottom */}
          <Footer />
          <Toaster richColors closeButton />
          </SessionManager>
        </AuthProvider>
      </body>
    </html>
  );
}
