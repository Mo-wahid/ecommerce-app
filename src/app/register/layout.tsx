import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | E-Commerce",
  description: "Create a new account to start shopping our exclusive products.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
