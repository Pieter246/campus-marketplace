"use client"

import { useState } from "react"
import Link from "next/link"
import Button from "@/components/ui/Button";

export default function CartPage() {
  const [cart, setCart] = useState([
    {
      id: 1,
      name: "Textbook - Database Systems",
      price: 450,
      quantity: 1,
      image: "https://via.placeholder.com/60x60.png?text=Book",
    },
    {
      id: 2,
      name: "Desk Lamp",
      price: 250,
      quantity: 2,
      image: "https://via.placeholder.com/60x60.png?text=Lamp",
    },
    {
      id: 3,
      name: "USB Flash Drive 32GB",
      price: 120,
      quantity: 1,
      image: "", // example empty -> will show placeholder
    },
  ])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const vat = (subtotal * 15) / 115 // extracts VAT portion (15% included in price)
  const [loading, setLoading] = useState(false);

  function handlePayNow() {
    alert("This would redirect to payment. (Demo)")
  }

  function handleDelete(id: number) {
    setCart(cart.filter(item => item.id !== id))
  }

  return (
    <div className="min-h-screen flex justify-center items-start px-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-2xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Your Cart</h2>

        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Your cart is empty.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center py-4"
                >
                  {/* Left side: thumbnail + details */}
                  <div className="flex items-center gap-4">
                    {/* Thumbnail container (always rendered) */}
                    <div className="relative w-16 h-16 rounded-md bg-gray-200 overflow-hidden flex-shrink-0">
                      {/* Image: if it exists, try to display it; on error hide it so placeholder shows */}
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // hide the broken image so the gray placeholder remains visible
                            (e.currentTarget as HTMLImageElement).style.display = "none"
                          }}
                        />
                      ) : null}

                      {/* Placeholder visible underneath image (or alone if image missing/errored) */}
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs select-none">
                        No Image
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × R{item.price}
                      </p>
                    </div>
                  </div>

                  {/* Right side: price + delete */}
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-gray-700">
                      R{item.price * item.quantity}
                    </p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-red-600 hover:bg-red-200 transition cursor-pointer"
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Full-width summary strip */}
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

            {/* Checkout button */}
            <Button
              type="submit"
              className="w-full mt-8"
              loading={loading}
              onClick={handlePayNow}
            >
              Pay Now
            </Button>

            {/* Continue shopping link */}
            <div className="mt-4 text-center">
              <Link
                href="/shop"
                className="text-sm text-gray-600 hover:text-blue-600 transition"
              >
                ← Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
