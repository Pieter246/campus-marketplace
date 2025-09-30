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
      className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
      title="Email Seller"
    >
      <Mail size={20} />
    </Button>
  );
}