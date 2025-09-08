import UserItemsTable from "./user-items-table";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import AuthItemOption from "@/components/auth-item-option";

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
            <AuthItemOption />
            <UserItemsTable
                page={searchParamsValue?.page ? parseInt(searchParamsValue.page) : 1}
            />
        </div>
    )
}