import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { getItemById } from "@/data/items";
import { ArrowLeft, BathIcon, BedIcon } from "lucide-react";
import Image from "next/image";
import numeral from "numeral";
//import ReactMarkdown from "react-markdown"
import BackButton from "./back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import imageUrlFormatter from "@/lib/imageUrlFormatter";
import ItemConditionBadge from "@/components/item-condition-badge";
import ReactMarkdown from "react-markdown"

export const dynamic = "force-static"; //caching for Vercel

export default async function Property({params}: {
    params: Promise<any>
}) {
    // Parameter gets itemId because route is /dashboard/edit/[itemId]
    const paramsValue = await params;
    const item = await getItemById(paramsValue.itemId);

    console.log({ item });

    // Get item address information and filter out empty optional fields
    const addressLines = [
        item.collectionAddress,
    ].filter(addressLine => !!addressLine)

    return (
        <div>
            <Card>
                <CardHeader >
                    <BackButton />
                    <CardTitle className="text-3xl font-bold">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    {!!item.images?.length &&
                        <>
                            <div className="">
                                <div className="h-100 relative">                                        
                                    <Image 
                                        fill
                                        className="object-cover"
                                        src={imageUrlFormatter(item.images[0])}
                                        alt=""
                                    />
                                </div>
                                <Carousel
                                    opts={{
                                        align: "start",                                        
                                    }}
                                    className="h-1/3 size-fit w-full p-4"
                                    >
                                    <CarouselContent className="justify-center">
                                        {item.images.map((image, index) => (
                                            <CarouselItem key={image} className="sm:basis-1/2 md:basis-1/3">
                                                <div className="relative p-4">
                                                    <Card className="h-50">
                                                        <Image 
                                                            src={`https://firebasestorage.googleapis.com/v0/b/fire-homes-course-32c50.firebasestorage.app/o/${encodeURIComponent(
                                                                image
                                                            )}?alt=media`}
                                                            alt={`Image ${index + 1}`}
                                                            fill
                                                            className="object-cover"
                                                        />                                            
                                                    </Card>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    {item.images.length > 1 &&
                                        <>
                                            <CarouselPrevious className="translate-x-24 size-12"/>
                                            <CarouselNext className="-translate-x-24 size-12"/>
                                        </>
                                    }     
                                </Carousel>
                            </div>                                            
                        </>
                    }
                    <div className="flex">                              
                        <h2 className="text-3xl font-light px-4 ">
                            R{numeral(item.price).format("0,0")}
                        </h2>                                                             
                        <ItemConditionBadge condition={item.condition} className="mr-auto text-base"/>                                                      
                    </div>
                    <h1 className="text-3xl font-semibold p-4">
                        {addressLines.map((addressLine, index) => (
                            <div key={index}>
                                {addressLine}
                                {index < addressLines.length - 1 && ","}
                            </div>
                        ))}
                    </h1>
                        <div className="item-description max-w-screen-md px-4">   {/*mx-auto*/}
                        <ReactMarkdown>{item.description}</ReactMarkdown>
                    </div>
                </CardContent>               
            </Card>
        </div>
    )
}