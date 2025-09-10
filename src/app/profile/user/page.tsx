import UserItemsTable from "./user-items-table";
import  Button from "@/components/ui/Button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Account from "../account/page";
import UserPurchaseTable from "./user-purchase-table";

export default async function UserDashboard({
    searchParams
}: {
    searchParams?: Promise<any>;
}) {
    const searchParamsValue = await searchParams;
    console.log({ searchParamsValue });
    
    return (
        <>
            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="w-full h-15">
                    <TabsTrigger value="dashboard" className="text-2xl font-bold tracking-widest rounded-none data-[state=active]:bg-sky-600 data-[state=active]:text-white">Dashboard</TabsTrigger>
                    <TabsTrigger value="purchases" className="text-2xl font-bold tracking-widest rounded-none data-[state=active]:bg-sky-600 data-[state=active]:text-white">Purchase history</TabsTrigger>
                    <TabsTrigger value="account" className="text-2xl font-bold tracking-widest rounded-none data-[state=active]:bg-sky-600 data-[state=active]:text-white">Account</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">                    
                    <h1 className="text-4xl font-bold mt-6">My Items</h1>
                    <Button asChild className="inline-flex pl-2 gap-2 mt-4">
                        <Link href="/profile/new">
                            New Item
                        </Link>
                    </Button>
                    <UserItemsTable
                        page={searchParamsValue?.page ? parseInt(searchParamsValue.page) : 1}
                    />                  
                </TabsContent>
                <TabsContent value="purchases">                    
                    <h1 className="text-4xl font-bold mt-6">Purchase history</h1>
                    <UserPurchaseTable
                        page={searchParamsValue?.page ? parseInt(searchParamsValue.page) : 1}
                    />                  
                </TabsContent>
                <TabsContent value="account">
                    <Account />
                </TabsContent>
            </Tabs> 
        </> 
    )
}