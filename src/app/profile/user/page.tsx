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
                <TabsList className="flex justify-center space-x-2 bg-gray-200 rounded-lg p-1">
                    <TabsTrigger value="dashboard" asChild className="text-lg font-semibold rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=inactive]:bg-gray-300 data-[state=inactive]:text-gray-700">
                        <Link href="/profile/user?tab=dashboard">Active orders</Link>
                    </TabsTrigger>
                    <TabsTrigger value="purchases" asChild className="text-lg font-semibold rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=inactive]:bg-gray-300 data-[state=inactive]:text-gray-700">
                        <Link href="/profile/user?tab=purchases">Purchase history</Link>
                    </TabsTrigger>
                    <TabsTrigger value="account" asChild className="text-lg font-semibold rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=inactive]:bg-gray-300 data-[state=inactive]:text-gray-700">
                        <Link href="/profile/user?tab=account">Password</Link>
                    </TabsTrigger>
                </TabsList>

                <Suspense fallback={<div>Loading...</div>}>
                    {tab === "dashboard" && (
                        <TabsContent value="dashboard">
                            <h1 className="text-xl font-bold mt-6">My Items</h1>
                            <Button asChild className="inline-flex pl-2 gap-2 mt-4">
                                <Link href="/profile/new">New Item</Link>
                            </Button>
                            <UserItemsTable page={page}/>
                        </TabsContent>
                    )}
                    {tab === "purchases" && (
                        <TabsContent value="purchases">
                            <h1 className="text-xl font-bold mt-6">Purchase history</h1>
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