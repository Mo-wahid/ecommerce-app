"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || "Something went wrong during registration");
      }

      toast.success("Account created successfully! Please log in.");
      router.push("/login");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-black text-center text-slate-900 mb-8 tracking-tight">Create an Account</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
            <input
              type="text"
              {...register("name")}
              className={`w-full px-4 py-2.5 text-slate-900 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all ${
                errors.name ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50"
              }`}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              {...register("email")}
              className={`w-full px-4 py-2.5 text-slate-900 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all ${
                errors.email ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50"
              }`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              {...register("password")}
              className={`w-full px-4 py-2.5 text-slate-900 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all ${
                errors.password ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50"
              }`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-brand-600 text-white py-2.5 px-4 rounded-lg hover:bg-brand-700 disabled:bg-brand-400 disabled:cursor-not-allowed transition-all font-medium mt-6 shadow-md shadow-brand-600/20"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}