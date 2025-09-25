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

    return (
        <>
            <Tabs defaultValue={tab} className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="dashboard" asChild className="text-xl rounded-sm data-[state=active]:primary data-[state=active]:text-white">
                        <Link href="/profile/user?tab=dashboard">Active Items</Link>
                    </TabsTrigger>
                    <TabsTrigger value="purchases" asChild className="text-xl rounded-sm data-[state=active]:primary data-[state=active]:text-white">
                        <Link href="/profile/user?tab=purchases">Purchases</Link>
                    </TabsTrigger>
                    <TabsTrigger value="account" asChild className="text-xl rounded-sm data-[state=active]:primary data-[state=active]:text-white">
                        <Link href="/profile/user?tab=account">Password</Link>
                    </TabsTrigger>
                </TabsList>

                <Suspense fallback={<div>Loading...</div>}>
                    {tab === "dashboard" && (
                    <TabsContent value="dashboard">
                        <div className="flex items-center justify-between mt-2 mb-4 mx-2">
                        <h1 className="text-2xl font-bold">My Items</h1>
                        <Button asChild className="inline-flex gap-2" variant="outline">
                            <Link href="/profile/new">New Item</Link>
                        </Button>
                        </div>

                        <UserItemsTable page={page} />
                    </TabsContent>
                    )}
                    {tab === "purchases" && (
                        <TabsContent value="purchases">
                            <h1 className="text-2xl font-bold ml-2 mt-2">Purchase history</h1>
                            <UserPurchaseTable page={page} />
                        </TabsContent>
                    )}
                    {tab === "account" && (
                        <TabsContent value="account">
                            <h1 className="text-2xl font-bold ml-2 mt-2">Update password</h1>
                            <Account />
                        </TabsContent>
                    )}
                </Suspense>
            </Tabs>
        </>
    );
}