import { DemoAuthGuard } from "@/components/layout/DemoAuthGuard";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoAuthGuard>
      <div className="min-h-screen bg-slate-50 lg:flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </DemoAuthGuard>
  );
}
