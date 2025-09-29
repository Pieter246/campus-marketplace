"use client";

import { useEffect, useState, useRef } from "react";
import { getAuth } from "firebase/auth";
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

type SortColumn = 'email' | 'isActive' | 'isAdmin' | 'firstName' | 'lastName' | 'phoneNumber';
type SortDirection = 'asc' | 'desc';

const DropdownMenu: React.FC<{
  user: User;
  onSuspend: (id: string) => void;
  onReinstate: (id: string) => void;
  onRemove: (id: string) => void;
  onViewMore: (user: User) => void;
}> = ({ user, onSuspend, onReinstate, onRemove, onViewMore }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update menu position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4, // 4px margin below button
        left: rect.right + window.scrollX - 192, // Align right edge of menu (w-48 = 192px)
      });
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="More actions"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
        </svg>
      </button>
      {isOpen && (
        <div
          className="fixed w-48 bg-white border rounded-lg shadow-lg z-50"
          style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
        >
          <div className="py-1">
            {user.isActive ? (
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onSuspend(user.id);
                  setIsOpen(false);
                }}
              >
                Suspend
              </button>
            ) : (
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onReinstate(user.id);
                  setIsOpen(false);
                }}
              >
                Reinstate
              </button>
            )}
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onRemove(user.id);
                setIsOpen(false);
              }}
            >
              Remove
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onViewMore(user);
                setIsOpen(false);
              }}
            >
              View more
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('email');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not logged in");

      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/users/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to fetch users");
      }

      const data: User[] = await res.json();
      setUsers(data);
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

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredUsers = users
    .filter(
      (user) =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        user.phoneNumber?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      switch (sortColumn) {
        case 'email':
          return multiplier * a.email.localeCompare(b.email);
        case 'firstName':
          return multiplier * (a.firstName || '').localeCompare(b.firstName || '');
        case 'lastName':
          return multiplier * (a.lastName || '').localeCompare(b.lastName || '');
        case 'phoneNumber':
          return multiplier * (a.phoneNumber || '').localeCompare(b.phoneNumber || '');
        case 'isActive':
          return multiplier * (a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1);
        case 'isAdmin':
          return multiplier * (a.isAdmin === b.isAdmin ? 0 : a.isAdmin ? -1 : 1);
        default:
          return 0;
      }
    });

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Users</h1>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm px-4 py-2 border rounded-lg shadow-sm"
      />

      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white p-4 overflow-x-auto min-h-[200px] overflow-y-visible">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2 cursor-pointer" onClick={() => handleSort('firstName')}>
                First Name {sortColumn === 'firstName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-2 cursor-pointer" onClick={() => handleSort('lastName')}>
                Last Name {sortColumn === 'lastName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-2 cursor-pointer" onClick={() => handleSort('email')}>
                Email {sortColumn === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-2 cursor-pointer" onClick={() => handleSort('phoneNumber')}>
                Phone Number {sortColumn === 'phoneNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-2 cursor-pointer" onClick={() => handleSort('isActive')}>
                Status {sortColumn === 'isActive' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-2 cursor-pointer" onClick={() => handleSort('isAdmin')}>
                Admin {sortColumn === 'isAdmin' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b last:border-none">
                  <td className="py-2">{user.firstName || '-'}</td>
                  <td className="py-2">{user.lastName || '-'}</td>
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">{user.phoneNumber || '-'}</td>
                  <td className="py-2">
                    {user.isActive ? (
                      <span className="px-2 py-1 rounded bg-green-100 text-green-700">Active</span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-red-100 text-red-700">Suspended</span>
                    )}
                  </td>
                  <td className="py-2">{user.isAdmin ? "Yes" : "No"}</td>
                  <td className="py-2">
                    <DropdownMenu
                      user={user}
                      onSuspend={handleSuspend}
                      onReinstate={handleReinstate}
                      onRemove={handleRemove}
                      onViewMore={setViewUser}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-500">
                  {loading ? "Loading..." : "No users found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View User Modal */}
      {viewUser && (
        <Modal onClose={() => setViewUser(null)}>
          <h2 className="text-xl font-bold mb-4">User Details</h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {viewUser.id}</p>
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