"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

type Item = {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  seller: {
    name: string;
    email: string;
  };
};

export default function ItemReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder: replace with backend call
    setTimeout(() => {
      setItem({
        id: id as string,
        title: "MacBook Pro 13” 2022",
        description:
          "Lightly used MacBook Pro in excellent condition. Perfect for students.",
        price: 1200,
        images: [
          "/test-photos/macbook.jpg",
          "/test-photos/macbook2.jpg",
        ],
        seller: {
          name: "Alex Johnson",
          email: "alex.johnson@university.edu",
        },
      });
      setLoading(false);
    }, 800);
  }, [id]);

  if (loading) return <p>Loading item...</p>;
  if (!item) return <p>Item not found</p>;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm hover:underline cursor-pointer"
      >
        ← Back to Items
      </button>

      <h1 className="text-2xl font-bold mb-4">{item.title}</h1>

      {/* Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {item.images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={item.title}
            className="w-full h-64 object-cover rounded-lg shadow"
          />
        ))}
      </div>

      {/* Item Details */}
      <div className="bg-white shadow rounded p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Description</h2>
        <p className="text-gray-700 mb-4">{item.description}</p>

        <p className="text-lg font-bold text-primary mb-4">
          Price: ${item.price}
        </p>

        <div className="text-sm text-gray-600">
          <p>
            <span className="font-medium">Seller:</span> {item.seller.name}
          </p>
          <p>
            <span className="font-medium">Email:</span> {item.seller.email}
          </p>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 cursor-pointer"
          variant="secondary"
          onClick={() => router.push("/admin/items")}
        >
          Approve Item
        </Button>
        <Button
          type="button"
          className="w-full py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 cursor-pointer"
          variant="secondary"
          onClick={() => router.push("/admin/items")}
        >
          Reject Item
        </Button>
      </div>
    </div>
  );
}
