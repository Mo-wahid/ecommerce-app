"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { User, Mail, Shield, CheckCircle, XCircle, Search, Trash2, Edit2, ShieldAlert, Key, MoreVertical, LogOut, Users, Loader2, ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function ManageUsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const currentUser = session?.user as any;

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; user: any | null; isDeleting: boolean }>({
    isOpen: false,
    user: null,
    isDeleting: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated" && currentUser) {
      if (currentUser.role !== "admin") {
        router.push("/");
      } else {
        fetchUsers();
      }
    }
  }, [status, currentUser, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success && json.data) {
        setUsers(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (user: any) => {
    if (user._id === currentUser.id) {
      toast.error("You cannot change your own role!");
      return;
    }

    const newRole = user.role === "admin" ? "user" : "admin";
    const toastId = toast.loading(`Changing role to ${newRole}...`);

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update role");

      toast.success(`User is now an ${newRole}!`, { id: toastId });
      setUsers(users.map((u) => (u._id === user._id ? { ...u, role: newRole } : u)));
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  const confirmDelete = (user: any) => {
    if (user._id === currentUser.id) {
      toast.error("You cannot delete your own account!");
      return;
    }
    setDeleteModalState({ isOpen: true, user, isDeleting: false });
  };

  const handleDelete = async () => {
    const user = deleteModalState.user;
    if (!user) return;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete user");

      toast.success("User deleted successfully");
      setUsers(users.filter((u) => u._id !== user._id));
      setDeleteModalState({ isOpen: false, user: null, isDeleting: false });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error deleting user");
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const displayedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b dark:border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Users</h1>
            <p className="text-muted-foreground mt-1 text-sm">View and manage registered customers and admins.</p>
          </div>
        </div>
      </div>

      <Card className="flex flex-col h-[600px] overflow-hidden border-border bg-card">
        {users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Try adjusting your search query to find the user you're looking for."
            className="border-0 rounded-none shadow-none bg-transparent"
          />
        ) : (
          <CardContent className="p-0 w-full overflow-x-auto min-w-0 flex-1">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableHead className="font-bold" isRowHeader>User</TableHead>
                <TableHead className="font-bold">Role</TableHead>
                <TableHead className="font-bold">Joined</TableHead>
                <TableHead className="font-bold text-right">Actions</TableHead>
              </TableHeader>
              <TableBody>
                {displayedUsers.map((user) => {
                  const isMe = user._id === currentUser.id;
                  
                  return (
                    <TableRow key={user._id} className={isMe ? 'bg-primary/5 dark:bg-primary/10' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold uppercase shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold truncate text-foreground flex items-center gap-2">
                              {user.name}
                              {isMe && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">You</span>}
                            </div>
                            <div className="text-muted-foreground text-xs truncate mt-0.5">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-max ${
                          user.role === "admin" 
                            ? "bg-primary/10 text-primary border border-primary/20" 
                            : "bg-secondary text-secondary-foreground border border-border"
                        }`}>
                          {user.role === "admin" ? <ShieldAlert className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onPress={() => handleRoleToggle(user)}
                            isDisabled={isMe}
                          >
                            {user.role === "admin" ? "Demote to User" : "Make Admin"}
                          </Button>
                          <Button 
                            variant="ghost"
                            size="icon"
                            onPress={() => confirmDelete(user)}
                            isDisabled={isMe}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        )}
        {totalPages > 1 && (
          <div className="mt-auto shrink-0 bg-white dark:bg-slate-900 z-10 relative">
            <Separator />
            <div className="p-4">
              <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onPress={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      onPress={() => setCurrentPage(i + 1)} 
                      isActive={currentPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext 
                    onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
        )}
      </Card>

      <DeleteConfirmModal 
        isOpen={deleteModalState.isOpen}
        itemName={deleteModalState.user?.name || ""}
        isDeleting={deleteModalState.isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, user: null, isDeleting: false })}
      />
    </div>
  );
}
