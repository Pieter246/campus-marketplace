import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminItemsTable from "./admin-items-table";
import { Breadcrumbs } from "@/components/ui/breadcrumb";

export default async function AdminDashboard({
    account,
    searchParams
}: {
    account: React.ReactNode;
    searchParams?: Promise<any>;
}) {
    const searchParamsValue = await searchParams;
    console.log({ searchParamsValue });
    
    return (
        <>
            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="profile">Account</TabsTrigger>
                    <TabsTrigger value="sale">Sale</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">                    
                    <h1 className="text-4xl font-bold mt-6">Approve Items</h1>
                    <AdminItemsTable
                        page={searchParamsValue?.page ? parseInt(searchParamsValue.page) : 1}
                    />                  
                </TabsContent>
                <TabsContent value="account">
                    {account}
                </TabsContent>
                <TabsContent value="sale">
                    <div>Hello there</div>
                </TabsContent>
            </Tabs> 
        </>            
    )
}

// export default function Layout({
//     children,
//     profile,
//     sale
// }: {
//     children: React.ReactNode;
//     profile: React.ReactNode;
//     sale: React.ReactNode;

// }){
//   return (
//     <div className="max-w-screen-lg mx-auto px-4 py-10">
//       <Tabs defaultValue="dashboard" className="w-full">
//         <TabsList className="mb-4">
//           <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
//           <TabsTrigger value="profile">Profile</TabsTrigger>
//           <TabsTrigger value="sale">Sale</TabsTrigger>
//         </TabsList>

//         <TabsContent value="dashboard">{children}</TabsContent>
//         <TabsContent value="profile">{profile}</TabsContent>
//         <TabsContent value="sale">{sale}</TabsContent>
//       </Tabs>
//     </div>
//   );
// }