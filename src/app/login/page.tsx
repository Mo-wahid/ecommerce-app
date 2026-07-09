import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Login | E-Commerce",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  // If already logged in, redirect to the appropriate dashboard
  if (session) {
    if (session.user?.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }

  return <LoginForm />;
}