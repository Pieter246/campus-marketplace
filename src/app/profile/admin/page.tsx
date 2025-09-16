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

    console.log({ searchParamsValue });

    return (
        <>
            <Tabs defaultValue={tab} className="w-full">
                <TabsList className="w-full h-20">
                    <TabsTrigger value="dashboard" asChild className="text-2xl font-bold tracking-widest rounded-none data-[state=active]:bg-sky-700 data-[state=active]:text-white">
                        <Link href="/profile/admin?tab=dashboard">Dashboard</Link>
                    </TabsTrigger>
                    <TabsTrigger value="account" asChild className="text-2xl font-bold tracking-widest rounded-none data-[state=active]:bg-sky-700 data-[state=active]:text-white">
                        <Link href="/profile/admin?tab=account">Account</Link>
                    </TabsTrigger>
                </TabsList>

                <Suspense fallback={<div>Loading...</div>}>
                    {tab === "dashboard" && (
                        <TabsContent value="dashboard">
                            <h1 className="text-2xl font-bold mt-6">Approve Items</h1>
                            <AdminItemsTable page={page} />
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