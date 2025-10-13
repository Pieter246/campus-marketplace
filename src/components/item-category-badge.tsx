import { Badge } from "./ui/badge";
import { ItemCategory } from "@/types/itemCategory";

// Display category to user in better format (without dashes)
const categoryLabel = {
    books: "books",
    electronics: "electronics",
    stationery: "stationery",
    clothing: "clothing",
    notes: "notes",
    other: "other"
}

// Display status with specific color
// Map itemStatus to badge variants
const variant: {[key: string]: "success" | "imperfect" | "unsatisfactory" | "destructive"} = {
    all: "success",
}

export default function ItemCategoryBadge({
    category,
    className
}: {
    category: ItemCategory
    className?: string;
}){
    const label = categoryLabel[category];
    return (
        <Badge variant={variant[category]} className={className}>
            {label}
        </Badge>
    );
}