import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { getItemById } from "@/data/items";
import Image from "next/image";
import numeral from "numeral";
import BackButton from "./back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import imageUrlFormatter from "@/lib/imageUrlFormatter";
import ItemConditionBadge from "@/components/item-condition-badge";
import ReactMarkdown from "react-markdown"
import { cookies } from "next/headers";
import { DecodedIdToken } from "firebase-admin/auth";
import { auth } from "@/firebase/server";
import BuyButton from "./buy-button";
import ApproveButton from "./approve-button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic"; //caching for Vercel

export default async function Item({params}: {
    params: Promise<any>
}) {
    // Get user token from the cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("firebaseAuthToken")?.value;
    let verifiedToken: DecodedIdToken | null = null;

    // Grab verified token if there is a token
    if(token){
        verifiedToken = await auth.verifyIdToken(token);
    }

    // Parameter gets itemId because route is /dashboard/edit/[itemId]
    const paramsValue = await params;
    const item = await getItemById(paramsValue.itemId);

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
                                                            fill
                                                            className="object-cover"
                                                            src={imageUrlFormatter(image)}
                                                            alt={`Image ${index + 1}`}                                                            
                                                        />                                            
                                                    </Card>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    {item.images.length > 1 &&
                                        <>
                                            <CarouselPrevious className="translate-x-24 size-12">
                                                <ChevronLeft className="w-6 h-6" />
                                            </CarouselPrevious>
                                            <CarouselNext className="-translate-x-24 size-12">
                                                <ChevronRight className="w-6 h-6" />
                                            </CarouselNext>
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
                    {(!verifiedToken || (!verifiedToken.admin && verifiedToken.uid !== item.sellerId)) && ( //Show the Buy button if the user is not logged in, or if they are logged in but not an admin, and they are not the seller of the item.
                        <BuyButton id={item.id} />
                    )}                   
                </CardContent>
            </Card>
            {verifiedToken && verifiedToken.admin && ( // Only admins can approve items
                <Card>
                    <CardContent>
                        <ApproveButton id={item.id} condition={item.condition}/>                       
                    </CardContent>
                </Card>
            )}
        </div>
    )
}