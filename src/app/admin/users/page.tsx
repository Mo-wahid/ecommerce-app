"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2, Trash2, ArrowLeft, Shield, ShieldAlert } from "lucide-react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

export default function ManageUsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const currentUser = session?.user as any;

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b dark:border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Manage Users</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">View and manage registered customers and admins.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors flex flex-col h-[600px]">
        {users.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 dark:text-slate-400 text-lg">No users found.</p>
          </div>
        ) : (
          <div className="overflow-auto w-full flex-1">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-gray-50 dark:bg-slate-900/90 backdrop-blur-sm z-10 border-b border-gray-200 dark:border-slate-700">
                <tr className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="p-4 font-bold">User</th>
                  <th className="p-4 font-bold">Role</th>
                  <th className="p-4 font-bold">Joined</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700 text-sm text-gray-900 dark:text-slate-100">
                {users.map((user) => {
                  const isMe = user._id === currentUser.id;
                  
                  return (
                    <tr key={user._id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${isMe ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold uppercase shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold flex items-center gap-2">
                              {user.name} 
                              {isMe && <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-[10px] uppercase tracking-wider">You</span>}
                            </div>
                            <div className="text-gray-500 dark:text-slate-400 text-xs">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-max ${
                          user.role === "admin" 
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        }`}>
                          {user.role === "admin" ? <ShieldAlert className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-600 dark:text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-3">
                          <button 
                            onClick={() => handleRoleToggle(user)}
                            disabled={isMe}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              isMe 
                                ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm"
                            }`}
                          >
                            {user.role === "admin" ? "Demote to User" : "Make Admin"}
                          </button>
                          <button 
                            onClick={() => confirmDelete(user)}
                            disabled={isMe}
                            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                              isMe
                                ? "opacity-50 cursor-not-allowed text-slate-400 dark:text-slate-500"
                                : "text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/20"
                            }`}
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
