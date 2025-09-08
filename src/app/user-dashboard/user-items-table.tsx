import ItemStatusBadge from "@/components/item-status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/auth";
import { getItems, getUserItems } from "@/data/items";
import { EyeIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import numeral from 'numeral';

export default async function UserItemsTable({page = 1}: {page?: number}) {
    const auth = useAuth();
    let data, totalPages;

    if (auth?.customClaims?.admin) { // Get data for admin
        const result = await getItems({
            pagination: {
                page,
                pageSize: 2,        
            },
            filters: {
                status: ["pending"]
            }
        });
        ({ data, totalPages } = result);
    } else { // Get data for user
        const result = await getUserItems({
            pagination: {
            page,
            pageSize: 2,
            },
        });
        ({ data, totalPages } = result);
    }

    console.log({ data })
    
    return (
        <>
            {!data.length && (
            <>
                {auth?.customClaims?.admin ? ( // For admin
                    <h1 className="text-center text-zinc-400 py-20 font-bold text-3xl">
                        There are no items to approve
                    </h1>
                ) : ( // For user
                    <h1 className="text-center text-zinc-400 py-20 font-bold text-3xl">
                        You have no items
                    </h1>
                )}                
            </>
            )}
            {!!data.length && (
            <>
                <Table className="mt-5">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Details</TableHead>
                            <TableHead>Listing price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map(item => {
                            const detail = [
                                item.title,
                            ]
                            .filter(addressLine => !!addressLine)
                            .join(", ");

                            return (
                                <TableRow key={item.id}>
                                    <TableCell>{detail}</TableCell>
                                    <TableCell>R{numeral(item.price).format("0,0")}</TableCell>
                                    <TableCell>
                                        <ItemStatusBadge status={item.status} />
                                    </TableCell>
                                    <TableCell className="flex justify-end gap-1">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/item/${item.id}`}>
                                                <EyeIcon />
                                            </Link>
                                        </Button>
                                        {!item.status.includes("sold") &&
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/user-dashboard/edit/${item.id}`}>
                                                    <PencilIcon />
                                                </Link>
                                            </Button>
                                        }
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">
                                {Array.from({length: totalPages}).map((_, i) => (
                                    <Button 
                                        disabled={page === i + 1}
                                        key={i}
                                        asChild={page !== i + 1}
                                        variant="outline"
                                        className="mx-1"
                                    >
                                        <Link href={`/user-dashboard?page=${i + 1}`}>{i + 1}</Link>
                                    </Button>
                                ))}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>              
            </>
            )}
        </>
    );
}