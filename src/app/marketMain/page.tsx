import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Item } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { getItems } from "../../../data/items";

export default async function MarketMain() {
    const {data} = await getItems(); 
    const items: Item[] = data || [];
    
    return (
        <div className="max-w-screen-lg mx-auto">
            <h1 className="text-4xl font-bold p-5">Property search</h1>
            <div className="grid grid-cols-3 mt-5 gap-5">
                {items.map(item => {
                    const itemInfo = [
                        item.itemId,
                        item.sellerId,
                        item.categoryId,
                    ]
                        .filter(addressLine => !!addressLine)
                        .join(", ");
                    return(                 
                        <Card key={item.itemId} className="overflow-hidden pt-0 pb-0">
                            <CardContent className="px-0">
                                <div className="flex flex-col gap-5 p-5">
                                    <p className="text-2xl">
                                        {item.title}
                                    </p>
                                    <p className="text-2xl">
                                        {typeof item.price === "number"
                                            ? new Intl.NumberFormat().format(item.price)
                                            : item.price}
                                    </p>
                                    <p>{itemInfo}</p>
                                    <p>{item.description}</p>                                    
                                    <Button asChild>
                                        <Link href={`/property/${item.itemId}`}>
                                            View Property
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}              
            </div>
        </div>
    )
}