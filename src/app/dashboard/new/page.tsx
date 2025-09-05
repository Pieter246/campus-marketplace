//import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NewItemForm from "./new-item-form";

export default function NewItem() {
    return <div>
        {/* <Breadcrumbs items={[
            {
                href: "/admin-dashboard",
                label: "Dashboard"
            }, 
            {
                label: "New Property"
            }
            ]}
        /> */}
        <Card className="mt-5">
            <CardHeader>
                <CardTitle className="text-3xl font-bold">
                    New Item
                </CardTitle>
            </CardHeader>
            <CardContent>
                <NewItemForm />
            </CardContent>
        </Card>
    </div>
}