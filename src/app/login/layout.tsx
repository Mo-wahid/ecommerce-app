import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | E-Commerce",
  description: "Log in to your account to view your cart, history, and favorite products.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
