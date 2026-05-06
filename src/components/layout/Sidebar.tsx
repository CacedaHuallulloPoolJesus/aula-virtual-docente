"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ADMIN_NAV, TEACHER_NAV } from "@/constants/routes";
import { institutionDefaults } from "@/constants/institution";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";

export function Sidebar() {
  const pathname = usePathname();
  const { data } = useSession();
  const role = data?.user?.role;
  const links = role === Role.ADMIN ? ADMIN_NAV : TEACHER_NAV;
  const panelTitle = role === Role.ADMIN ? "Panel Administrativo" : "Panel Académico Docente";

  return (
    <aside className="w-full border-r border-white/10 bg-primary p-4 text-white shadow-lg shadow-primary/20 lg:sticky lg:top-0 lg:h-screen lg:w-72">
      <div className="mb-6 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-accent/60 bg-white/10 ring-1 ring-white/20">
            <Image
              src={institutionDefaults.logoPath}
              alt=""
              width={48}
              height={48}
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">Sistema Integral</p>
            <p className="text-xs font-bold leading-tight text-white">Aula Virtual Docente</p>
          </div>
        </div>
        <h2 className="text-base font-bold text-white">{panelTitle}</h2>
        <p className="mt-1 text-[11px] leading-snug text-white/75">{institutionDefaults.fullLegalName}</p>
      </div>
      <nav className="grid gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-secondary text-white shadow-md ring-1 ring-accent/35"
                  : "text-white/90 hover:bg-secondary/85 hover:text-white",
              )}
            >
              <span className={active ? "text-accent" : "text-white/80"}>
                <Icon size={16} />
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
