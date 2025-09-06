"use client";

import { useState } from "react";

export default function NewItemToSellPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation to prevent negative number entries
    if (Number(price) < 0) {
      alert("Price cannot be negative.");
      return;
    }

    // Sample code for Firebase Firestore connection // commented out
    /*
    import { db } from "@/lib/firebase";
    import { addDoc, collection, serverTimestamp } from "firebase/firestore";

    try {
      await addDoc(collection(db, "items"), {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        currency: "ZAR",
        createdAt: serverTimestamp(),
        // sellerUid: auth.currentUser?.uid ?? null, // optional if you enable auth
        status: "active",
      });
      alert("Item saved successfully!");
    } catch (error) {
      console.error("Error adding the item to the database: ", error);
      alert("Could not save the item to the database. Please try again.");
    }
    */

    // Log to console
    console.log("Form submitted", { title, description, price });
    alert("Alert! Form submitted (Firestore code is commented out)");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">New Item to Sell</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. MTHS225 textbook"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Please provide a detailed description of the item being sold"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="price">
              Price (ZAR)
            </label>
            <input
              id="price"
              type="number"
              placeholder="250"
              min="0" // prevents negatives values
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Add Item
            </button>
            <button
              type="button"
              className="flex-1 border py-2 rounded-md hover:bg-gray-100"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
