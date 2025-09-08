//import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NewItemForm from "./new-item-form";
import { Breadcrumbs } from "@/components/ui/breadcrumb";

export default function NewItem() {
    return <div>
        <Breadcrumbs items={[
            {
                href: "/user-dashboard",
                label: "Dashboard"
            }, 
            {
                label: "New item"
            }
            ]}
        />
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