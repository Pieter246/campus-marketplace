"use client"

import { useAuth } from "@/context/auth"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Avatar, AvatarFallback } from "./ui/avatar"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function AuthButtons() {
  const router = useRouter()
  const auth = useAuth()

  // Show skeleton while auth state is loading
  if (auth.isLoading) {
    return (
      <div className="flex items-center">
        <div className="animate-pulse flex items-center gap-4">
          <div className="h-4 w-20 rounded bg-gray-300" />
          <div className="h-4 w-20 rounded bg-gray-300" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      {auth.currentUser ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer">
            <Avatar>
              {auth.currentUser.photoURL ? (
                <Image
                  src={auth.currentUser.photoURL}
                  alt={`${auth.currentUser.displayName} avatar`}
                  width={70}
                  height={70}
                  className="cursor-pointer rounded-full"
                />
              ) : (
                <AvatarFallback className="cursor-pointer">
                  {(auth.currentUser.displayName || auth.currentUser.email)?.[0]}
                </AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="mr-18 mt-5">
            <DropdownMenuLabel>
              <div>{auth.currentUser.displayName}</div>
              <div className="font-normal text-xs">{auth.currentUser.email}</div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Admin link */}
            {auth.customClaims?.admin && (
              <DropdownMenuItem
                onClick={() => router.push("/profile/admin")}
                className="cursor-pointer"
              >
                Admin Dashboard
              </DropdownMenuItem>
            )}

            {/* User link */}
            <DropdownMenuItem asChild>
              <Link href="/profile/user" className="cursor-pointer">
                My Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={async () => {
                await auth.logout()
                router.refresh()
              }}
              className="cursor-pointer"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex gap-4 items-center">
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
        </div>
      )}
    </div>
  )
}
