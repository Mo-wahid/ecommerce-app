"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Basic Client-Side Auth Check
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "Admin") {
      // If they aren't an admin, kick them back to the home page
      router.push("/");
      return;
    }

    // 2. Fetch the Dashboard Statistics
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Failed to fetch dashboard data");
        }

        setStats(json.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-600 p-4 rounded-md mt-8">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2">Overview of your store's performance.</p>
        </div>
        <Link 
          href="/admin/add-product" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          + Add New Product
        </Link>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Total Products</h3>
          <div className="text-4xl font-bold text-gray-900">{stats.totalProducts}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Total Orders</h3>
          <div className="text-4xl font-bold text-blue-600">{stats.totalOrders}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Registered Users</h3>
          <div className="text-4xl font-bold text-green-600">{stats.totalUsers}</div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        </div>
        
        {stats.recentOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No orders have been placed yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-900">
                {stats.recentOrders.map((order: import("@/types").IOrder) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-xs">{order._id.substring(0, 10)}...</td>
                    <td className="p-4">
                      <div className="font-medium">{order.user?.name || "Unknown"}</div>
                      <div className="text-gray-500 text-xs">{order.user?.email}</div>
                    </td>
                    <td className="p-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${order.orderStatus === "Pending" ? "bg-yellow-100 text-yellow-800" : ""}
                        ${order.orderStatus === "Delivered" ? "bg-green-100 text-green-800" : ""}
                        ${order.orderStatus === "Cancelled" ? "bg-red-100 text-red-800" : ""}
                        ${!["Pending", "Delivered", "Cancelled"].includes(order.orderStatus) ? "bg-blue-100 text-blue-800" : ""}
                      `}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}