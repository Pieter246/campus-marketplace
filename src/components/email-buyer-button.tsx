"use client";

import { Mail } from "lucide-react";
import Button from "@/components/ui/Button";

interface EmailBuyerButtonProps {
  buyerEmail?: string;
  itemTitle: string;
  itemId: string;
  price: number;
}

export default function EmailBuyerButton({ 
  buyerEmail, 
  itemTitle, 
  itemId, 
  price 
}: EmailBuyerButtonProps) {
  if (!buyerEmail) {
    return null;
  }

  const handleEmailBuyer = () => {
    const subject = encodeURIComponent(`Regarding your purchase: ${itemTitle}`);
    const body = encodeURIComponent(
      `Hi there!\n\nI hope you're satisfied with your purchase of "${itemTitle}" for R${price.toLocaleString()}.\n\nItem link: ${window.location.origin}/item/${itemId}\n\nIf you have any questions or need assistance, please let me know!\n\nThank you for your purchase!`
    );
    
    const mailtoLink = `mailto:${buyerEmail}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  return (
    <Button
      onClick={handleEmailBuyer}
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
    >
      <Mail size={16} />
      Email Buyer
    </Button>
  );
}