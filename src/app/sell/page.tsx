"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
//import Footer from "../../components/ui/Footer";

export default function SellPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  function handleNativePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    } else {
      setPhotoPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) return alert("Title is required");
    if (!description.trim()) return alert("Description is required");

    const priceNum = Number(price);
    if (Number.isNaN(priceNum)) return alert("Price must be a number");
    if (priceNum < 0) return alert("Price cannot be negative");

    // Firestore wiring (commented out until backend is ready)
    /*
    import { db } from "@/lib/firebase";
    import { addDoc, collection, serverTimestamp } from "firebase/firestore";

    try {
      await addDoc(collection(db, "items"), {
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        currency: "ZAR",
        category: category || null,
        status: "active",
        createdAt: serverTimestamp(),
      });

      alert("Item saved successfully!");
      router.push("/sell");
    } catch (err) {
      console.error(err);
      alert("Could not save item. Please try again.");
    }
    */

    console.log({ title, description, price: priceNum, category, photoFile });
    alert("Form submitted (Firestore code is commented out)");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold mb-6 text-center">New Item to Sell</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <Input
              id="title"
              label="Title"
              placeholder="e.g. MTHS 225 textbook"
              value={title}
              onChange={(e: any) => setTitle(e.target.value)}
            />

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                rows={5}
                placeholder="Condition, edition, campus pickup info..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-md p-2"
              />
            </div>

            {/* Price */}
            <Input
              id="price"
              label="Price (ZAR)"
              type="number"
              min={0}
              placeholder="250"
              value={price}
              onChange={(e: any) => setPrice(e.target.value)}
            />

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category (optional)
              </label>
              <select
                id="category"
                className="w-full border rounded-md p-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">— Select category —</option>
                <option value="books">Books</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
              </select>
            </div>

            {/* Photo upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Item photo (optional)</label>

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition">
                <span className="text-gray-500">Click to upload a photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleNativePhotoChange}
                  className="hidden"
                />
              </label>

              {photoPreview && (
                <div className="mt-2">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-28 w-28 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">
                Add Item / Update
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>

    </div>
  );
}
