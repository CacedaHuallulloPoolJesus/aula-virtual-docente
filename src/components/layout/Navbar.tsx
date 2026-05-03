"use client";

import { signOut, useSession } from "next-auth/react";
import { ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { Role } from "@prisma/client";

export function Navbar() {
  const { data } = useSession();
  const user = data?.user;
  const displayName = user?.name ?? user?.email ?? "Usuario";
  const roleLabel = user?.role === Role.ADMIN ? "Administración" : "Docente";

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-secondary/15 bg-white px-6 py-3 shadow-sm shadow-primary/5 backdrop-blur">
      <div>
        <h1 className="text-lg font-bold text-primary">Sistema Integral de Aula Virtual Docente</h1>
        <p className="inline-flex items-center gap-1 text-xs text-secondary">
          <ShieldCheck size={12} className="text-secondary" />
          {displayName} · {roleLabel} · Panel Académico Docente
        </p>
      </div>
      <Button variant="secondary" className="inline-flex items-center gap-2" onClick={() => signOut({ callbackUrl: "/login" })}>
        <LogOut size={15} />
        Cerrar sesión
      </Button>
    </header>
  );
}
