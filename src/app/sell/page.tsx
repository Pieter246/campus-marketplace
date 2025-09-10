"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authFetch } from "@/lib/authFetch";

export default function SellPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "good" as "new" | "like_new" | "good" | "fair" | "poor",
    collectionAddress: "",
    collectionInstructions: "",
    terms: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_PHOTOS = 5;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const target = e.target;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setForm({ ...form, [target.id]: target.checked });
    } else {
      setForm({ ...form, [target.id]: target.value });
    }

    setErrors((prev) => ({ ...prev, [target.id]: "" }));
  }

  function addPhotos(files: File[]) {
    const remainingSlots = MAX_PHOTOS - photoFiles.length;
    if (remainingSlots <= 0) {
      alert(`You can only upload up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const limitedFiles = files.slice(0, remainingSlots);
    const previews = limitedFiles.map((file) => URL.createObjectURL(file));

    setPhotoFiles((prev) => [...prev, ...limitedFiles]);
    setPhotoPreviews((prev) => [...prev, ...previews]);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) addPhotos(files);
  }

  function handleRemovePhoto(index: number) {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to create an item");
      router.push("/login");
      return;
    }

    const newErrors: { [key: string]: string } = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";

    const priceNum = Number(form.price);
    if (!form.price) newErrors.price = "Price is required";
    else if (Number.isNaN(priceNum)) newErrors.price = "Price must be a number";
    else if (priceNum < 0) newErrors.price = "Price cannot be negative";

    if (!form.category) newErrors.category = "Category is required";
    if (photoFiles.length === 0) newErrors.photos = "At least one photo is required";
    if (!form.terms) newErrors.terms = "You must agree to the terms and conditions";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // Send to API route using authFetch (token automatically added)
      const response = await authFetch("/api/items/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          price: priceNum,
          categoryId: form.category,
          condition: form.condition,
          collectionAddress: form.collectionAddress.trim(),
          collectionInstructions: form.collectionInstructions.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Error: ${result.message}`);
        return;
      }

      alert("Item created successfully!");
      console.log("Created item:", result.item);

      router.push("/displayItems");
    } catch (error) {
      console.error("Error creating item:", error);
      alert("Failed to create item. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex justify-center items-center p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Sell Your Item</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="title"
            label="Title"
            placeholder="e.g. MTHS 225 textbook"
            value={form.title}
            onChange={handleChange}
            error={errors.title}
          />

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="Condition, edition, campus pickup info..."
              value={form.description}
              onChange={handleChange}
              className={`w-full border rounded-md p-2 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          <Input
            id="price"
            label="Price (ZAR)"
            type="number"
            min={0}
            placeholder="250"
            value={form.price}
            onChange={handleChange}
            error={errors.price}
          />

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <select
              id="category"
              className={`w-full border rounded-md p-2 ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
              value={form.category}
              onChange={handleChange}
            >
              <option value="">— Select category —</option>
              <option value="books">Books</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="condition" className="text-sm font-medium">
              Condition
            </label>
            <select
              id="condition"
              className="w-full border rounded-md p-2 border-gray-300"
              value={form.condition}
              onChange={handleChange}
            >
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <Input
            id="collectionAddress"
            label="Collection Address (Optional)"
            placeholder="e.g. Campus Library, Res Hall 3"
            value={form.collectionAddress}
            onChange={handleChange}
          />

          <div className="space-y-2">
            <label htmlFor="collectionInstructions" className="text-sm font-medium">
              Collection Instructions (Optional)
            </label>
            <textarea
              id="collectionInstructions"
              rows={2}
              placeholder="e.g. Meet at the main entrance, Available after 2pm"
              value={form.collectionInstructions}
              onChange={handleChange}
              className="w-full border rounded-md p-2 border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Item photos — up to {MAX_PHOTOS}
            </label>
            <label
              htmlFor="fileInput"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer transition ${
                isDragging ? "bg-blue-50 border-blue-400" : "hover:bg-gray-50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const files = Array.from(e.dataTransfer.files).filter((file) =>
                  file.type.startsWith("image/")
                );
                if (files.length > 0) addPhotos(files);
              }}
            >
              <span className="text-gray-500">
                Drag & drop photos here or click to upload
              </span>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
            {errors.photos && (
              <p className="text-red-500 text-sm">{errors.photos}</p>
            )}
            {photoPreviews.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {photoPreviews.map((preview, i) => (
                  <div key={i} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${i + 1}`}
                      className="h-28 w-28 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              checked={form.terms}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
              I agree to the{" "}
              <a href="/terms" className="text-blue-600 hover:underline">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.terms && (
            <p className="mt-1 text-sm text-red-500">{errors.terms}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">
              Add Item Listing
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
    </div>
  );
}
