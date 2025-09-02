// Example: Fetching items from Firestore

"use client"

import { useEffect, useState } from "react"

export default function ItemsList() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchItems() {
      setLoading(true)
      setError("")

      try {
        const response = await fetch("/api/items?category=books&search=laptop&limit=10&status=available")
        const data = await response.json()

        if (data.success) {
          setItems(data.items)
        } else {
          throw new Error(data.message || "Failed to fetch items")
        }
      } catch (error: any) {
        console.error("Fetch items error:", error)
        setError(error.message || "Failed to fetch items")
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  if (loading) {
    return <div>Loading items...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-4">Items List</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.itemId} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-gray-700">{item.description}</p>
            <p className="text-gray-500 text-sm">Posted on: {new Date(item.postedAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}