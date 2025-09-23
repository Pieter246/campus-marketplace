"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/auth";

interface CartItem {
  cartItemId: string;
  itemId: string;
  addedAt: string;
  item?: {
    id: string;
    title: string;
    price: number;
    images?: string[];
  };
}

export default function CartPage() {
  const auth = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth?.currentUser) {
      setLoading(false);
      return;
    }

    const currentUser = auth.currentUser; // capture it, TS now knows this is not null

    async function loadCart() {
      try {
        const token = await currentUser.getIdToken(); // safe, TS knows currentUser is not null
        const res = await fetch("/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCartItems(data.items);
        } else {
          console.error("Failed to fetch cart:", data.message);
        }
      } catch (err) {
        console.error("Error loading cart:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, [auth?.currentUser]);

  const subtotal = cartItems.reduce((sum, ci) => sum + (ci.item?.price || 0), 0);
  const vat = (subtotal * 15) / 115;

  async function handlePayNow() {
    if (!auth?.currentUser) return;

    try {
      const res = await fetch("/api/payfast/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cartItems }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Error initiating payment: " + (data.message || ""));
    } catch (err) {
      console.error(err);
      alert("Failed to initiate payment");
    }
  }

  async function handleDelete(cartItemId: string) {
    if (!auth?.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCartItems((prev) => prev.filter((ci) => ci.cartItemId !== cartItemId));
    } catch (err) {
      console.error("Failed to delete cart item:", err);
    }
  }

  if (loading) return <p className="text-center py-10">Loading cart...</p>;

  if (!auth?.currentUser)
    return (
      <p className="text-center py-10 text-gray-600">
        Please <Link href="/login" className="text-blue-600">log in</Link> to view your cart.
      </p>
    );

  return (
    <div className="min-h-screen flex justify-center items-start px-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-2xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Your Cart</h2>

        {cartItems.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Your cart is empty.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200">
              {cartItems.map((ci) => (
                <li key={ci.cartItemId} className="flex justify-between items-center py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-md bg-gray-200 overflow-hidden flex-shrink-0">
                      {ci.item?.images?.[0] ? (
                        <img
                          src={ci.item.images[0]}
                          alt={ci.item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs select-none">
                          No Image
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{ci.item?.title || "Unknown Item"}</p>
                      <p className="text-sm text-gray-500">R{ci.item?.price ?? 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-gray-700">R{ci.item?.price ?? 0}</p>
                    <button
                      onClick={() => handleDelete(ci.cartItemId)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-red-600 hover:bg-red-200 transition cursor-pointer"
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 -mx-8 px-8 py-4 bg-gray-50 text-gray-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>R{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>VAT (15% incl.)</span>
                <span>R{vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-800 pt-2 border-t">
                <span>Total</span>
                <span>R{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Button type="button" className="w-full mt-8" onClick={handlePayNow}>
              Pay Now
            </Button>

            <div className="mt-4 text-center">
              <Link href="/shop" className="text-sm text-gray-600 hover:text-blue-600 transition">
                ← Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
