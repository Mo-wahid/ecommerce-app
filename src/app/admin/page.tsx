"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Package, ShoppingCart, Clock, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";
import StatusDropdown from "@/components/StatusDropdown";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

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
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 text-red-600 p-4 rounded-md mt-8">{error}</div>;
  }

  // Filter logic for orders
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentOrdersFiltered = stats.recentOrders.filter(
    (o: any) => new Date(o.createdAt) >= twentyFourHoursAgo
  );
  
  const allOrdersToPaginate = showAllOrders ? stats.recentOrders : recentOrdersFiltered;
  const totalPages = Math.ceil(allOrdersToPaginate.length / ITEMS_PER_PAGE);
  const displayedOrders = allOrdersToPaginate.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your store's performance.</p>
        </div>
        <div className="flex space-x-4">
          <Link 
            href="/admin/products" 
            className={buttonVariants()}
          >
            Manage Products
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-xl font-bold">
            {showAllOrders ? "All Orders" : "Recent Orders (Last 24h)"}
          </h2>
          <Button variant="ghost" className="text-sm text-primary hover:text-primary/80" onClick={() => { setShowAllOrders(!showAllOrders); setCurrentPage(1); }}>
            {showAllOrders ? "Show Recent Only" : "View All Orders"}
          </Button>
        </div>
        
        <Card className="flex flex-col gap-0 max-h-[600px] overflow-hidden">

        <CardContent className="p-0 w-full overflow-x-auto min-w-0 flex-1">
          {displayedOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No orders found"
              description={showAllOrders ? "No orders have been placed yet." : "No recent orders in the last 24 hours."}
              className="border-0 rounded-none shadow-none bg-transparent dark:bg-transparent h-full"
            />
          ) : (
            <Table>
              <TableHeader>
                  <TableHead className="w-[120px]" isRowHeader>Order ID</TableHead>
                  <TableHead className="w-full">Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Status</TableHead>
              </TableHeader>
              <TableBody>
                {displayedOrders.map((order: any) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono text-xs">{order._id.substring(0, 10)}...</TableCell>
                    <TableCell>
                      <div className="font-medium">{order.user?.name || "Unknown"}</div>
                      <div className="text-muted-foreground text-xs">{order.user?.email}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="flex justify-end">
                      <StatusDropdown
                        currentStatus={order.orderStatus}
                        onStatusChange={(newStatus) => handleStatusChange(order._id, newStatus)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div>
              <Separator />
              <div className="p-4">
                <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        onClick={() => setCurrentPage(i + 1)} 
                        isActive={currentPage === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}