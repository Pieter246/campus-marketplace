import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FiltersForm from "./item-search/filters-form";
import { Suspense } from "react";
import { getItems } from "@/data/items";
import Image from "next/image";
import imageUrlFormatter from "@/lib/imageUrlFormatter";
import { BookMarked } from "lucide-react";
import numeral from "numeral";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "@/firebase/server";
import { DecodedIdToken } from "firebase-admin/auth";
import ItemConditionBadge from "@/components/item-condition-badge";

export default async function Home({
    searchParams
}: {
    searchParams: Promise<any>
}) {
    const searchParamsValues = await searchParams;

    const parsedPage = parseInt(searchParamsValues?.page);
    const parsedMinPrice = parseInt(searchParamsValues?.minPrice);
    const parsedMaxPrice = parseInt(searchParamsValues?.maxPrice);
    
    const page = isNaN(parsedPage) ? 1 : parsedPage;
    const minPrice = isNaN(parsedMinPrice) ? null : parsedMinPrice;
    const maxPrice = isNaN(parsedMaxPrice) ? null : parsedMaxPrice;

    const condition: string | null = searchParamsValues.condition ?? null;
    //const condition = searchParamsValues.condition ? null : searchParamsValues.condition;
    //const condition: string[] = searchParamsValues.condition ? searchParamsValues.condition.split(","): ["all"];
    //const condition: string[] = searchParamsValues.condition?.split(",")[0] ?? null; // Get single value

    const {data, totalPages} = await getItems({
        pagination: {
            page,
            pageSize: 10
        },
        filters: {
            minPrice,
            maxPrice,
            condition,
            status: ["for-sale"]
        }
    });

    // Get user token from the cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("firebaseAuthToken")?.value;
    let verifiedToken: DecodedIdToken | null;

    // Grab verified token if there is a token
    if(token){
        verifiedToken = await auth.verifyIdToken(token);
    }

    return (
        <div className="max-w-screen-lg mx-auto">
            <h1 className="text-4xl font-bold p-5">Item search</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <Suspense>
                        <FiltersForm />
                    </Suspense>             
                </CardContent>
            </Card>
            <div className="grid grid-cols-3 mt-5 gap-5">
                {data.map(item => {
                    const addressLines = [
                        item.collectionAddress,
                    ]
                    .filter(addressLine => !!addressLine)
                    .join(", ");
                    return(                 
                        <Card key={item.id} className="overflow-hidden pt-0 pb-0">
                            <CardContent className="px-0">
                                <div className="h-40 relative bg-sky-50 text-zinc-400 flex flex-col justify-center items-center">
                                    {!!item.images?.[0] && (
                                        <Image 
                                            fill
                                            className="object-cover"
                                            src={imageUrlFormatter(item.images[0])}
                                            alt=""
                                        />
                                    )}
                                    {!item.images?.[0] && (
                                        <>
                                            <BookMarked />
                                            <small>No Image</small>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-col gap-5 p-5">
                                    <p>{item.title}</p>
                                    <ItemConditionBadge condition={item.condition} className="mr-auto text-base"/> 
                                    <p>{addressLines}</p>
                                    <p className="text-2xl">
                                        R{numeral(item.price).format("0,0")}
                                    </p>
                                    <Button asChild>
                                        <Link href={`/item/${item.id}`}>
                                            View item
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}              
            </div>
            <div>
                <div className="flex gap-2 items-center justify-center py-10">
                    {Array.from({ length: totalPages }).map((_, i) => {

                        //This code is necessary to ensure that when switching to another page the filters are maintained
                        const newSearchParams = new URLSearchParams();

                        // Filters
                        if(searchParamsValues?.minPrice){
                            newSearchParams.set("minPrice", searchParamsValues.minPrice)
                        }
                        if(searchParamsValues?.maxPrice){
                            newSearchParams.set("minPrice", searchParamsValues.maxPrice)
                        }
                        if(searchParamsValues?.minBedrooms){
                            newSearchParams.set("condition", searchParamsValues.condition)
                        }

                        newSearchParams.set("page", `${i + 1}`);

                        return (
                            <Button 
                                asChild={page !== i + 1}
                                disabled={page === i + 1} 
                                variant="outline"
                                key={i}
                            >
                                <Link href={`/item-search?${newSearchParams.toString()}`}>
                                    {i + 1}
                                </Link>
                            </Button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}