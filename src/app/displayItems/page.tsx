"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
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
        const itemsRef = collection(db, "items");
        const q = query(itemsRef, where("itemStatus", "==", "available"), orderBy("postedAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedItems = snapshot.docs.map((doc) => ({
          itemId: doc.id,
          ...doc.data(),
          postedAt: doc.data().postedAt?.toDate?.()?.toISOString(),
        }));
        setItems(fetchedItems);
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
