import { Navbar } from "../components/Navbar";
import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center px-4 mt-20">{children}</main>
    </>
  );
}