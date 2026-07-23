"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthModal } from "@/context/AuthModalContext";
import { apiClient } from "@/lib/api-client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function AuthModalInner() {
  const { isOpen, type, openModal, closeModal } = useAuthModal();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");

  const hasAutoOpened = useRef(false);

  useEffect(() => {
    if (searchParams?.get("login") === "true" && !hasAutoOpened.current) {
      openModal("login");
      hasAutoOpened.current = true;
    } else if (searchParams?.get("login") !== "true") {
      hasAutoOpened.current = false;
    }
  }, [searchParams, openModal]);

  useEffect(() => {
    setFormError("");
  }, [type, isOpen]);

  const isLogin = type === "login";
  const explicitCallback = searchParams?.get("callbackUrl");
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : "/";

  const handleClose = () => {
    closeModal();
    // Clear the ?login=true from URL if present
    if (searchParams?.has("login")) {
      router.push(window.location.pathname);
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    const callbackUrl = explicitCallback || currentPath;
    signIn("google", { callbackUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    try {
      if (isLogin) {
        // Login Flow
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (res?.error) {
          setFormError(res.error);
        } else {
          toast.success("Successfully logged in!");
          closeModal();
          
          // Check role to route admin appropriately
          const sessionRes = await fetch("/api/auth/session");
          const sessionData = await sessionRes.json();
          const role = sessionData?.user?.role;

          if (explicitCallback) {
            router.push(explicitCallback);
          } else if (role === "admin") {
            router.push("/admin");
          } else {
            router.push(currentPath);
          }
          
          router.refresh();
        }
      } else {
        // Registration Flow
        if (password !== confirmPassword) {
          setFormError("Passwords do not match!");
          setIsLoading(false);
          return;
        }

        await apiClient.register(name, email, password);

        toast.success("Registration successful!");
          // Auto-login after successful registration
          const loginRes = await signIn("credentials", {
            redirect: false,
            email,
            password,
          });
          if (!loginRes?.error) {
            closeModal();
            
            const sessionRes = await fetch("/api/auth/session");
            const sessionData = await sessionRes.json();
            const role = sessionData?.user?.role;

            if (explicitCallback) {
              router.push(explicitCallback);
            } else if (role === "admin") {
              router.push("/admin");
            } else {
              router.push(currentPath);
            }
            
            router.refresh();
          }
      }
    } catch (error) {
      setFormError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && handleClose()} className="sm:max-w-md p-6">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl font-bold tracking-tight text-center">
          {isLogin ? "Welcome Back" : "Create Account"}
        </DialogTitle>
        <DialogDescription className="text-center">
          {isLogin ? "Enter your details to access your account." : "Join us to start shopping for premium goods."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e: any) => setName(e.target.value)}
                  className="h-11 rounded-xl"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                name="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  className="h-11 rounded-xl pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e: any) => setConfirmPassword(e.target.value)}
                    className="h-11 rounded-xl pr-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-100 dark:border-red-900/50">
                {formError}
              </div>
            )}

            <Button
              type="submit"
              isDisabled={isLoading || isGoogleLoading}
              className="w-full h-12 rounded-xl mt-4 font-bold text-base cursor-pointer"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
            <span className="text-xs text-slate-400 font-medium uppercase">Or</span>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          </div>

          {/* Google Auth Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            isDisabled={isLoading || isGoogleLoading}
            className="w-full h-12 rounded-xl gap-3 text-base cursor-pointer"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {isGoogleLoading ? "Connecting..." : "Continue with Google"}
          </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => openModal(isLogin ? "register" : "login")}
            className="text-primary font-bold hover:underline transition-all cursor-pointer"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
    </Dialog>
  );
}

export default function AuthModal() {
  return (
    <Suspense fallback={null}>
      <AuthModalInner />
    </Suspense>
  );
}
