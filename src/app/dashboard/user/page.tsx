import UserItemsTable from "./user-items-table";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircleIcon } from "lucide-react";

export default async function UserDashboard({
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
            <h1 className="text-4xl font-bold mt-6">My Items</h1>
            <Button asChild className="inline-flex pl-2 gap-2 mt-4">
                <Link href="/dashboard/new">
                    <PlusCircleIcon/> New Item
                </Link>
            </Button>
            <UserItemsTable
                page={searchParamsValue?.page ? parseInt(searchParamsValue.page) : 1}
            />
        </div>
    )
}