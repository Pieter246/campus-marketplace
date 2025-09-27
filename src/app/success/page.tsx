"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function CheckoutSuccessPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Placeholder item data (to be replaced with fetched purchased items)
  const placeholderItem = {
    id: "placeholder-item-id",
    title: "Placeholder Item Title",
    price: 1000,
    images: ["/placeholder-image.jpg"],
    collectionAddress: "123 Example Street, Campus Town, 12345",
    sellerEmail: "seller@example.com",
  };

  return (
    <div className="min-h-screen flex justify-center items-start px-4 mb-8">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-2xl p-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Payment Successful!</h1>
        <p className="text-gray-700 mb-6">
          Thank you for your purchase. Your payment has been successfully processed, and your item has been reserved.
        </p>

        {/* Next Steps Instructions */}
        <div className="mt-4 p-4 text-sm text-left border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-2 text-center">Next Steps</h3>
          <p className="mb-3">
            Your payment has reserved the item in your name. Here’s what to do next:
          </p>
          <ol className="list-decimal list-inside space-y-2 mb-3">
            <li>
              <strong>Contact the seller:</strong> Use the contact details below to message the seller and arrange a time to meet for collection.
            </li>
            <li>
              <strong>Collect the item:</strong> Meet the seller at the agreed place. Take a quick photo together with the item as proof of collection.
            </li>
            <li>
              <strong>Confirm collection:</strong> In your Profile page's <em>Purchases</em> tab, mark the item as <span className="font-medium">Collected</span>. This completes the transaction and releases the payment to the seller. If you do not mark an item as completed after collecting it, you may be subject to legal action and removed from the platform. For any dispute, please contact the admins.
            </li>
          </ol>
          <p className="text-xs text-gray-500">
            Tip: Keep the collection photo until you’re sure everything is fine — the seller must save it if there’s a dispute.
          </p>
        </div>

        {/* Placeholder Item Display */}
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-white">
          <h3 className="text-lg font-semibold mb-2 text-center">Your Purchased Item(s)</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-md bg-gray-200 overflow-hidden flex-shrink-0">
              {placeholderItem.images[0] ? (
                <Image
                  src={placeholderItem.images[0]}
                  alt={placeholderItem.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs">
                  No Image
                </div>
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-800">{placeholderItem.title}</p>
              <p className="text-sm text-gray-500">R{placeholderItem.price.toFixed(2)}</p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Collection Address:</strong> {placeholderItem.collectionAddress}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <a
                  href={`mailto:${placeholderItem.sellerEmail}?subject=I purchased ${encodeURIComponent(placeholderItem.title)}`}
                  className="text-blue-600 hover:underline"
                >
                  Click here to contact the seller to arrange collection
                </a>
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full mt-8"
          loading={loading}
          onClick={() => router.push("/")}
        >
          ← Continue Shopping
        </Button>
      </div>
    </div>
  );
}