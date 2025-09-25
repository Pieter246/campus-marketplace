"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export default function AuthButtons() {
  const router = useRouter();
  const auth = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (auth.isLoading) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-4 w-20 rounded bg-gray-300 animate-pulse" />
        <div className="h-4 w-20 rounded bg-gray-300 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      {auth.currentUser ? (
        <>
          {/* Sell Item */}
          <Link
            href="/profile/new"
            className="font-semibold text-secondary underline hover:text-accent hover:underline underline-offset-4 transition"
          >
            Sell Item
          </Link>
          <div className="h-6 w-[1px] bg-gray-500/50" />
          <Link
            href="/cart"
            className="text-gray-700 hover:text-accent hover:underline underline-offset-4 transition"
          >
            Cart
          </Link>

          {/* Account Dropdown */}
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`
                  flex items-center gap-1
                  cursor-pointer transition
                  ${dropdownOpen ? "text-accent underline underline-offset-4" : "text-gray-700 hover:text-accent hover:underline underline-offset-4"}
                `}
              >
                {auth.currentUser.displayName || "Account"}
                <ChevronDown className="h-4 w-4" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              className="rounded-sm mt-1 min-w-[180px] bg-white border border-gray-200 p-1"
            >
              <DropdownMenuLabel className="px-3 py-2">
                <div className="font-medium">{auth.currentUser.displayName}</div>
                <div className="text-xs text-gray-700">{auth.currentUser.email}</div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {auth.customClaims?.admin && (
                <DropdownMenuItem
                  onClick={() => router.push("/admin")}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer rounded-sm"
                >
                  Admin Dashboard
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => router.push("/profile/user")}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer rounded-sm"
              >
                My Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={async () => {
                  await auth.logout();
                  router.refresh();
                }}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer rounded-sm"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
  );
}
