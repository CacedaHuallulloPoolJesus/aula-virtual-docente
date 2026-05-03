"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV, TEACHER_NAV } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useAppData } from "@/components/providers/AppDataProvider";

export function Sidebar() {
  const pathname = usePathname();
  const { auth } = useAppData();
  const links = auth.user?.role === "ADMIN" ? ADMIN_NAV : TEACHER_NAV;

  return (
    <aside className="w-full border-r border-slate-200 bg-white/95 p-4 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-72">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Aula Virtual</p>
        <h2 className="text-lg font-bold text-slate-900">{auth.user?.role === "ADMIN" ? "Panel Administrador" : "Panel Docente"}</h2>
        <p className="mt-1 text-xs text-slate-600">Gestión académica integral</p>
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
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
