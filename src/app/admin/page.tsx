"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import StatusDropdown from "@/components/StatusDropdown";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && user) {
      if (user.role !== "admin") {
        router.push("/");
      } else {
        fetchDashboardData();
      }
    }
  }, [status, user, router]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update order status");
      }
      
      setStats((prev) => ({
        ...prev,
        recentOrders: prev.recentOrders.map((o: any) =>
          o._id === orderId ? { ...o, orderStatus: newStatus } : o
        ) as any,
      }));
      toast.success("Order status updated");
    } catch (err) {
      toast.error("Failed to update order status");
    }
  };

  if (status === "loading" || loading) {
    return <div className="text-center py-12 text-gray-600">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-600 p-4 rounded-md mt-8">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Overview of your store's performance.</p>
        </div>
        <div className="flex space-x-4">
          <Link 
            href="/admin/products" 
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
          >
            Manage Products
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 transition-colors">
          <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Total Orders</h3>
          <div className="text-4xl font-bold text-gray-900 dark:text-slate-100">{stats.totalOrders}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 transition-colors">
          <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Pending Orders</h3>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.pendingOrders}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 transition-colors">
          <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Registered Users</h3>
          <div className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.totalUsers}</div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Recent Orders</h2>
        </div>
        
        {stats.recentOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-slate-400">No orders have been placed yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700 text-sm text-gray-900 dark:text-slate-100">
                {stats.recentOrders.map((order: import("@/types").IOrder) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 font-mono text-xs">{order._id.substring(0, 10)}...</td>
                    <td className="p-4">
                      <div className="font-medium">{order.user?.name || "Unknown"}</div>
                      <div className="text-gray-500 dark:text-slate-400 text-xs">{order.user?.email}</div>
                    </td>
                    <td className="p-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <StatusDropdown
                        currentStatus={order.orderStatus}
                        onStatusChange={(newStatus) => handleStatusChange(order._id, newStatus)}
                      />
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