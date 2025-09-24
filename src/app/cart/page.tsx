"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/client";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

interface CartItem {
  cartItemId: string;
  itemId: string;
  quantity: number;
  item: {
    title: string;
    price: number;
    images?: string[];
  };
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch cart items
  const fetchCart = async () => {
    if (!auth.currentUser) {
      router.push("/login");
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken(true);

      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error("Failed to load cart", { description: data.message });
        setCartItems([]);
      } else {
        setCartItems(data.cartItems || []);
      }
    } catch (err: any) {
      console.error("Cart fetch error:", err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading cart...</span>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Button onClick={() => router.push("/")} className="mt-4">
          Browse Items
        </Button>
      </div>
    );
  }

  // Calculate totals
  const subTotal = cartItems.reduce((acc, item) => acc + item.item.price * item.quantity, 0);
  const vat = subTotal * 0.15;
  const total = subTotal + vat;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      <div className="space-y-4">
        {cartItems.map((cart) => (
          <div key={cart.cartItemId} className="flex items-center justify-between border p-4 rounded-lg">
            <div className="flex items-center gap-4">
              {cart.item.images && cart.item.images[0] && (
                <img src={cart.item.images[0]} alt={cart.item.title} className="w-20 h-20 object-cover rounded" />
              )}
              <div>
                <p className="font-semibold">{cart.item.title}</p>
                <p>R{cart.item.price.toFixed(2)} x {cart.quantity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2">
        <p>Subtotal: R{subTotal.toFixed(2)}</p>
        <p>VAT (15%): R{vat.toFixed(2)}</p>
        <p className="font-bold text-lg">Total: R{total.toFixed(2)}</p>
      </div>

      <Button
        onClick={() => toast.success("Checkout not implemented yet!")}
        className="w-full py-3 bg-green-600 hover:bg-green-700"
      >
        Checkout
      </Button>
    </div>
  );
}
