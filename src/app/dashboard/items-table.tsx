import ItemStatusBadge from "@/components/item-status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getItems } from "@/data/items";
import { EyeIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import numeral from 'numeral';

export default async function ItemsTable({page = 1}: {page?: number}) {
    const { data, totalPages } = await getItems({
        pagination: {
            page,
            pageSize: 2,
        }
    });
    console.log({ data })
    return (
        <>
            {!data.length && (
                <h1 className="text-center text-zinc-400 py-20 font-bold text-3xl">
                    You have no items
                </h1>
            )}
            {!!data.length &&
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
                                item.collectionAddress,
                                item.condition,
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
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/dashboard/edit/${item.id}`}>
                                                <PencilIcon />
                                            </Link>
                                        </Button>
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
                                        <Link href={`/dashboard?page=${i + 1}`}>{i + 1}</Link>
                                    </Button>
                                ))}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            }
        </>
    )
}