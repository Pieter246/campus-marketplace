"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import imageUrlFormatter from "@/lib/imageUrlFormatter";
import { useAuth } from "@/context/auth";

interface CartItem {
  cartItemId: string;
  cartId: string;
  itemId: string;
}

interface ItemData {
  id: string;
  title: string;
  price: number;
  images: string[];
}

export default function CartPage() {
  const auth = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [itemsData, setItemsData] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      if (!auth?.currentUser) return;

      const token = await auth.currentUser.getIdToken();
      try {
        const res = await fetch("/api/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error("Failed to load cart: " + (data.message || ""));
        } else {
          setCartItems(data.cartItems || []);
          setItemsData(data.itemsData || []);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [auth]);

  const subtotal = itemsData.reduce((sum, item) => sum + item.price, 0);
  const vat = (subtotal * 15) / 115;

  const handleDelete = async (cartItemId: string) => {
    if (!auth?.currentUser) return;
    const token = await auth.currentUser.getIdToken();
    try {
      await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setCartItems(prev => prev.filter(c => c.cartItemId !== cartItemId));
      setItemsData(prev => prev.filter(item => cartItems.find(c => c.cartItemId === cartItemId && c.itemId === item.id) === undefined));
      toast.success("Item removed from cart");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove item");
    }
  };

  async function handlePayNow() {
    if (!auth?.currentUser) return;

    setLoading(true);

    try {
      // Merge cartItems with their item data
      const cartForCheckout = cartItems.map(cartItem => {
        const item = itemsData.find(i => i.id === cartItem.itemId);
        return item ? { id: item.id, name: item.title, price: item.price } : null;
      }).filter(Boolean);

      // Calculate totalAmount assuming quantity = 1 for each
      const totalAmount = cartForCheckout.reduce((sum, item) => sum + (item?.price || 0), 0);

      const token = await auth.currentUser.getIdToken();

      const res = await fetch("/api/payfast/checkout", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cart: cartForCheckout }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // redirect to PayFast sandbox
      } else {
        alert("Error initiating payment: " + (data.message || ""));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen flex justify-center items-start px-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-2xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Your Cart</h2>

        {loading ? (
          <p className="text-gray-500 text-center py-10">Loading cart...</p>
        ) : itemsData.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Your cart is empty.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200">
              {cartItems.map(cartItem => {
                const item = itemsData.find(i => i.id === cartItem.itemId);
                if (!item) return null;
                return (
                  <li key={cartItem.cartItemId} className="flex justify-between items-center py-4">
                    {/* Left: thumbnail + details */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-md bg-gray-200 overflow-hidden flex-shrink-0">
                        {item.images[0] ? (
                          <Image
                            src={imageUrlFormatter(item.images[0])}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-500">R{item.price}</p>
                      </div>
                    </div>

                    {/* Right: delete */}
                    <button
                      onClick={() => handleDelete(cartItem.cartItemId)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-red-600 hover:bg-red-200 transition cursor-pointer"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Summary */}
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
              <Link href="/" className="text-sm text-gray-600 hover:text-blue-600 transition">
                ← Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
