"use client"

import { useAuth } from "../../context/auth"; //Needed to change
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
                 <DropdownMenuTrigger> {/* Triggers when avatar is clicked */}
                    <Avatar>
                        {!!auth.currentUser.photoURL && (
                            <Image 
                                src={auth.currentUser.photoURL}
                                alt={`${auth.currentUser.displayName} avatar`}
                                width={70}
                                height={70}
                            />
                        )}
                        <AvatarFallback className="text-sky-950">
                            {(auth.currentUser.displayName || auth.currentUser.email)?.[0]}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>
                        <div>{auth.currentUser.displayName}</div>
                        <div className="font-normal text-xs"> {/* text-xs Makes email smaller */}
                            {auth.currentUser.email}
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild> {/* asChild makes the entire item clickable and passes functionaity and classNames to Link component */}
                        <Link href="/account">My Account</Link>
                    </DropdownMenuItem>
                    {!!auth.customClaims?.admin && (
                        <DropdownMenuItem asChild>
                            <Link href="/admin-dashboard">Admin Dashboard</Link>
                        </DropdownMenuItem>
                    )}
                    {!auth.customClaims?.admin && (
                        <DropdownMenuItem asChild>
                            <Link href="/account/my-favourites">My Favourites</Link>
                        </DropdownMenuItem>
                    )}                    
                    <DropdownMenuItem 
                    onClick={async () => {
                        await auth.logout();
                        router.refresh();
                    }}>
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            )}
            {!auth?.currentUser &&
                <div className="flex gap-2 items-center"> {/*flex makes items appear beside each other gap-2 creates space between login and signup links*/}
                    <Link href="/login" className="uppercase tracking-widest hover:underline">Login</Link>
                    <div className="h-8 w-[1px] bg-white/50"/> {/*h-8 is height w-[1px] is arbitrary width bg-white/50 is white with 50% opacity*/}
                    <Link href="/register" className="uppercase tracking-widest hover:underline">Signup</Link>
                </div>
            }
        </div>
    )
}