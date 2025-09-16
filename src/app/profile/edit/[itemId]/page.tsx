//import { Breadcrumbs } from "@/components/ui/breadcrumb";
//import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    //console.log({ item });

    return ( 
        <div className="max-w-screen-lg mx-auto px-4 py-10">
            <EditItemForm
                id={item.id}
                title={item.title}
                collectionAddress={item.collectionAddress}
                description={item.description}
                price={item.price}
                status={item.status}
                condition={item.condition}
                category={item.category}
                sellerId={item.sellerId}
                images={item.images || []}
            />
        </div>
    );
}