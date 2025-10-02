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
  quantity: number;
}

interface ItemData {
  id: string;
  title: string;
  price: number;
  images: string[];
  condition: string;
  sellerId: string;
}

export default function CartPage() {
  const auth = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [itemsData, setItemsData] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);

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

  const subtotal = itemsData.reduce((sum, item) => {
    const cartItem = cartItems.find(c => c.itemId === item.id);
    const quantity = cartItem?.quantity || 1;
    return sum + (item.price * quantity);
  }, 0);
  const vat = subtotal * 0.15; // 15% VAT added to subtotal
  const total = subtotal + vat;

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
        return item ? { 
          id: item.id, 
          name: item.title, 
          price: item.price,
          quantity: cartItem.quantity || 1
        } : null;
      }).filter(Boolean);

      // Calculate totalAmount with quantities
      const totalAmount = cartForCheckout.reduce((sum, item) => 
        sum + (item ? item.price * item.quantity : 0), 0
      );
      const totalWithVat = totalAmount * 1.15; // Add 15% VAT

      const token = await auth.currentUser.getIdToken();

      const res = await fetch("/api/payfast/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cart: cartForCheckout, totalAmount: totalWithVat }),
      });

      const data = await res.json();

      if (data.url) {
        localStorage.setItem('cartBeforePayment', JSON.stringify({ cartItems, itemsData }));
        window.location.href = data.url; // redirect to PayFast sandbox
      } else {
        toast.error("Error initiating payment: " + (data.message || ""));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen flex justify-center items-start px-4 mb-8">
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
                const quantity = cartItem.quantity || 1;
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
                        <p className="text-sm text-gray-500">R{item.price} {quantity > 1 && `x${quantity}`}</p>
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
                <span>VAT (15%)</span>
                <span>R{vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-800 pt-2 border-t">
                <span>Total</span>
                <span>R{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mx-auto mt-4 p-4 text-sm">
              <h3 className="text-lg font-semibold mb-2 text-center">
                What happens after you click <span className="font-bold">&quot;Pay Now&quot;</span>
              </h3>

              <p className="mb-3">
                Great — your payment will reserve the item so nobody else can buy it. Here’s what to do next:
              </p>

              <ol className="list-decimal list-inside space-y-2 mb-3">
                <li>
                  <strong>Reservation:</strong> Your payment reserves the item in your name immediately. Campus Marketplace will now hold on to your payment until you&apos;ve collected the item as per the guidelines below.
                </li>
                <li>
                  <strong>Contact the seller:</strong> After payment you&apos;ll see the seller&apos;s contact details and collection address — message them to arrange a time to meet.
                </li>
                <li>
                  <strong>Collect the item:</strong> Meet the seller at the agreed place. Take a quick photo together with the item as proof of collection.
                </li>
                <li>
                  <strong>Confirm collection:</strong> In your Profile page&apos;s <em>Purchases</em> tab, mark the item as <span className="font-medium">Collected</span>. This completes the transaction and release the payment to the seller. If you do not mark an item as completed after collecting it, you may be subject to legal action and removed from the platform. For any dispute, please contact the admins.
                </li>
              </ol>

              <p className="text-xs text-gray-500">
                Tip: Keep the collection photo until you&apos;re sure everything is fine — the seller must save it if there’s a dispute.
              </p>
            </div>

            <div className="mt-4 flex items-start gap-2">
              <input
                id="agree"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 cursor-pointer"
                required
              />
              <label htmlFor="agree" className="text-sm text-gray-700">
                I have read and agree to the above guidelines for reserving, collecting, and confirming my purchase.
              </label>
            </div>

            <Button
              type="button"
              className="w-full mt-8"
              onClick={handlePayNow}
              disabled={!agreed || loading}
            >
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