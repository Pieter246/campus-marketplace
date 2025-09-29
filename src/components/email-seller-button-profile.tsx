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
    const recipient = encodeURIComponent(sellerEmail);
    
    // Create options for different email providers
    const emailOptions = [
      {
        name: 'Gmail',
        url: `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}`
      },
      {
        name: 'Outlook',
        url: `https://outlook.live.com/mail/0/deeplink/compose?to=${recipient}&subject=${subject}`
      },
      {
        name: 'Yahoo Mail',
        url: `https://compose.mail.yahoo.com/?to=${recipient}&subject=${subject}`
      },
      {
        name: 'Default Email App',
        url: `mailto:${sellerEmail}?subject=${subject}`
      }
    ];
    
    // Show options to user
    const choice = window.confirm(
      'Choose email option:\n\n' +
      'OK = Open in Gmail\n' +
      'Cancel = Use default email app'
    );
    
    if (choice) {
      // Open Gmail
      window.open(emailOptions[0].url, '_blank');
    } else {
      // Use default email app
      window.location.href = emailOptions[3].url;
    }
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