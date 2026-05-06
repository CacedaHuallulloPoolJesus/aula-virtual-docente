"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CalendarDays,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  Edit,
  FileUp,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Sparkles,
  Users,
  UserCheck,
  Filter,
} from "lucide-react";

const students = [
  { code: "#IEVC-2024-001", name: "Alonzo Arana, Mateo", initials: "AA", attendance: "Presente", avg: "18.5", tone: "blue" },
  { code: "#IEVC-2024-023", name: "Castillo Pardo, Luciana", initials: "CP", attendance: "Falta", avg: "14.2", tone: "red" },
  { code: "#IEVC-2024-015", name: "Guzmán Mendoza, Diego", initials: "GM", attendance: "Tarde", avg: "16.8", tone: "yellow" },
  { code: "#IEVC-2024-009", name: "Vargas Soto, Milagros", initials: "VS", attendance: "Presente", avg: "19.0", tone: "blue" },
];

function AttendanceBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    Presente: "border border-emerald-200/80 bg-emerald-50 text-emerald-800",
    Falta: "border border-danger/30 bg-danger/10 text-danger",
    Tarde: "border border-accent/50 bg-accent/25 text-primary",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${styles[value] ?? "border border-secondary/20 bg-cream/80 text-primary"}`}>
      {value}
    </span>
  );
}

const NAV: { href: string; label: string }[] = [
  { href: "/dashboard", label: "Panel Académico Docente" },
  { href: "/estudiantes", label: "Gestión de Estudiantes" },
  { href: "/asistencia", label: "Registro de Asistencia" },
  { href: "/notas", label: "Evaluación de Notas" },
  { href: "/sesiones", label: "Sesiones de Aprendizaje" },
];

export default function StitchDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-white/10 bg-primary py-6 text-white shadow-lg shadow-primary/30">
        <div className="mb-10 flex items-center gap-3 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/25 text-accent ring-1 ring-accent/40">
            <GraduationCap size={22} className="text-accent" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-accent/90">Sistema integral</p>
            <h1 className="text-lg font-black uppercase leading-tight tracking-wide text-white">Aula virtual docente</h1>
            <p className="mt-0.5 text-xs font-semibold text-white/70">Panel Académico Docente</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {NAV.map((item, i) => {
            const icons = [LayoutDashboard, Users, ClipboardCheck, ClipboardList, BookOpen];
            const Icon = icons[i] ?? LayoutDashboard;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.href === "/dashboard"
                    ? "flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-secondary px-4 py-3 text-sm font-semibold text-white shadow-md ring-1 ring-accent/30"
                    : "flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-white/85 transition-all hover:bg-secondary/80 hover:pl-5"
                }
              >
                <span className={item.href === "/dashboard" ? "text-accent" : "text-white/80"}>
                  <Icon size={19} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 px-6 pt-6">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-3 py-3 text-sm font-semibold text-white/85 transition-colors hover:text-accent"
            onClick={() => void signOut({ callbackUrl: "/login" })}
          >
            <LogOut size={19} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <header className="fixed left-64 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-secondary/15 bg-white px-8 shadow-sm shadow-primary/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-extrabold tracking-tight text-primary">Sistema Integral de Aula Virtual Docente</h2>
          <span className="text-secondary/35">/</span>
          <span className="text-sm font-medium text-secondary/80">I. E. Virgen del Carmen — Huayucachi</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-secondary">
            <Link
              href="/reportes"
              className="rounded-full p-2 transition-colors hover:bg-cream/60"
              aria-label="Notificaciones y reportes"
            >
              <Bell size={20} />
            </Link>
            <Link href="/agentes-ia" className="rounded-full p-2 transition-colors hover:bg-cream/60" aria-label="Ayuda e IA">
              <CircleHelp size={20} />
            </Link>
            <Link href="/configuracion" className="rounded-full p-2 transition-colors hover:bg-cream/60" aria-label="Configuración">
              <Settings size={20} />
            </Link>
          </div>
          <div className="flex items-center gap-3 border-l border-secondary/15 pl-6">
            <div className="text-right">
              <p className="text-sm font-bold text-primary">Prof. Rosa Quispe Huamán</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/70">Docente</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent/50 bg-secondary text-sm font-bold text-white shadow-sm">
              RQ
            </div>
          </div>
        </div>
      </header>

      <main className="ml-64 mt-16 p-8">
        <div className="mx-auto max-w-[1440px] space-y-8">
          <section className="flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-bold tracking-tight text-primary">Panel Académico Docente</h3>
              <p className="mt-1 text-lg text-foreground/65">Bienvenida, profesora Rosa Quispe. Resumen de actividades pedagógicas y gestión del aula.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:brightness-110 active:scale-[0.98]"
                onClick={() => router.push("/asistencia")}
              >
                <CalendarDays size={18} /> Registrar asistencia
              </button>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-primary bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-cream/50 active:scale-[0.98]"
                onClick={() => router.push("/notas")}
              >
                <FileUp size={18} /> Registrar notas
              </button>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-primary shadow-lg shadow-accent/20 ring-1 ring-primary/10 transition hover:brightness-95 active:scale-[0.98]"
                onClick={() => router.push("/ia-sesiones")}
              >
                <Sparkles size={18} /> Nueva sesión con inteligencia artificial
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {(
              [
                [Users, "Total de estudiantes", "32", "Matrícula activa", "border-secondary", "bg-secondary/10 text-secondary"],
                [HelpCircle, "Promedio general", "16.5", "Escala vigesimal", "border-accent", "bg-accent/20 text-primary"],
                [UserCheck, "Porcentaje de asistencia", "94%", "Indicador mensual", "border-emerald-600", "bg-emerald-50 text-emerald-800"],
                [AlertTriangle, "Estudiantes en riesgo", "2", "Seguimiento pedagógico", "border-danger", "bg-danger/10 text-danger"],
              ] as [ComponentType<{ size?: number }>, string, string, string, string, string][]
            ).map(([Icon, title, value, label, border, iconStyle]) => (
              <article
                key={title}
                className={`rounded-2xl border border-secondary/10 border-l-4 ${border} bg-white p-6 shadow-md shadow-primary/5 transition hover:shadow-lg`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-black/5 ${iconStyle}`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-bold text-secondary/50">{label}</span>
                </div>
                <p className="text-xs font-medium text-foreground/60">{title}</p>
                <h4 className="text-3xl font-bold text-primary">{value}</h4>
              </article>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex h-[400px] flex-col rounded-2xl border border-secondary/10 bg-white p-8 shadow-md shadow-primary/5 lg:col-span-2">
              <div className="mb-8 flex items-center justify-between">
                <h5 className="text-sm font-bold uppercase tracking-wider text-primary">Progreso académico anual</h5>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-secondary" />
                  <span className="text-xs font-medium text-foreground/55">Promedio del aula</span>
                </div>
              </div>
              <div className="relative flex-1">
                <div className="absolute inset-0 flex items-end justify-between px-2">
                  {["Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep"].map((m, i) => (
                    <div key={m} className="relative w-px bg-cream" style={{ height: `${[40, 50, 45, 65, 75, 70, 85][i]}%` }}>
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-foreground/40">{m}</span>
                    </div>
                  ))}
                </div>
                <svg className="absolute inset-0 h-full w-full text-primary" preserveAspectRatio="none" viewBox="0 0 800 300">
                  <path d="M0,180 Q100,150 200,165 T400,105 T600,75 T800,45" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
                  <path d="M0,180 Q100,150 200,165 T400,105 T600,75 T800,45 L800,300 L0,300 Z" fill="currentColor" className="opacity-[0.08]" />
                </svg>
              </div>
            </div>

            <div className="flex h-[400px] flex-col rounded-2xl border border-white/10 bg-primary p-8 text-white shadow-lg shadow-primary/30">
              <h5 className="text-sm font-bold uppercase tracking-wider text-accent/90">Asistencia por semana</h5>
              <p className="mt-2 text-2xl font-bold">94.2 % total</p>
              <div className="flex flex-1 items-end justify-between gap-2 px-4 pb-4">
                {[90, 95, 85, 92].map((h, i) => (
                  <div key={i} className="flex w-full flex-col items-center gap-2">
                    <div className="relative h-[80%] w-full rounded-t-lg bg-white/10">
                      <div
                        className="absolute bottom-0 w-full rounded-t-lg bg-accent transition-all hover:brightness-110"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white/80">S{i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-4 text-sm text-white/85">
                <span>Meta institucional</span>
                <span className="font-bold text-accent">95.0 %</span>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-secondary/15 bg-white shadow-md shadow-primary/5">
            <div className="flex items-center justify-between border-b border-secondary/10 p-6">
              <div>
                <h5 className="text-2xl font-semibold text-primary">Gestión de Estudiantes</h5>
                <p className="text-sm text-foreground/60">Quinto grado de primaria — Aula A</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary/50" size={18} />
                  <input
                    className="rounded-xl border border-secondary/20 py-2 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/35"
                    placeholder="Buscar por nombre o código…"
                    aria-label="Buscar estudiante"
                  />
                </div>
                <button
                  type="button"
                  className="cursor-pointer rounded-xl border border-secondary/20 p-2 text-secondary transition hover:bg-cream/60"
                  aria-label="Filtrar listado"
                  onClick={() => router.push("/estudiantes")}
                >
                  <Filter size={20} />
                </button>
              </div>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary text-xs font-bold uppercase tracking-widest text-white">
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Apellidos y nombres</th>
                  <th className="px-6 py-4">Estado de asistencia</th>
                  <th className="px-6 py-4">Promedio (notas)</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10 [&>tr:nth-child(even)]:bg-primary/[0.02]">
                {students.map((s) => (
                  <tr key={s.code} className="transition-colors hover:bg-cream/40">
                    <td className="px-6 py-4 text-sm font-bold text-foreground/80">{s.code}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                            s.tone === "red"
                              ? "bg-danger/15 text-danger"
                              : s.tone === "yellow"
                                ? "bg-accent/35 text-primary"
                                : "bg-secondary/15 text-secondary"
                          }`}
                        >
                          {s.initials}
                        </div>
                        <span className="text-sm font-semibold text-foreground">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <AttendanceBadge value={s.attendance} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-primary">{s.avg}</span>
                    </td>
                    <td className="space-x-2 px-6 py-4 text-right">
                      <button
                        type="button"
                        className="cursor-pointer text-xs font-bold uppercase text-secondary hover:text-primary hover:underline"
                        onClick={() => router.push("/estudiantes")}
                      >
                        Ver ficha
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer text-foreground/40 transition-colors hover:text-secondary"
                        aria-label="Editar registro"
                        onClick={() => router.push("/estudiantes")}
                      >
                        <Edit size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-secondary/10 bg-cream/40 p-4 text-xs font-bold uppercase tracking-widest text-secondary/70">
              <span>Mostrando 4 de 32 estudiantes</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-secondary/20 bg-white text-primary transition hover:bg-secondary hover:text-white"
                    onClick={() => router.push("/estudiantes")}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
