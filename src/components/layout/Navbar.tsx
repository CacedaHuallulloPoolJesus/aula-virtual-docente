"use client";

import { signOut, useSession } from "next-auth/react";
import { ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { Role } from "@prisma/client";

export function Navbar() {
  const { data } = useSession();
  const user = data?.user;
  const displayName = user?.name ?? user?.email ?? "Usuario";
  const roleLabel = user?.role === Role.ADMIN ? "Administrador" : "Docente";

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Sistema Integral de Aula Virtual Docente</h1>
        <p className="inline-flex items-center gap-1 text-xs text-slate-600">
          <ShieldCheck size={12} className="text-blue-600" />
          {displayName} — {roleLabel}
        </p>
      </div>
      <Button variant="secondary" className="inline-flex items-center gap-2" onClick={() => signOut({ callbackUrl: "/login" })}>
        <LogOut size={15} />
        Salir
      </Button>
    </header>
  );
}
