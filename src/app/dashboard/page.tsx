//import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import Link from "next/link";
import ItemsTable from "./items-table";

export default async function AdminDashboard({
    searchParams
}: {
    searchParams?: Promise<any>;
}) {
    const searchParamsValue = await searchParams;
    console.log({ searchParamsValue });
    return (
        <div>
            {/* <Breadcrumbs 
                items={[
                    {
                        label: "Dashboard",
                    }
                ]}>
            </Breadcrumbs> */}
            <h1 className="text-4xl font-bold mt-6">Admin Dashboard</h1>
            <Button asChild className="inline-flex pl-2 gap-2 mt-4">
                <Link href="/admin-dashboard/new">
                    <PlusCircleIcon/> New Property
                </Link>
            </Button>
            <ItemsTable
                page={searchParamsValue?.page ? parseInt(searchParamsValue.page) : 1}
            />
        </div>
    )
}