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
  const [showAllOrders, setShowAllOrders] = useState(false);

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
      router.push("/");
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
      
      setStats((prev) => {
        const orderToUpdate = prev.recentOrders.find((o: any) => o._id === orderId) as any;
        const oldStatus = orderToUpdate?.orderStatus;
        let newPending = prev.pendingOrders;
        
        if (oldStatus === "Pending" && newStatus !== "Pending") {
          newPending = Math.max(0, newPending - 1);
        } else if (oldStatus !== "Pending" && newStatus === "Pending") {
          newPending += 1;
        }

        return {
          ...prev,
          pendingOrders: newPending,
          recentOrders: prev.recentOrders.map((o: any) =>
            o._id === orderId ? { ...o, orderStatus: newStatus } : o
          ) as any,
        };
      });
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

  // Filter logic for orders
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentOrdersFiltered = stats.recentOrders.filter(
    (o: any) => new Date(o.createdAt) >= twentyFourHoursAgo
  ).slice(0, 8);
  const displayedOrders = showAllOrders ? stats.recentOrders : recentOrdersFiltered;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center pb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Overview of your store's performance.</p>
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
        <div className="bg-brand-50 dark:bg-brand-900/20 p-6 rounded-xl shadow-sm border border-brand-100 dark:border-brand-800/30 transition-colors">
          <h3 className="text-brand-600 dark:text-brand-400 text-sm font-bold uppercase tracking-wider mb-2">Total Orders</h3>
          <div className="text-4xl font-black text-brand-900 dark:text-brand-100">{stats.totalOrders}</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl shadow-sm border border-blue-100 dark:border-blue-800/30 transition-colors">
          <h3 className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider mb-2">Pending Orders</h3>
          <div className="text-4xl font-black text-blue-900 dark:text-blue-100">{stats.pendingOrders}</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-800/30 transition-colors">
          <h3 className="text-emerald-600 dark:text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2">Registered Users</h3>
          <div className="text-4xl font-black text-emerald-900 dark:text-emerald-100">{stats.totalUsers}</div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 transition-colors flex flex-col h-[500px]">
        <div className="p-5 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 rounded-t-xl shrink-0 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
            {showAllOrders ? "All Orders" : "Recent Orders (Last 24h)"}
          </h2>
          <button
            onClick={() => setShowAllOrders(!showAllOrders)}
            className="text-brand-600 dark:text-brand-400 font-bold hover:underline text-sm"
          >
            {showAllOrders ? "Show Recent Only" : "View All Orders"}
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 min-h-0">
          {displayedOrders.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center h-full">
              <p className="text-gray-500 dark:text-slate-400 text-lg">
                {showAllOrders ? "No orders have been placed yet." : "No recent orders in the last 24 hours."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-gray-50 dark:bg-slate-900/90 backdrop-blur-sm z-10 border-b border-gray-200 dark:border-slate-700">
                <tr className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="p-4 font-bold">Order ID</th>
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Total</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700 text-sm text-gray-900 dark:text-slate-100">
                {displayedOrders.map((order: import("@/types").IOrder) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 font-mono text-xs">{order._id.substring(0, 10)}...</td>
                    <td className="p-4">
                      <div className="font-bold">{order.user?.name || "Unknown"}</div>
                      <div className="text-gray-500 dark:text-slate-400 text-xs">{order.user?.email}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-600 dark:text-slate-300">
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 font-black text-brand-600 dark:text-brand-400">
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
          )}
        </div>
      </div>
    </div>
  );
}