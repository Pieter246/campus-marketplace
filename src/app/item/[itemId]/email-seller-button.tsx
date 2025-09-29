"use client";

import { Mail } from "lucide-react";
import Button from "@/components/ui/Button";

interface EmailSellerButtonProps {
  sellerEmail?: string;
  itemTitle: string;
  itemId: string;
  price: number;
}

export default function EmailSellerButton({ 
  sellerEmail, 
  itemTitle, 
  itemId, 
  price 
}: EmailSellerButtonProps) {
  if (!sellerEmail) {
    return null;
  }

  const handleEmailSeller = () => {
    const subject = encodeURIComponent(`Interested in: ${itemTitle}`);
    const body = encodeURIComponent(
      `Hi there!\n\nI'm interested in your item "${itemTitle}" listed for R${price.toLocaleString()}.\n\nItem link: ${window.location.origin}/item/${itemId}\n\nCould you please provide more details?\n\nThank you!`
    );
    
    const mailtoLink = `mailto:${sellerEmail}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  return (
    <Button
      onClick={handleEmailSeller}
      className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
      title="Email Seller"
    >
      <Mail size={20} />
    </Button>
  );
}