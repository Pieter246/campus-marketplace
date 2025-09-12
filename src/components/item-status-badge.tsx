import { ItemStatus } from "@/types/itemStatus";
import { Badge } from "./ui/badge";

// Display status to user in better format (without dashes)
// Left side references itemStatus values:"for-sale" | "pending" | "withdrawn" | "sold" Right side displays them
const statusLabel = {
    draft: "Draft",
    "for-sale": "For Sale",
    pending: "Pending",
    withdrawn: "Withdrawn",
    sold: "Sold",
}

// Display status with specific color
// Map itemStatus to badge variants
const variant: {[key: string]: "nowhere" | "imperfect" | "destructive" | "unsatisfactory" | "success"} = {
    draft: "nowhere",
    "for-sale": "imperfect",
    pending: "unsatisfactory",
    withdrawn: "destructive",
    sold: "success",
}

export default function ItemStatusBadge({
    status,
    className
}: {
    status: ItemStatus
    className?: string;
}){
    const label = statusLabel[status];
    return (
        <Badge variant={variant[status]} className={className}>
            {label}
        </Badge>
    );
}