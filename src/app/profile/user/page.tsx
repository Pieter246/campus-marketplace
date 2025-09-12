import UserItemsTable from "./user-items-table";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Account from "../account/page";
import UserPurchaseTable from "./user-purchase-table";
import { Suspense } from "react";

export default async function UserDashboard({
    searchParams
}: {
    searchParams?: Promise<any>;
}) {
    const searchParamsValue = await searchParams;
    const tab = searchParamsValue?.tab || "dashboard"; // Default to 'dashboard'
    const page = searchParamsValue?.page ? parseInt(searchParamsValue.page) : 1;

    console.log({ searchParamsValue });

    return (
        <>
            <Tabs defaultValue={tab} className="w-full">
                <TabsList className="w-full h-20">
                    <TabsTrigger value="dashboard" asChild className="text-2xl font-bold tracking-widest rounded-none data-[state=active]:bg-sky-700 data-[state=active]:text-white">
                        <Link href="/profile/user?tab=dashboard">Dashboard</Link>
                    </TabsTrigger>
                    <TabsTrigger value="purchases" asChild className="text-2xl font-bold tracking-widest rounded-none data-[state=active]:bg-sky-700 data-[state=active]:text-white">
                        <Link href="/profile/user?tab=purchases">Purchase history</Link>
                    </TabsTrigger>
                    <TabsTrigger value="account" asChild className="text-2xl font-bold tracking-widest rounded-none data-[state=active]:bg-sky-700 data-[state=active]:text-white">
                        <Link href="/profile/user?tab=account">Account</Link>
                    </TabsTrigger>
                </TabsList>

                <Suspense fallback={<div>Loading...</div>}>
                    {tab === "dashboard" && (
                        <TabsContent value="dashboard">
                            <h1 className="text-4xl font-bold mt-6">My Items</h1>
                            <Button asChild className="inline-flex pl-2 gap-2 mt-4">
                                <Link href="/profile/new">New Item</Link>
                            </Button>
                            <UserItemsTable page={page} />
                        </TabsContent>
                    )}
                    {tab === "purchases" && (
                        <TabsContent value="purchases">
                            <h1 className="text-4xl font-bold mt-6">Purchase history</h1>
                            <UserPurchaseTable page={page} />
                        </TabsContent>
                    )}
                    {tab === "account" && (
                        <TabsContent value="account">
                            <Account />
                        </TabsContent>
                    )}
                </Suspense>
            </Tabs>
        </>
    );
}