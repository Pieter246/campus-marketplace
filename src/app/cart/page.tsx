"use client"

import { useState } from "react"
import Button from "@/components/ui/Button";

export default function CartPage() {
  const [cart, setCart] = useState([
    { id: 1, name: "Textbook - Database Systems", price: 450, quantity: 1 },
    { id: 2, name: "Desk Lamp", price: 250, quantity: 2 },
    { id: 3, name: "USB Flash Drive 32GB", price: 120, quantity: 1 },
  ])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
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
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Cart</h2>

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
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × R{item.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-gray-700">
                      R{item.price * item.quantity}
                    </p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition cursor-pointer"
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t pt-6 flex justify-between text-lg font-semibold text-gray-800">
              <span>Total</span>
              <span>R{subtotal}</span>
            </div>

            <Button
              type="submit"
              className="w-full mt-8"
              loading={loading}
              onClick={handlePayNow}
            >
              Pay Now
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
