"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Activity, BarChart3, BookOpen, Settings, UserSquare2, Users } from "lucide-react";
import { Card } from "@/components/ui";
import { institutionDefaults } from "@/constants/institution";

const links = [
  { href: "/docentes", label: "Docentes / Usuarios", desc: "Crear y administrar cuentas docentes", icon: UserSquare2 },
  { href: "/grados-secciones", label: "Grados y Secciones", desc: "Estructura académica del aula", icon: BookOpen },
  { href: "/estudiantes", label: "Estudiantes", desc: "Matrícula y datos de estudiantes", icon: Users },
  { href: "/reportes", label: "Reportes", desc: "Indicadores y exportaciones", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", desc: "Datos institucionales y apariencia", icon: Settings },
  { href: "/actividad-docente", label: "Actividad docente", desc: "Resumen de uso por docente", icon: Activity },
] as const;

export default function AdminDashboardHome() {
  const { data } = useSession();
  const name = data?.user?.name ?? data?.user?.email ?? "Administrador";

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-start gap-6 rounded-2xl border border-secondary/15 bg-white p-6 shadow-sm">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#F2B705] bg-white p-1 shadow-lg">
          <Image
            src="/insignia.png"
            alt="Insignia Institución Educativa Virgen del Carmen"
            width={96}
            height={96}
            priority
            unoptimized
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Sistema Integral</p>
          <h1 className="text-2xl font-bold text-primary">Panel Administrativo</h1>
          <p className="mt-1 text-sm text-foreground/75">{institutionDefaults.fullLegalName}</p>
          <p className="mt-2 text-sm text-foreground/80">
            Bienvenido, <span className="font-semibold text-primary">{name}</span>. Elija un módulo para continuar.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {links.map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href} className="block">
            <Card className="h-full border-secondary/15 p-5 transition hover:border-accent/50 hover:shadow-md">
              <Icon className="mb-3 text-secondary" size={28} />
              <h2 className="font-bold text-primary">{label}</h2>
              <p className="mt-1 text-sm text-foreground/70">{desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
