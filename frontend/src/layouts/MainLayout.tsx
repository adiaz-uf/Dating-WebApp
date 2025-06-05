import { Navbar } from "../components/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-pink-50 px-4">{children}</main>
    </>
  );
}