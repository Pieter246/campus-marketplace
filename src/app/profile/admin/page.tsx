import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminItemsTable from "./admin-items-table";
import Account from "../account/page";
import { Suspense } from "react";
import Link from "next/link";

export default async function AdminDashboard({
    searchParams
}: {
    searchParams?: Promise<any>;
}) {
    const searchParamsValue = await searchParams;
    const tab = searchParamsValue?.tab || "dashboard"; // Default to 'dashboard'
    const page = searchParamsValue?.page ? parseInt(searchParamsValue.page) : 1;

    //console.log({ searchParamsValue });

    return (
        <>
            <Tabs defaultValue={tab} className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="dashboard" asChild className="text-xl rounded-md data-[state=active]:primary data-[state=active]:text-white">
                        <Link href="/profile/admin?tab=dashboard">Dashboard</Link>
                    </TabsTrigger>
                    <TabsTrigger value="account" asChild className="text-xl rounded-md data-[state=active]:primary data-[state=active]:text-white">
                        <Link href="/profile/admin?tab=account">Account</Link>
                    </TabsTrigger>
                </TabsList>

                <Suspense fallback={<div>Loading...</div>}>
                    {tab === "dashboard" && (
                        <TabsContent value="dashboard">
                            <h1 className="text-2xl font-bold mt-2 ml-2">Approve Items</h1>
                            <AdminItemsTable page={page} />
                        </TabsContent>
                    )}
                    {tab === "account" && (
                        <TabsContent value="account">
                            <h1 className="text-2xl font-bold mt-2 ml-2">Update password</h1>
                            <Account />
                        </TabsContent>
                    )}
                </Suspense>
            </Tabs>
        </>
    );
}