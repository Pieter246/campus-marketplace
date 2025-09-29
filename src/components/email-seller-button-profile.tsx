"use client";

import { Mail } from "lucide-react";
import Button from "@/components/ui/Button";

interface EmailSellerButtonProfileProps {
  sellerEmail?: string;
  itemTitle: string;
  itemId: string;
  price: number;
}

export default function EmailSellerButtonProfile({ 
  sellerEmail, 
  itemTitle, 
  itemId, 
  price 
}: EmailSellerButtonProfileProps) {
  if (!sellerEmail) {
    return null;
  }

  const handleEmailSeller = () => {
    const subject = encodeURIComponent(`Question about my purchase: ${itemTitle}`);
    const body = encodeURIComponent(
      `Hi there!\n\nI purchased "${itemTitle}" for R${price.toLocaleString()} and wanted to follow up.\n\nItem link: ${window.location.origin}/item/${itemId}\n\nCould you please provide an update or answer my question?\n\nThank you!`
    );
    
    const mailtoLink = `mailto:${sellerEmail}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  return (
    <Button
      onClick={handleEmailSeller}
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
    >
      <Mail size={16} />
      Email Seller
    </Button>
  );
}