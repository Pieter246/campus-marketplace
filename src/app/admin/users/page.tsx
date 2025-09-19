"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type User = {
  id: number;
  name: string;
  email: string;
  status: "active" | "suspended";
};

const mockUsers: User[] = [
  { id: 1, name: "Alex Johnson", email: "alex.johnson@uni.edu", status: "active" },
  { id: 2, name: "Sarah Chen", email: "sarah.chen@uni.edu", status: "suspended" },
  { id: 3, name: "Mike Rodriguez", email: "mike.r@uni.edu", status: "active" },
];

export default function ManageUsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>(mockUsers);

  const handleSuspend = (id: number) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === id ? { ...user, status: "suspended" } : user
      )
    );
  };

  const handleRemove = (id: number) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className=" min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full max-w-sm px-4 py-2 border rounded-lg shadow-sm"
      />

      {/* Users table */}
      <div className="bg-white rounded-lg shadow p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id} className="border-b last:border-none">
                  <td className="py-2">{user.name}</td>
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        user.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-2 flex gap-2">
                    {user.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSuspend(user.id)}
                      >
                        Suspend
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRemove(user.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
