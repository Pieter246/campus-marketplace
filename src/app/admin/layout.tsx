"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, customClaims, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!currentUser || !customClaims?.admin)) {
      router.push('/login?reason=admin-required');
    }
  }, [currentUser, customClaims, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Don't render if not admin
  if (!currentUser || !customClaims?.admin) {
    return null;
  }

  const navItems = [
    { name: "Dashboard", href: "/admin" },
    { name: "Users", href: "/admin/users" },
    { name: "Items", href: "/admin/items" },
    /*{ name: "Reports", href: "/admin/reports" }, */
  ];

  return (
    <div className="flex justify-center items-start min-h-screen pr-6 pl-6">
      {/* Floating card wrapper like login page */}
      <div className="flex w-full max-w-7xl bg-transparent gap-6">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg rounded-2xl sticky top-24 self-start h-fit pb-3">
          <div className="px-6 py-4 border-b">
            <h1 className="text-xl font-bold text-primary">Campus Marketplace</h1>
            <p className="text-sm text-gray-600">Admin Dashboard</p>
          </div>
          <nav className="mt-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-6 py-3 text-sm font-medium transition-colors rounded-lg mx-2 ${
                  pathname === item.href
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Page content */}
        <main className="flex-1 bg-white shadow-lg rounded-2xl p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
