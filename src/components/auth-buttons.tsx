"use client"

import { useAuth } from "@/context/auth";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AuthButtons() {
    const router = useRouter();
    const auth = useAuth();

    return (
        <div>
            {!!auth?.currentUser && (
            <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                    <Avatar>
                        {!!auth.currentUser.photoURL && (
                            <Image 
                                src={auth.currentUser.photoURL}
                                alt={`${auth.currentUser.displayName} avatar`}
                                width={70}
                                height={70}
                                className="cursor-pointer"
                            />
                        )}
                        <AvatarFallback className="cursor-pointer">
                            {(auth.currentUser.displayName || auth.currentUser.email)?.[0]}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mr-4 mt-5">
                    <DropdownMenuLabel>
                        <div>{auth.currentUser.displayName}</div>
                        <div className="font-normal text-xs">
                            {auth.currentUser.email}
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <>
                    {/* The Admin link */}
                    {auth.customClaims?.admin && (
                    <DropdownMenuItem
                        onClick={() => router.push("/profile/admin")}
                        className="cursor-pointer"
                    >
                        Admin Dashboard
                    </DropdownMenuItem>
                    )}
                    </>

                    {/* User link (always show for logged-in users) */}
                    <DropdownMenuItem asChild>
                    <Link href="/profile/user" className="cursor-pointer">
                        My Profile
                    </Link>
                    </DropdownMenuItem>


                    <DropdownMenuItem 
                    onClick={async () => {
                        await auth.logout();
                        router.refresh();
                    }}
                    className="cursor-pointer"
                    >
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            )}
            {!auth?.currentUser &&
                <div className="flex gap-2 items-center">
                    <Link href="/login" className="hover:underline">Login</Link>
                    <div className="h-6 w-[1px] bg-gray-500/50"/>
                    <Link href="/register" className="hover:underline">Sign Up</Link>
                </div>
            }
        </div>
    )
}