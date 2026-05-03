"use client";

import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";
import { useAppData } from "@/components/providers/AppDataProvider";

export function Navbar() {
  const router = useRouter();
  const { auth, data, logout } = useAppData();
  const teacher = data.teachers.find((item) => item.id === auth.user?.teacherId);
  const displayName = teacher ? `${teacher.firstName} ${teacher.lastName}` : "Administrador";
  const role = auth.user?.role ?? "ADMIN";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Sistema Integral de Aula Virtual Docente</h1>
        <p className="inline-flex items-center gap-1 text-xs text-slate-600">
          <ShieldCheck size={12} className="text-blue-600" />
          {displayName} - {role === "ADMIN" ? "Administrador" : "Docente"}
        </p>
      </div>
      <Button variant="secondary" className="inline-flex items-center gap-2" onClick={handleLogout}>
        <LogOut size={15} />
        Salir
      </Button>
    </header>
  );
}
