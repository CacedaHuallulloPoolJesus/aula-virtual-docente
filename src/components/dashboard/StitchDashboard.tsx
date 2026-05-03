"use client";

import {
  Bell,
  CalendarDays,
  CircleHelp,
  ClipboardCheck,
  Edit,
  FileUp,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Sparkles,
  Star,
  Users,
  UserCheck,
  Filter,
} from "lucide-react";

const students = [
  { code: "#IEVC-2024-001", name: "Alonzo Arana, Mateo", initials: "AA", attendance: "Presente", avg: "18.5", tone: "blue" },
  { code: "#IEVC-2024-023", name: "Castillo Pardo, Luciana", initials: "CP", attendance: "Falta", avg: "14.2", tone: "red" },
  { code: "#IEVC-2024-015", name: "Guzmán Mendoza, Diego", initials: "GM", attendance: "Tardanza", avg: "16.8", tone: "yellow" },
  { code: "#IEVC-2024-009", name: "Vargas Soto, Milagros", initials: "VS", attendance: "Presente", avg: "19.0", tone: "blue" },
];

function AttendanceBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    Presente: "bg-blue-50 text-blue-700 border-blue-100",
    Falta: "bg-red-50 text-red-700 border-red-100",
    Tardanza: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return (
    <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase ${styles[value] ?? "bg-slate-100 text-slate-700"}`}>
      {value}
    </span>
  );
}

export default function StitchDashboard() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-slate-200 bg-white py-6 shadow-lg">
        <div className="mb-10 flex items-center gap-3 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#001e40] text-white">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-blue-900">Aula Virtual</h1>
            <p className="text-xs font-semibold text-slate-500">Docente Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            [LayoutDashboard, "Dashboard", true],
            [Users, "Estudiantes"],
            [ClipboardCheck, "Asistencia"],
            [Star, "Notas"],
            [Sparkles, "IA Sesiones"],
          ].map(([Icon, label, active]: any) => (
            <a
              key={label}
              href="#"
              className={
                active
                  ? "flex items-center gap-3 border-r-4 border-blue-900 bg-blue-50 px-6 py-3 text-sm font-semibold text-blue-900"
                  : "flex items-center gap-3 px-6 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:pl-8"
              }
            >
              <Icon size={19} />
              {label}
            </a>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-100 px-6 pt-6">
          <button className="flex items-center gap-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:text-red-600">
            <LogOut size={19} />
            Salir
          </button>
        </div>
      </aside>

      <header className="fixed left-64 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-8 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-extrabold tracking-tight text-blue-900">Aula Virtual Docente</h2>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-medium text-slate-500">I.E. Virgen del Carmen - Huayucachi</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-500">
            <button className="rounded-full p-2 transition-colors hover:bg-slate-50"><Bell size={20} /></button>
            <button className="rounded-full p-2 transition-colors hover:bg-slate-50"><CircleHelp size={20} /></button>
            <button className="rounded-full p-2 transition-colors hover:bg-slate-50"><Settings size={20} /></button>
          </div>
          <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
            <div className="text-right">
              <p className="text-sm font-bold text-blue-900">Prof. Rosa Quispe Huamán</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Docente</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-100 bg-blue-900 text-sm font-bold text-white">RQ</div>
          </div>
        </div>
      </header>

      <main className="ml-64 mt-16 p-8">
        <div className="mx-auto max-w-[1440px] space-y-8">
          <section className="flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-bold tracking-tight text-[#001e40]">¡Bienvenido, Prof. Rosa Quispe!</h3>
              <p className="mt-1 text-lg text-slate-500">Resumen de actividades pedagógicas y gestión del aula.</p>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 rounded-xl bg-[#001e40] px-6 py-3 text-sm font-semibold text-white shadow-lg active:scale-95">
                <CalendarDays size={18} /> Registrar Asistencia
              </button>
              <button className="flex items-center gap-2 rounded-xl border-2 border-[#001e40] bg-white px-6 py-3 text-sm font-semibold text-[#001e40] shadow-sm active:scale-95">
                <FileUp size={18} /> Subir Notas
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-semibold text-yellow-950 shadow-lg active:scale-95">
                <Sparkles size={18} /> Nueva Sesión IA
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {[
              [Users, "Estudiantes", "32", "Total", "border-[#001e40]", "bg-blue-50 text-blue-900"],
              [HelpCircle, "Promedio Grupal", "16.5", "Promedio", "border-yellow-400", "bg-yellow-50 text-yellow-700"],
              [UserCheck, "Asistencia", "94%", "Mensual", "border-green-600", "bg-green-100 text-green-700"],
              [CalendarDays, "Sesiones Pendientes", "5", "Pendientes", "border-red-600", "bg-red-50 text-red-700"],
            ].map(([Icon, title, value, label, border, iconStyle]: any) => (
              <article key={title} className={`rounded-xl border-l-4 ${border} bg-white p-6 shadow-sm`}>
                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconStyle}`}><Icon size={20} /></div>
                  <span className="text-xs font-bold text-slate-400">{label}</span>
                </div>
                <p className="text-xs font-medium text-slate-500">{title}</p>
                <h4 className="text-3xl font-bold text-[#001e40]">{value}</h4>
              </article>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex h-[400px] flex-col rounded-xl bg-white p-8 shadow-sm lg:col-span-2">
              <div className="mb-8 flex items-center justify-between">
                <h5 className="text-sm font-bold uppercase tracking-wider text-[#001e40]">Progreso Académico Anual</h5>
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#001e40]" /><span className="text-xs font-medium text-slate-500">Promedio Clase</span></div>
              </div>
              <div className="relative flex-1">
                <div className="absolute inset-0 flex items-end justify-between px-2">
                  {["Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep"].map((m, i) => (
                    <div key={m} className="relative w-px bg-slate-100" style={{ height: `${[40, 50, 45, 65, 75, 70, 85][i]}%` }}>
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400">{m}</span>
                    </div>
                  ))}
                </div>
                <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 800 300">
                  <path d="M0,180 Q100,150 200,165 T400,105 T600,75 T800,45" fill="none" stroke="#001e40" strokeLinecap="round" strokeWidth="4" />
                  <path d="M0,180 Q100,150 200,165 T400,105 T600,75 T800,45 L800,300 L0,300 Z" fill="#001e40" opacity="0.08" />
                </svg>
              </div>
            </div>

            <div className="flex h-[400px] flex-col rounded-xl bg-[#001e40] p-8 text-white shadow-sm">
              <h5 className="text-sm font-bold uppercase tracking-wider text-blue-100">Asistencia por Semana</h5>
              <p className="mt-2 text-2xl font-bold">94.2% Total</p>
              <div className="flex flex-1 items-end justify-between gap-2 px-4 pb-4">
                {[90, 95, 85, 92].map((h, i) => (
                  <div key={i} className="flex w-full flex-col items-center gap-2">
                    <div className="relative h-[80%] w-full rounded-t-lg bg-blue-400/20">
                      <div className="absolute bottom-0 w-full rounded-t-lg bg-white transition-all hover:bg-yellow-400" style={{ height: `${h}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-blue-100">S{i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-sm opacity-80"><span>Meta Institucional</span><span className="font-bold">95.0%</span></div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h5 className="text-2xl font-semibold text-[#001e40]">Listado de Estudiantes</h5>
                <p className="text-sm text-slate-500">Sección 5to de Primaria - Aula A</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input className="rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#001e40] focus:ring-2 focus:ring-[#001e40]" placeholder="Buscar estudiante..." />
                </div>
                <button className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><Filter size={20} /></button>
              </div>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-4">Código</th><th className="px-6 py-4">Nombre completo</th><th className="px-6 py-4">Estado de asistencia</th><th className="px-6 py-4">Promedio</th><th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.code} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{s.code}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${s.tone === "red" ? "bg-red-100 text-red-700" : s.tone === "yellow" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-900"}`}>{s.initials}</div>
                        <span className="text-sm font-semibold text-slate-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><AttendanceBadge value={s.attendance} /></td>
                    <td className="px-6 py-4"><span className="font-bold text-slate-900">{s.avg}</span></td>
                    <td className="space-x-2 px-6 py-4 text-right">
                      <button className="text-xs font-bold uppercase text-[#001e40] hover:underline">Ver perfil</button>
                      <button className="text-slate-400 transition-colors hover:text-[#001e40]"><Edit size={17} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-4 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>Mostrando 4 de 32 estudiantes</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((n) => <button key={n} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition-colors hover:bg-white">{n}</button>)}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
