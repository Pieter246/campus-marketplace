import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminItemsTable from "./admin-items-table";
import Account from "../account/page";


export default async function AdminDashboard({
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
                    <TabsTrigger value="account" className="text-2xl font-bold tracking-widest rounded-none data-[state=active]:bg-sky-600 data-[state=active]:text-white">Account</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">                    
                    <h1 className="text-4xl font-bold mt-6">Approve Items</h1>
                    <AdminItemsTable
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