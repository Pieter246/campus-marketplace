import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminItemsTable from "./admin-items-table";
import { Breadcrumbs } from "@/components/ui/breadcrumb";

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
                <TabsList className="mb-4">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="sale">Sale</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">                    
                    <h1 className="text-4xl font-bold mt-6">Approve Items</h1>
                    <AdminItemsTable
                        page={searchParamsValue?.page ? parseInt(searchParamsValue.page) : 1}
                    />                  
                </TabsContent>
                <TabsContent value="profile">
                    <div>Hello there</div>
                </TabsContent>
                <TabsContent value="sale">
                    <div>Hello there</div>
                </TabsContent>
            </Tabs> 
        </>            
    )
}