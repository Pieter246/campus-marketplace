"use client"

import { useState } from "react"

export default function CartPage() {
  const [cart, setCart] = useState([
    { id: 1, name: "Textbook - Database Systems", price: 450, quantity: 1 },
    { id: 2, name: "Desk Lamp", price: 250, quantity: 2 },
    { id: 3, name: "USB Flash Drive 32GB", price: 120, quantity: 1 },
  ])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  function handlePayNow() {
    alert("This would redirect to payment. (Demo)")
  }

  function handleDelete(id: number) {
    setCart(cart.filter(item => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

        {cart.length === 0 ? (
          <p className="text-gray-600">Your cart is empty.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between items-center py-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × R{item.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">R{item.price * item.quantity}</p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove item"
                    >
                      X
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>R{subtotal}</span>
            </div>

            <button
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg"
              onClick={handlePayNow}
            >
              PAY NOW
            </button>
          </>
        )}
      </div>
    </div>
  )
}
