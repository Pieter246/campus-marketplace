"use client";

import { useState } from "react";

interface Order {
  id: string;
  date: string;
  items: string;
  total: string;
  status: "active" | "processing" | "completed" | "cancelled";
  estimatedDelivery?: string;
}

export default function AccountPage() {
  const [tab, setTab] = useState<"profile" | "password" | "active-orders" | "order-history">("profile");
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // These will eventually be fetched from backend
  const [user, setUser] = useState<{ username: string; email: string; membership: string } | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  function showAlert(message: string, type: "success" | "error") {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-transparent text-gray-900 py-8 px-4 text-center shadow-lg relative">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="mt-1">Manage your account information and orders</p>
        <div className="flex justify-center items-center gap-4 mt-4">
          <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-xl font-bold">
            {user?.username?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user?.username || "Loading..."}</h2>
            <p className="text-gray-300">{user?.membership || "Member"}</p>
          </div>
        </div>

        <button
          onClick={() => showAlert("Signed out successfully.", "success")}
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md flex items-center gap-2"
        >
          <i className="fas fa-sign-out-alt"></i> Sign Out
        </button>
      </header>
      <main className="flex-1 max-w-4xl mx-auto p-6">
        <div className="flex flex-wrap bg-white rounded-lg shadow mb-6">
          {["profile", "password", "active-orders", "order-history"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`w-1/4 py-3 font-semibold ${
                tab === t ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {t.replace("-", " ").toUpperCase()}
            </button>
          ))}
        </div>
        {alert && (
          <div
            className={`mb-4 p-4 rounded-md ${
              alert.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {alert.message}
          </div>
        )}

        {tab === "profile" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Update Profile</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                defaultValue={user?.username || ""}
                className="w-full border px-3 py-2 rounded-md"
              />
              <input
                type="email"
                placeholder="Email"
                defaultValue={user?.email || ""}
                className="w-full border px-3 py-2 rounded-md"
              />
              <button
                onClick={() => showAlert("Profile updated!", "success")}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {tab === "password" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Update Password</h2>
            <div className="space-y-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Current Password"
                className="w-full border px-3 py-2 rounded-md"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                className="w-full border px-3 py-2 rounded-md"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                className="w-full border px-3 py-2 rounded-md"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword((v) => !v)}
                />
                Show Password
              </label>
              <button
                onClick={() => showAlert("Password updated!", "success")}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Update Password
              </button>
            </div>
          </div>
        )}

        {tab === "active-orders" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Active Orders</h2>
            {activeOrders.length === 0 ? (
              <p className="text-gray-500">No active orders.</p>
            ) : (
              <ul className="space-y-3">
                {activeOrders.map((order) => (
                  <li key={order.id} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-md shadow-sm">
                    <h3 className="font-semibold">Order #{order.id}</h3>
                    <p>
                      {order.items} • {order.total} • ETA {order.estimatedDelivery}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "order-history" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Order History</h2>
            {orderHistory.length === 0 ? (
              <p className="text-gray-500">No past orders.</p>
            ) : (
              <ul className="space-y-3">
                {orderHistory.map((order) => (
                  <li key={order.id} className="border-l-4 border-gray-400 bg-gray-50 p-4 rounded-md shadow-sm">
                    <h3 className="font-semibold">Order #{order.id}</h3>
                    <p>
                      {order.items} • {order.total} • {order.date}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
      
      <footer className="text-center mt-12 text-gray-500 border-t pt-4">
        <p>&copy; 2025 Campus Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
}
