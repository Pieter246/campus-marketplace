"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isAccountOpen) setIsAccountOpen(false);
  };

  const toggleAccountDropdown = () => {
    setIsAccountOpen(!isAccountOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };

    if (isAccountOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAccountOpen]);

  useEffect(() => {
    const handleTapOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleTapOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleTapOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-white shadow sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex gap-2 items-center font-semibold text-lg hover:opacity-90 transition"
          >
            <Logo className="h-10 w-auto" />
            <span className="hidden md:inline">Campus Marketplace</span>
          </Link>
          <div className="hidden md:block h-6 w-[1px] bg-gray-500/50" />
          <nav className="hidden md:flex gap-5">
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
              href="/how"
              className="text-gray-700 hover:text-accent hover:underline underline-offset-4 transition"
            >
              How It Works
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-4 items-center">
            {auth.isLoading ? (
              <div className="flex items-center gap-4">
                <div className="h-4 w-20 rounded bg-gray-300 animate-pulse" />
                <div className="h-4 w-20 rounded bg-gray-300 animate-pulse" />
              </div>
            ) : auth.currentUser ? (
              <>
                <Link
                  href="/profile/new"
                  className="font-semibold text-secondary hover:text-accent hover:underline underline-offset-4 transition"
                >
                  Sell
                </Link>
                <div className="h-6 w-[1px] bg-gray-500/50" />
                <Link
                  href="/cart"
                  className="text-gray-700 hover:text-accent hover:underline underline-offset-4 transition"
                >
                  Cart
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <div
                    onClick={toggleAccountDropdown}
                    className={`
                      flex items-center gap-1 cursor-pointer transition
                      ${
                        isAccountOpen
                          ? "text-accent underline underline-offset-4"
                          : "text-gray-700 hover:text-accent hover:underline underline-offset-4"
                      }
                    `}
                  >
                    {"Account"}
                    <ChevronDown className="h-4 w-4" />
                  </div>
                  {isAccountOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-sm shadow-lg z-20">
                      <div className="px-3 py-2">
                        <div className="font-medium">{auth.currentUser.displayName}</div>
                        <div className="text-xs text-gray-700">{auth.currentUser.email}</div>
                      </div>
                      <div className="border-t border-gray-200" />
                      {auth.isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-3 py-2 hover:bg-gray-100 rounded-sm"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/profile/user"
                        className="block px-3 py-2 hover:bg-gray-100 rounded-sm"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={async () => {
                          await auth.logout();
                          setIsAccountOpen(false);
                          router.refresh();
                        }}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded-sm cursor-pointer"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-accent hover:underline underline-offset-4 transition"
                >
                  Login
                </Link>
                <div className="h-6 w-[1px] bg-gray-500/50" />
                <Link
                  href="/register"
                  className="text-gray-700 hover:text-accent hover:underline underline-offset-4 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          <button
            className="md:hidden focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>
      <div
        ref={menuRef}
        className={`md:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-20 transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={toggleMenu}
            className="focus:outline-none"
            aria-label="Close menu"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>
        </div>
        <nav className="flex flex-col gap-4 p-4">
          {auth.isLoading ? (
            <div className="flex flex-col gap-4">
              <div className="h-4 w-20 rounded bg-gray-300 animate-pulse" />
              <div className="h-4 w-20 rounded bg-gray-300 animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex flex-row gap-2">
                <Button
                  variant="primary"
                  asChild
                  className="w-full text-left"
                  onClick={toggleMenu}
                >
                  <Link href="/profile/new">Sell</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full text-left"
                  onClick={toggleMenu}
                >
                  <Link href="/cart">Cart</Link>
                </Button>
              </div>
              <Link
                href="/"
                className="text-gray-700 hover:text-accent hover:underline underline-offset-4 transition"
                onClick={toggleMenu}
              >
                Marketplace
              </Link>
              <Link
                href="/how"
                className="text-gray-700 hover:text-accent hover:underline underline-offset-4 transition"
                onClick={toggleMenu}
              >
                How It Works
              </Link>
              <div className="border-t border-gray-200 my-2" />
              {auth.currentUser ? (
                <>
                  {auth.isAdmin && (
                    <Link
                      href="/admin"
                      className="text-gray-700 hover:text-accent hover:underline underline-offset-4 transition"
                      onClick={toggleMenu}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/profile/user"
                    className="text-gray-700 hover:text-accent hover:underline underline-offset-4 transition"
                    onClick={toggleMenu}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={async () => {
                      await auth.logout();
                      toggleMenu();
                      router.refresh();
                    }}
                    className="text-left text-gray-700 hover:text-accent hover:underline underline-offset-4 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-accent hover:underline underline-offset-4 transition"
                    onClick={toggleMenu}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-gray-700 hover:text-accent hover:underline underline-offset-4 transition"
                    onClick={toggleMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}