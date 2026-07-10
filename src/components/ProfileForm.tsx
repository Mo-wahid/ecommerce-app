"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2, Save, User, Lock } from "lucide-react";

export default function ProfileForm() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isGoogleUser = !session?.user?.email?.includes("@") || false; // Approximation, better if we check provider, but email is fine. Actually, if they have an image they are likely google. Let's just allow password change for all, or if they don't have a password.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      
      // Update next-auth session with new name
      await update({ name });
      setPassword("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return <div className="text-center p-8">Loading profile...</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden max-w-2xl transition-colors">
      <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            {session.user.image ? (
              <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{session.user.name}</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{session.user.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 capitalize border border-brand-200 dark:border-brand-800/50">
              {session.user.role || "User"} Account
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Display Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
              placeholder="Your Name"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={session.user.email || ""}
            disabled
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-500 cursor-not-allowed outline-none transition-all"
            title="Email cannot be changed"
          />
          <p className="text-xs text-slate-500 mt-2">Email address cannot be changed currently.</p>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            New Password <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
              placeholder="Enter new password"
              minLength={6}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-600/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
