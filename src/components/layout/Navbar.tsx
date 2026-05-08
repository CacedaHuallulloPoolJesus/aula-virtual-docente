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

  const panelLine = isAdmin
    ? "Panel Administrativo"
    : "Panel Académico Docente";

  const roleLabel = isAdmin ? "Administrador" : "Docente";

  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#F2B705]/20 bg-[#0B3B70] px-4 py-3 shadow-lg shadow-black/10 backdrop-blur sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#F2B705] bg-white shadow-lg">
          <Image
            src="/insignia.png"
            alt="Logo Institucional"
            width={56}
            height={56}
            priority
            unoptimized
            className="h-full w-full object-contain"
          />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-white sm:text-lg">
            Sistema Integral de Aula Virtual Docente
          </h1>

          <p className="truncate text-xs font-medium text-[#F2B705]">
            {institutionDefaults.fullLegalName}
          </p>

          <p className="mt-0.5 truncate text-xs text-white/80">
            {displayName} · {roleLabel} · {panelLine}
          </p>
        </div>
      </div>

      <Button
        variant="secondary"
        className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-[#F2B705]/40 bg-white/10 px-4 py-2 text-white backdrop-blur transition-all hover:bg-white/20"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut size={15} />
        Cerrar sesión
      </Button>
    </header>
  );
}