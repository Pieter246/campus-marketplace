"use client";
import { useState, useMemo, useEffect } from "react";
import Button from "@/components/ui/Button";

//Mock data to test the infiniy scroll
const allItems = [
  { id: 1, title: "iPhone 13 Pro", description: "Good condition, includes charger", price: 12500, category: "Phones" },
  { id: 2, title: "MacBook Air M1", description: "Perfect for students, 8GB RAM", price: 18999, category: "Electronics" },
  { id: 3, title: "Physics Textbook", description: "First year physics, excellent condition", price: 450, category: "Books" },
  { id: 4, title: "Desk Chair", description: "Comfortable study chair", price: 1200, category: "Furniture" },
  { id: 5, title: "Linear Algebra Book", description: "Helpful for math students", price: 600, category: "Books" },
  { id: 6, title: "Wireless Headphones", description: "Noise cancelling, long battery life", price: 2200, category: "Electronics" },
  { id: 7, title: "Clothing Bundle", description: "Mixed clothes in good condition", price: 800, category: "Clothing" },
  { id: 8, title: "Graphics Card RTX 3060", description: "Powerful GPU for gaming", price: 7500, category: "Hardware" },
  { id: 9, title: "Study Notes - Economics", description: "Detailed first year notes", price: 200, category: "Study Notes" },
  { id: 10, title: "Samsung Galaxy S21", description: "Like new, includes box", price: 10500, category: "Phones" },
  { id: 11, title: "Chemistry Textbook", description: "Organic chemistry guide", price: 500, category: "Books" },
  { id: 12, title: "Mathematics Notes", description: "Step-by-step solutions", price: 250, category: "Study Notes" },
  { id: 13, title: "Office Desk", description: "Wooden desk with drawers", price: 2000, category: "Furniture" },
  { id: 14, title: "HP Laptop", description: "Reliable, 16GB RAM", price: 14500, category: "Electronics" },
  { id: 15, title: "Clothes - Winter Jacket", description: "Warm and stylish", price: 950, category: "Clothing" },
  { id: 16, title: "Printer", description: "Wireless color printer", price: 2200, category: "Electronics" },
  { id: 17, title: "Desk Lamp", description: "LED lamp with USB port", price: 450, category: "Furniture" },
  { id: 18, title: "English Literature Book", description: "Classic novels collection", price: 700, category: "Books" },
  { id: 19, title: "Study Notes - Computer Science", description: "Algorithms explained", price: 300, category: "Study Notes" },
  { id: 20, title: "Nike Sneakers", description: "Lightweight running shoes", price: 1200, category: "Clothing" },
  { id: 21, title: "Tablet - iPad Pro", description: "256GB storage", price: 16000, category: "Electronics" },
  { id: 22, title: "Sofa", description: "2-seater, grey", price: 4500, category: "Furniture" },
  { id: 23, title: "Samsung Monitor", description: "27-inch 4K display", price: 3500, category: "Hardware" },
  { id: 24, title: "Mathematics Book", description: "Calculus and geometry", price: 550, category: "Books" },
  { id: 25, title: "Backpack", description: "Durable and spacious", price: 650, category: "Clothing" },
  { id: 26, title: "Gaming Keyboard", description: "RGB lights, mechanical keys", price: 1300, category: "Hardware" },
  { id: 27, title: "Headset", description: "Clear microphone, gaming headset", price: 1500, category: "Electronics" },
  { id: 28, title: "Study Notes - Biology", description: "Summarized content", price: 180, category: "Study Notes" },
  { id: 29, title: "Dining Table", description: "Seats 4, wooden", price: 3200, category: "Furniture" },
  { id: 30, title: "Clothes - T-Shirts", description: "Pack of 3", price: 400, category: "Clothing" },
  { id: 31, title: "Dell Laptop", description: "i7 processor, SSD", price: 14000, category: "Electronics" },
  { id: 32, title: "Graphic Tablet", description: "Perfect for design students", price: 2700, category: "Hardware" },
  { id: 33, title: "Chemistry Notes", description: "Equations and reactions", price: 210, category: "Study Notes" },
  { id: 34, title: "Bookshelf", description: "Compact wooden shelf", price: 950, category: "Furniture" },
  { id: 35, title: "JavaScript Programming Book", description: "Covers ES6+", price: 620, category: "Books" },
  { id: 36, title: "HP Printer Ink", description: "Black and color pack", price: 600, category: "Hardware" },
  { id: 37, title: "Running Shoes", description: "Adidas sports shoes", price: 1150, category: "Clothing" },
  { id: 38, title: "Wireless Mouse", description: "Bluetooth, ergonomic", price: 350, category: "Hardware" },
  { id: 39, title: "Study Notes - History", description: "Summarized chapters", price: 220, category: "Study Notes" },
  { id: 40, title: "Kindle eReader", description: "Paperwhite model", price: 2800, category: "Electronics" },
  { id: 41, title: "Mechanical Keyboard", description: "RGB keys", price: 1900, category: "Hardware" },
  { id: 42, title: "Laptop Stand", description: "Adjustable height", price: 700, category: "Furniture" },
  { id: 43, title: "Mobile Charger", description: "Fast charging", price: 300, category: "Electronics" },
  { id: 44, title: "Clothes - Jeans", description: "Slim fit", price: 500, category: "Clothing" },
  { id: 45, title: "Data Structures Book", description: "For CS students", price: 720, category: "Books" },
  { id: 46, title: "Study Notes - Economics 2", description: "Macro and micro economics", price: 250, category: "Study Notes" },
  { id: 47, title: "Office Chair", description: "Ergonomic design", price: 2500, category: "Furniture" },
  { id: 48, title: "Bluetooth Speaker", description: "Portable, waterproof", price: 1500, category: "Electronics" },
  { id: 49, title: "Computer Case", description: "ATX size", price: 1100, category: "Hardware" },
  { id: 50, title: "Notebook Bundle", description: "Set of 5 notebooks", price: 150, category: "Books" },
];

export default function Marketplace() {
  const [cart, setCart] = useState<number[]>([]);
  const [query, setQuery] = useState(""); // search input
  const [visibleCount, setVisibleCount] = useState(8); // how many items visible
  const [selectedCategory, setSelectedCategory] = useState("All"); // selected category
  const [isMenuOpen, setIsMenuOpen] = useState(false); // mobile menu state

  // Add to cart
  const addToCart = (id: number) => {
    setCart((prev) => [...prev, id]);
  };

  // Filter items by search query and category
  const filteredItems = useMemo(() => {
    return allItems.filter(
      (item) =>
        (selectedCategory === "All" || item.category === selectedCategory) &&
        (item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query, selectedCategory]);

  // Items shown with infinite scroll
  const visibleItems = filteredItems.slice(0, visibleCount);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {
        // Load more items
        setVisibleCount((prev) => {
          if (prev < filteredItems.length) {
            return prev + 4; // load 4 more
          }
          return prev;
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredItems]);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 shadow">
        {/* Left side - Campus Marketplace and mobile menu button */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="text-xl font-bold">Campus Marketplace</div>
          
          {/* Mobile menu button */}
          <button 
            className="sm:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Search bar - aligned with category navigation width */}
        <div className="flex-1 max-w-2xl mx-0 sm:mx-4 mt-4 sm:mt-0 w-full sm:w-auto">
          <input
            type="text"
            placeholder="🔍 Search items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-3 py-2 border rounded-md w-full"
          />
        </div>

        {/* Right side - Cart, Profile, Logout (hidden on mobile, shown in menu) */}
        <nav className={`${isMenuOpen ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-4 sm:mt-0 w-full sm:w-auto`}>
          <a href="#" className="hover:text-blue-500 py-2 sm:py-0">🛒 Cart ({cart.length})</a>
          <a href="#" className="hover:text-blue-500 py-2 sm:py-0">👤 Profile</a>
          <a href="#" className="text-red-500 hover:text-red-700 py-2 sm:py-0">Logout</a>
        </nav>
      </header>

      {/* Category Navigation - Superbalist style */}
      <nav className="bg-white border-t border-b border-gray-200">
        <div className="container mx-auto px-4">
          <ul className="flex overflow-x-auto py-3 hide-scrollbar">
            <li 
              className={`cursor-pointer whitespace-nowrap px-3 ${selectedCategory === "All" ? "font-bold border-b-2 border-black" : ""}`}
              onClick={() => setSelectedCategory("All")}
            >
              All
            </li> 
            <li 
              className={`cursor-pointer whitespace-nowrap px-3 ${selectedCategory === "Books" ? "font-bold border-b-2 border-black" : ""}`}
              onClick={() => setSelectedCategory("Books")}
            >
              Books
            </li>
            <li 
              className={`cursor-pointer whitespace-nowrap px-3 ${selectedCategory === "Study Notes" ? "font-bold border-b-2 border-black" : ""}`}
              onClick={() => setSelectedCategory("Study Notes")}
            >
              Study Notes
            </li>
            <li 
              className={`cursor-pointer whitespace-nowrap px-3 ${selectedCategory === "Electronics" ? "font-bold border-b-2 border-black" : ""}`}
              onClick={() => setSelectedCategory("Electronics")}
            >
              Electronics
            </li>
            <li 
              className={`cursor-pointer whitespace-nowrap px-3 ${selectedCategory === "Furniture" ? "font-bold border-b-2 border-black" : ""}`}
              onClick={() => setSelectedCategory("Furniture")}
            >
              Furniture
            </li>
            <li 
              className={`cursor-pointer whitespace-nowrap px-3 ${selectedCategory === "Clothing" ? "font-bold border-b-2 border-black" : ""}`}
              onClick={() => setSelectedCategory("Clothing")}
            >
              Clothing
            </li>
            <li 
              className={`cursor-pointer whitespace-nowrap px-3 ${selectedCategory === "Phones" ? "font-bold border-b-2 border-black" : ""}`}
              onClick={() => setSelectedCategory("Phones")}
            >
              Phones
            </li>
            <li 
              className={`cursor-pointer whitespace-nowrap px-3 ${selectedCategory === "Hardware" ? "font-bold border-b-2 border-black" : ""}`}
              onClick={() => setSelectedCategory("Hardware")}
            >
              Hardware
            </li>
          </ul>
        </div>
      </nav>

      {/* Items Section - Full width since sidebar is removed */}
      <section className="flex-1 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Available Items</h2>
        {visibleItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No items match your search.</p>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="bg-white shadow-sm rounded-lg p-3 sm:p-4 flex flex-col gap-2 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-base sm:text-lg">{item.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{item.description}</p>
                <p className="text-green-600 font-bold text-base sm:text-lg">R {item.price}</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => addToCart(item.id)}
                  className="mt-auto"
                >
                  Add to Cart
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {visibleItems.length > 0 && visibleItems.length < filteredItems.length && (
          <div className="text-center mt-8">
            <p className="text-gray-500">Scroll down to load more items...</p>
          </div>
        )}
      </section>
      
      {/* Mobile cart button (fixed at bottom) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <a href="#" className="block text-center bg-blue-500 text-white py-3 rounded-lg font-medium">
          🛒 View Cart ({cart.length})
        </a>
      </div>
      
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
      `}</style>
    </main>
  );
}