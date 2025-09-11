"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const navItems = [
    { name: "Dashboard", href: "/admin" },
    { name: "Users", href: "/admin/users" },
    { name: "Items", href: "/admin/items" },
    { name: "Reports", href: "/admin/reports" },
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
