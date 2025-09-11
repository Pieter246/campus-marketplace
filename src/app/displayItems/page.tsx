"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function DisplayItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");

  // Check auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setError("You must log in to see items.");
    });
    return () => unsubscribe();
  }, []);

  // Fetch items
  useEffect(() => {
    if (!user) return;

    const fetchItems = async () => {
      try {
        const idToken = await user.getIdToken();
        
        const itemsResponse = await fetch("/api/items?limit=10&status=available", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${idToken}`,
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
  }, [user]);

  if (loading) return <p>Loading items...</p>;
  if (error) return <p>{error}</p>;
  if (!items.length) return <p>No items available.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {items.map((item) => (
        <div key={item.itemId} className="border p-4 rounded shadow">
          <h2 className="font-bold">{item.title}</h2>
          <p>{item.description}</p>
          <p>Price: ZAR {item.price}</p>
          <p>Condition: {item.condition}</p>
        </div>
      ))}
    </div>
  );
}
