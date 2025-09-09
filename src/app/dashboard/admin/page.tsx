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
        <div>
            <Breadcrumbs 
                items={[
                    {
                        label: "Dashboard",
                    }
                ]}>
            </Breadcrumbs>
            <h1 className="text-4xl font-bold mt-6">Approve Items</h1>
            <AdminItemsTable
                page={searchParamsValue?.page ? parseInt(searchParamsValue.page) : 1}
            />
        </div>
    )
}