"use client"

import { useAuth } from "@/app/auth-hook"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Image from "next/image";
import { useEffect, useState } from "react";

//Fetch user data from API
export async function fetchUserProfile(user: any) {
    const idToken = await user.getIdToken(/* forceRefresh */ true);

    const res = await fetch("/api/users/profile", {
        method: "GET",
        headers: {
        "Authorization": `Bearer ${idToken}`
        }
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch profile");
    }

    const profile = await res.json();
    return profile;
}

export default function AuthButtons({children}: {children: React.ReactNode}) {
    const { user, loading, logout } = useAuth({children})
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);

    //Get user profile from backend (this is used to check if user is admin)
     useEffect(() => {
        if (user) {
        fetchUserProfile(user)
            .then(setProfile)
            .catch((err) => {
            console.error(err);
            setError(err.message);
            });
        }
    }, [user]);

    return (
        <div>
            {!!user && (
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Avatar>
                        {!!user.photoURL && (
                            <Image 
                                src={user.photoURL}
                                alt={`${user.displayName} avatar`}
                                width={70}
                                height={70}
                            />
                        )}
                        <AvatarFallback className="text-sky-950">
                            {(user.displayName || user.email)?.[0]}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>
                        <div>{user.displayName}</div>
                        <div className="font-normal text-xs">
                            {user.email}
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/account">My Account</Link>
                    </DropdownMenuItem>
                        {/* {!!profile.admin && (
                            <DropdownMenuItem asChild>
                                <Link href="/admin-dashboard">Admin Dashboard</Link>
                            </DropdownMenuItem>
                        )}
                        {!profile.admin && (
                            <DropdownMenuItem asChild>
                                <Link href="/account/my-favourites">My Favourites</Link>
                            </DropdownMenuItem>
                        )}                     */}
                    <DropdownMenuItem onClick={logout}>
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            )}
            {!user &&
                <div className="flex gap-2 items-center">
                    <Link href="/login" className="uppercase tracking-widest hover:underline">Login</Link>
                    <div className="h-8 w-[1px] bg-white/50"/>
                    <Link href="/register" className="uppercase tracking-widest hover:underline">Signup</Link>
                </div>
            }
        </div>
    )
}