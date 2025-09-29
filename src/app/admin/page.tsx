"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import { toast } from "sonner";
import numeral from "numeral";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Item {
  id: string;
  price: number;
  status: "pending" | "for-sale" | "draft" | "sold" | "withdrawn";
  sellerId?: string; // important for sold items chart
}

interface User {
  id: string;
  email: string;
  isActive: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#facc15",
  "for-sale": "#3b82f6",
  draft: "#9ca3af",
  sold: "#10b981",
  withdrawn: "#ef4444",
};

export default function AdminDashboard() {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);

  const [, setItems] = useState<Item[]>([]);
  const [, setUsers] = useState<User[]>([]);

  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [priceBuckets, setPriceBuckets] = useState<{ range: string; count: number }[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState(0);

  const [totalItems, setTotalItems] = useState(0);
  const [itemsForSale, setItemsForSale] = useState(0);
  const [itemsSold, setItemsSold] = useState(0);
  const [, setItemDrafts] = useState(0);

  const [totalTurnover, setTotalTurnover] = useState(0);
  const [avgSoldPrice, setAvgSoldPrice] = useState(0);
  const [avgForSalePrice, setAvgForSalePrice] = useState(0);

  const [soldItemsByUsersChartData, setSoldItemsByUsersChartData] = useState<{ itemsSold: number; users: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth?.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      try {
        // Fetch items
        const itemsRes = await fetch("/api/items/list", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ page: 1, pageSize: 1000 }),
        });

        const itemsData = await itemsRes.json();
        if (!itemsRes.ok || !itemsData.success) throw new Error(itemsData.message || "Failed to fetch items");

        setItems(itemsData.items);

        // Item metrics
        setTotalItems(itemsData.items.length);
        setItemsForSale(itemsData.items.filter((i: Item) => i.status === "for-sale").length);
        setItemsSold(itemsData.items.filter((i: Item) => i.status === "sold").length);
        setItemDrafts(itemsData.items.filter((i: Item) => i.status === "draft").length);

        const totalTurnoverCalc = itemsData.items
          .filter((i: Item) => i.status === "sold")
          .reduce((sum: number, i: Item) => sum + i.price, 0);
        setTotalTurnover(totalTurnoverCalc);

        const soldItems = itemsData.items.filter((i: Item) => i.status === "sold");
        setAvgSoldPrice(soldItems.length ? soldItems.reduce((sum: number, i: Item) => sum + i.price, 0) / soldItems.length : 0);

        const forSaleItems = itemsData.items.filter((i: Item) => i.status === "for-sale");
        setAvgForSalePrice(forSaleItems.length ? forSaleItems.reduce((sum: number, i: Item) => sum + i.price, 0) / forSaleItems.length : 0);

        // Status counts
        const counts: Record<string, number> = {};
        ["pending", "for-sale", "draft", "sold", "withdrawn"].forEach((status) => {
          counts[status] = itemsData.items.filter((item: Item) => item.status === status).length;
        });
        setStatusCounts(counts);

        // Price buckets
        const buckets: { [range: string]: number } = {};
        const ranges = [0, 100, 250, 500, 1000, 2000, 5000, 10000, 20000];
        ranges.forEach((_, i) => {
          const min = ranges[i];
          const max = ranges[i + 1] || Infinity;
          const label = max === Infinity ? `${min}+` : `${min}-${max}`;
          buckets[label] = itemsData.items.filter((item: Item) => item.price >= min && item.price < max).length;
        });
        setPriceBuckets(Object.entries(buckets).map(([range, count]) => ({ range, count })));

        // Sold items per user chart
        const soldItemsByUser: Record<string, number> = {};
        soldItems.forEach((item: Item) => {
          const userId = item.sellerId || "unknown";
          soldItemsByUser[userId] = (soldItemsByUser[userId] || 0) + 1;
        });

        const frequencyMap: Record<number, number> = {};
        Object.values(soldItemsByUser).forEach((count) => {
          frequencyMap[count] = (frequencyMap[count] || 0) + 1;
        });

        const chartData = Object.entries(frequencyMap).map(([itemsSold, userCount]) => ({
          itemsSold: Number(itemsSold),
          users: userCount,
        }));
        setSoldItemsByUsersChartData(chartData);

        // Fetch users
        const pageSize = 100;
        let allUsers: User[] = [];
        let lastDocId: string | null = null;

        while (true) {
          const params = new URLSearchParams();
          if (lastDocId) params.set("startAfter", lastDocId);
          params.set("limit", pageSize.toString());

          const usersRes = await fetch(`/api/users/list?${params.toString()}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!usersRes.ok) {
            const errData = await usersRes.json().catch(() => ({}));
            throw new Error((errData as any).message || "Failed to fetch users");
          }

          const usersData: User[] = await usersRes.json();
          if (!usersData || usersData.length === 0) break;

          allUsers = allUsers.concat(usersData);
          lastDocId = usersData[usersData.length - 1].id;
          if (usersData.length < pageSize) break;
        }

        setUsers(allUsers);
        setTotalUsers(allUsers.length);
        setActiveUsers(allUsers.filter((u) => u.isActive).length);
        setInactiveUsers(allUsers.filter((u) => !u.isActive).length);

      } catch (err: any) {
        toast.error(err.message || "Failed to fetch admin metrics");
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchData();
  }, [auth]);

  if (loading) {
    return (
      <h1 className="text-center text-zinc-400 py-20 font-bold text-2xl">
        Loading dashboard...
      </h1>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Top metrics: 3 blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-4 shadow rounded bg-white">
          <h2 className="font-semibold mb-2">Items</h2>
          <p>Total: {totalItems}</p>
          <p>For Sale: {itemsForSale}</p>
          <p>Sold: {itemsSold}</p>
        </div>

        <div className="p-4 shadow rounded bg-white">
          <h2 className="font-semibold mb-2">Item Prices</h2>
          <p>Turnover: R{numeral(totalTurnover).format("0,0.00")}</p>
          <p>Avg Sold Price: R{numeral(avgSoldPrice).format("0,0.00")}</p>
          <p>Avg For Sale Price: R{numeral(avgForSalePrice).format("0,0.00")}</p>
        </div>

        <div className="p-4 shadow rounded bg-white">
          <h2 className="font-semibold mb-2">Users</h2>
          <p>Total: {totalUsers}</p>
          <p>Active: {activeUsers}</p>
          <p>Inactive: {inactiveUsers}</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 shadow rounded bg-white">
          <h2 className="font-semibold mb-2">Items per Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(statusCounts).map(([status, count]) => ({ status, count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count">
                {Object.entries(statusCounts).map(([status]) => (
                  <Cell key={status} fill={STATUS_COLORS[status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 shadow rounded bg-white">
          <h2 className="font-semibold mb-2">Item Price Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceBuckets}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 shadow rounded bg-white">
          <h2 className="font-semibold mb-2">Users: Active vs Inactive</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Active", value: activeUsers },
                  { name: "Inactive", value: inactiveUsers },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                <Cell key="active" fill="#10b981" />
                <Cell key="inactive" fill="#ef4444" />
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 shadow rounded bg-white">
          <h2 className="font-semibold mb-2">Users vs Sold Items</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={soldItemsByUsersChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="itemsSold" label={{ value: 'Items Sold', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Number of Users', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="users" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
