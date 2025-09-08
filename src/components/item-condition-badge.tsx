import { Badge } from "./ui/badge";
import { ItemCondition } from "@/types/itemCondition";

// Display status to user in better format (without dashes)
// Left side references itemStatus values:"for-sale" | "pending" | "withdrawn" | "sold" Right side displays them
const conditionLabel = {
    new: "new",
    used: "used",
    fair: "fair",
    poor: "poor",
}

// Display status with specific color
// Map itemStatus to badge variants
const variant: {[key: string]: "primary" | "destructive" | "secondary" | "success"} = {
    new: "primary",
    used: "destructive",
    fair: "secondary",
    poor: "success",
}

export default function ItemConditionBadge({
    condition,
    className
}: {
    condition: ItemCondition
    className?: string;
}){
    const label = conditionLabel[condition];
    return (
        <Badge variant={variant[condition]} className={className}>
            {label}
        </Badge>
    );
}