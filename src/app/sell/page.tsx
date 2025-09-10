"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/Input";

export default function SellPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    terms: false, // added for checkbox
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_PHOTOS = 5;

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

    const newErrors: { [key: string]: string } = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";

    const priceNum = Number(form.price);
    if (!form.price) newErrors.price = "Price is required";
    else if (Number.isNaN(priceNum)) newErrors.price = "Price must be a number";
    else if (priceNum < 0) newErrors.price = "Price cannot be negative";

    if (!form.category) newErrors.category = "Category is required";
    if (photoFiles.length === 0) newErrors.photos = "At least one photo is required";
    if (!form.terms) newErrors.terms = "You must agree to the terms and conditions";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    console.log({
      ...form,
      price: priceNum,
      photos: photoFiles,
    });

    alert("Form submitted (Firestore code is commented out)");
  }

  return (
    <div className="flex justify-center items-center p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Sell Your Item</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Input
            id="title"
            label="Title"
            placeholder="e.g. MTHS 225 textbook"
            value={form.title}
            onChange={handleChange}
            error={errors.title}
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

          {/* Price */}
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

          {/* Category */}
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

          {/* Photo upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Item photos — up to {MAX_PHOTOS}
            </label>

            <label
              htmlFor="fileInput"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer transition 
                ${
                  isDragging
                    ? "bg-blue-50 border-blue-400"
                    : "hover:bg-gray-50"
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

          {/* Terms & Conditions checkbox */}
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
