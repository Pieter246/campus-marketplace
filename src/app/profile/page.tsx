"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

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
  const [user, setUser] = useState<{ username: string; email: string; membership: string } | null>({
    username: "",
    email: "",
    membership: "Premium Member",
  });
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  function showAlert(message: string, type: "success" | "error") {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-60 text-gray-900">
      <main className="flex-1 max-w-5xl mx-auto p-6 pt-12">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-center">Account Settings</h1>
          <p className="mt-1 text-gray-600">Manage your account information and orders</p>
          <div className="flex justify-center items-center gap-4 mt-4">
            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-xl font-bold">
              {user?.username?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user?.username || "Loading..."}</h2>
              <p className="text-gray-400">{user?.membership || "Member"}</p>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap bg-white rounded-lg shadow mb-6">
          {["profile", "password", "active-orders", "order-history"].map((t) => (
            <Button
              key={t}
              variant={tab === t ? "secondary" : "outline"}
              size="lg"
              className="flex-1"
              onClick={() => setTab(t as any)}
            >
              {t.replace("-", " ").toUpperCase()}
            </Button>
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
          <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Update Profile</h2>
            <div className="space-y-4">
              <Input
                name="username"
                type="text"
                label="Username"
                id="username"
                value={user?.username || ""}
                onChange={() => {}}
              />
              <Input
                name="email"
                type="email"
                label="Email"
                id="email"
                value={user?.email || ""}
                onChange={() => {}}
              />
              <Button 
                className="w-full"
                onClick={() => showAlert("Profile updated!", "success")}
                >
                Save
              </Button>
            </div>
          </div>
        )}

        {tab === "password" && (
          <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Update Password</h2>
            <div className="space-y-4">
              <Input
                name="currentPassword"
                type={showPassword ? "text" : "password"}
                label="Current Password"
                id="currentPassword"
                value=""
                onChange={() => {}}
              />
              <Input
                name="newPassword"
                type={showPassword ? "text" : "password"}
                label="New Password"
                id="newPassword"
                value=""
                onChange={() => {}}
              />
              <Input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                label="Confirm New Password"
                id="confirmPassword"
                value=""
                onChange={() => {}}
              />
              <Button 
                className="w-full"
                onClick={() => showAlert("Password updated!", "success")}
                >
                Update Password
              </Button>
            </div>
          </div>
        )}

        {tab === "active-orders" && (
          <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Active Orders</h2>
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
          <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Order History</h2>
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
      <div className="mt-6 max-w-md mx-auto">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => showAlert("Signed out successfully.", "success")}
        >
          Sign Out
        </Button>
      </div>
      </main>
    </div>
  );
}
