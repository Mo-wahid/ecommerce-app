"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Save, User, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

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
    return (
      <div className="flex justify-center items-center py-24 min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden max-w-2xl transition-colors">
      <div className="p-6 sm:p-8 border-b border-border bg-muted/40">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {session.user.image ? (
              <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">{session.user.name}</h2>
            <p className="text-muted-foreground text-sm">{session.user.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground capitalize border border-border">
              {session.user.role || "User"} Account
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Display Name
          </label>
          <InputGroup className="h-12 rounded-xl">
            <InputGroupAddon align="inline-start">
              <User className="w-5 h-5 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
            />
          </InputGroup>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <Input
            type="email"
            value={session.user.email || ""}
            disabled
            className="h-12 rounded-xl bg-muted cursor-not-allowed text-muted-foreground"
            title="Email cannot be changed"
          />
          <p className="text-xs text-muted-foreground mt-2">Email address cannot be changed currently.</p>
        </div>

        <Separator className="my-4" />
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            New Password <span className="text-muted-foreground font-normal">(Leave blank to keep current)</span>
          </label>
          <InputGroup className="h-12 rounded-xl">
            <InputGroupAddon align="inline-start">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              minLength={6}
            />
          </InputGroup>
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            isDisabled={loading}
            className="h-12 px-6 rounded-xl font-bold"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
