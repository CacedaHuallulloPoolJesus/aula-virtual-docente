"use client";

import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { institutionDefaults } from "@/constants/institution";
import { Role } from "@prisma/client";

export function Navbar() {
  const { data } = useSession();
  const user = data?.user;
  const displayName = user?.name ?? user?.email ?? "Usuario";
  const isAdmin = user?.role === Role.ADMIN;
  const panelLine = isAdmin ? "Panel Administrativo" : "Panel Académico Docente";
  const roleLabel = isAdmin ? "Administrador" : "Docente";

  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-secondary/15 bg-white px-4 py-3 shadow-sm shadow-primary/5 backdrop-blur sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative hidden h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-accent/50 bg-cream sm:block">
          <Image src={institutionDefaults.logoPath} alt="" width={44} height={44} className="object-cover" sizes="44px" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-primary sm:text-lg">Sistema Integral de Aula Virtual Docente</h1>
          <p className="truncate text-xs text-secondary">{institutionDefaults.fullLegalName}</p>
          <p className="mt-0.5 truncate text-xs text-foreground/70">
            {displayName} · {roleLabel} · {panelLine}
          </p>
        </div>
      </div>
      <Button variant="secondary" className="inline-flex shrink-0 cursor-pointer items-center gap-2" onClick={() => signOut({ callbackUrl: "/login" })}>
        <LogOut size={15} />
        Cerrar sesión
      </Button>
    </header>
  );
}
