//import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getItemById } from "@/data/items";
import EditItemForm from "./edit-item-form";
import DeleteItemButton from "./delete-item-button";
import { Breadcrumbs } from "@/components/ui/breadcrumb";

export default async function EditProperty({
    params
}: {
    params: Promise<any>
}){
    // Parameter gets itemId because route is /dashboard/edit/[itemId]
    const paramsValue = await params;
    const item = await getItemById(paramsValue.itemId);
    console.log({ item });

    return ( 
        <div>
            <Breadcrumbs items={[
                {
                    href: "/dashboard",
                    label: "Dashboard"
                }, 
                {
                    label: "Edit item"
                },
                ]}
            />
            <Card className="mt-5">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold flex justify-between">
                        Edit Item 
                        <DeleteItemButton 
                            itemId={item.id}
                            images={item.images || []}
                        />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EditItemForm
                        id={item.id}
                        title={item.title}
                        collectionAddress={item.collectionAddress}
                        description={item.description}
                        price={item.price}
                        status={item.status}
                        condition={item.condition}
                        images={item.images || []}
                    />
                </CardContent>
            </Card>
        </div>
    );
}