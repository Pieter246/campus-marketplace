"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

interface Item {
  itemId: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  condition: string;
  postedAt?: string;
}

export default function DisplayItemsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        setError("You must be logged in to see items.");
        return;
      }

      setUser(currentUser);
      fetchItems(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const fetchItems = async (currentUser: User) => {
    try {
      const idToken = await currentUser.getIdToken();

      const res = await fetch("/api/items?limit=10&status=available", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || "Failed to get items");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("Fetch items error:", err);
      setError("Failed to get items");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

  if (items.length === 0) {
    return <div className="text-center mt-10">No items available.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Available Items</h1>
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.itemId}
            className="border rounded-md p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="font-semibold text-lg">{item.title}</h2>
            <p className="text-gray-700">{item.description}</p>
            <p className="mt-2">
              <strong>Price:</strong> {item.price} ZAR
            </p>
            <p>
              <strong>Category:</strong> {item.categoryId}
            </p>
            <p>
              <strong>Condition:</strong> {item.condition}
            </p>
            <p className="text-gray-500 text-sm">
              Posted at: {item.postedAt ? new Date(item.postedAt).toLocaleString() : "-"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
