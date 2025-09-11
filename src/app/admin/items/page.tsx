"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Item = {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  seller: {
    name: string;
    email: string;
  };
};

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setItems([
        {
          id: "1",
          title: "MacBook Pro 13” 2022",
          price: 1200,
          thumbnail: "/test-photos/macbook.jpg",
          seller: { name: "Alex Johnson", email: "alex.johnson@university.edu" },
        },
        {
          id: "2",
          title: "Calculus Textbook",
          price: 80,
          thumbnail: "/test-photos/textbook.jpg",
          seller: { name: "Sarah Chen", email: "sarah.chen@university.edu" },
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <p>Loading items...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-primary">Manage Items</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow rounded-lg p-4 flex gap-4 items-start"
          >
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="text-gray-600 text-sm">
                Seller: {item.seller.name} ({item.seller.email})
              </p>
              <p className="text-primary font-bold mt-1">${item.price}</p>
              <Link
                href={`/admin/items/${item.id}`}
                className="inline-block mt-2 text-sm text-blue-600 hover:underline"
              >
                Review Item →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
