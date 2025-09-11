"use client";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">
        StudentMarket – Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Students</h3>
          <p className="text-2xl font-bold text-primary">1,247</p>
          <p className="text-green-600 text-sm">+12% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Active Listings</h3>
          <p className="text-2xl font-bold text-primary">205</p>
          <p className="text-green-600 text-sm">+8% from last week</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Sales</h3>
          <p className="text-2xl font-bold text-primary">$12,450</p>
          <p className="text-green-600 text-sm">+23% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Growth Rate</h3>
          <p className="text-2xl font-bold text-primary">+15.3%</p>
          <p className="text-gray-500 text-sm">Monthly growth</p>
        </div>
      </div>
    </div>
  );
}
