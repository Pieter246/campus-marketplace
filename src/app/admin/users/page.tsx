"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type User = {
  id: string;
  email: string;
  isActive: boolean;
  isAdmin: boolean;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailVerified: boolean;
  createdAt?: { _seconds: number; _nanoseconds: number } | string;
  updatedAt?: { _seconds: number; _nanoseconds: number } | string;
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const pageSize = 10;

  const fetchUsers = async (startAfterId: string | null = null) => {
    try {
      setLoading(true);
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not logged in");

      const token = await currentUser.getIdToken();
      const params = new URLSearchParams({ limit: pageSize.toString() });
      if (startAfterId) params.set("startAfter", startAfterId);

      const res = await fetch(`/api/users/list?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to fetch users");
      }

      const data: User[] = await res.json();

      // Filter out duplicates just in case
      setUsers((prev) => {
        const ids = new Set(prev.map(u => u.id));
        const filteredNew = data.filter(u => !ids.has(u.id));
        return [...prev, ...filteredNew];
      });

      if (data.length < pageSize) setHasMore(false);
      else setLastDocId(data[data.length - 1].id);
    } catch (err: any) {
      console.error("Error loading users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSuspend = async (id: string) => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not logged in");

      const res = await fetch(`/api/users/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to suspend user");

      setUsers((prev) => prev.map(u => u.id === id ? { ...u, isActive: false } : u));
    } catch (err: any) {
      console.error("Suspend user error:", err);
    }
  };

  const handleReinstate = async (id: string) => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not logged in");

      const res = await fetch(`/api/users/reinstate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to reinstate user");

      setUsers((prev) => prev.map(u => u.id === id ? { ...u, isActive: true } : u));
    } catch (err: any) {
      console.error("Reinstate user error:", err);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this user?")) return;

    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not logged in");

      const res = await fetch(`/api/users/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to remove user");
      setUsers((prev) => prev.filter(u => u.id !== id));
    } catch (err: any) {
      console.error("Remove user error:", err);
    }
  };

  return (
    <div className="min-h-screen space-y-6">
      <h1 className="text-2xl font-bold">Manage Users</h1>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm px-4 py-2 border rounded-lg shadow-sm"
      />

      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white p-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2">Email</th>
              <th className="py-2">Status</th>
              <th className="py-2">Admin</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b last:border-none">
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">
                    {user.isActive ? (
                      <span className="px-2 py-1 rounded bg-green-100 text-green-700">Active</span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-red-100 text-red-700">Suspended</span>
                    )}
                  </td>
                  <td className="py-2">{user.isAdmin ? "Yes" : "No"}</td>
                  <td className="py-2 flex gap-2">
                    {user.isActive ? (
                      <Button size="sm" variant="outline" onClick={() => handleSuspend(user.id)}>
                        Suspend
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleReinstate(user.id)}>
                        Reinstate
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => handleRemove(user.id)}>
                      Remove
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => setViewUser(user)}>
                      View more
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  {loading ? "Loading..." : "No users found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {hasMore && !loading && (
          <div className="flex justify-center mt-4">
            <Button onClick={() => fetchUsers(lastDocId)}>Load More</Button>
          </div>
        )}
      </div>

      {/* View User Modal */}
      {viewUser && (
        <Modal onClose={() => setViewUser(null)}>
          <h2 className="text-xl font-bold mb-4">User Details</h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {viewUser.id}</p>  {/* Added ID */}
            <p><strong>Email:</strong> {viewUser.email}</p>
            <p><strong>First Name:</strong> {viewUser.firstName || "-"}</p>
            <p><strong>Last Name:</strong> {viewUser.lastName || "-"}</p>
            <p><strong>Phone Number:</strong> {viewUser.phoneNumber || "-"}</p>
            <p><strong>Active:</strong> {viewUser.isActive ? "Yes" : "No"}</p>
            <p><strong>Admin:</strong> {viewUser.isAdmin ? "Yes" : "No"}</p>
            <p><strong>Email Verified:</strong> {viewUser.emailVerified ? "Yes" : "No"}</p>
            <p>
              <strong>Created At:</strong>{" "}
              {viewUser.createdAt
                ? typeof viewUser.createdAt === "string"
                  ? viewUser.createdAt
                  : new Date(viewUser.createdAt._seconds * 1000).toLocaleString()
                : "-"}
            </p>
            <p>
              <strong>Updated At:</strong>{" "}
              {viewUser.updatedAt
                ? typeof viewUser.updatedAt === "string"
                  ? viewUser.updatedAt
                  : new Date(viewUser.updatedAt._seconds * 1000).toLocaleString()
                : "-"}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
