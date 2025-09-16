"use client";

import { useAuth } from "@/context/auth";
import { onAuthStateChanged } from "@firebase/auth";
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
  const [error, setError] = useState("");
  const auth = useAuth();

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = await auth?.currentUser?.getIdToken();

        if (!token) {
          setError("No auth token found.");
          setLoading(false);
          return;
        }

        const itemsResponse = await fetch("/api/items?limit=10&status=available", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const itemsData = await itemsResponse.json();

        if (!itemsResponse.ok) {
          console.error("Failed to fetch items:", itemsData.message);
          setError(itemsData.message || "Failed to fetch items.");
        } else {
          console.log("Fetched items:", itemsData.items);
          setItems(itemsData.items || []);
        }
      } catch (err: any) {
        console.error("Fetch items error:", err);
        setError("Failed to fetch items.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [auth]);

  if (loading)
    return (
      <>
        <h1 className="text-2xl font-bold mb-6 text-primary">Manage Items</h1>
        <p>Loading items...</p>
      </>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-primary">Manage Items</h1>
      <ul className="divide-y divide-gray-200">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 py-3 hover:bg-gray-50 px-2 rounded"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-12 h-12 object-cover rounded-md flex-shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-semibold">{item.title}</span>
                <span className="text-gray-500 text-sm">
                  {/* {item.seller.name} ({item.seller.email}) */}
                  {"Seller name"} ({"seller email"})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-primary font-bold">${item.price}</span>
              <Link
                href={`/admin/items/${item.id}`}
                className="text-sm hover:underline cursor-pointer"
              >
                Review →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
