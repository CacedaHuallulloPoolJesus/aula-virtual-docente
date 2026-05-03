"use client";

import Link from "next/link";
import { AlertTriangle, Bot, BookOpen, GraduationCap, TrendingUp, UserCheck, Users } from "lucide-react";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { Card } from "@/components/ui";
import { useAppData } from "@/components/providers/AppDataProvider";

export default function DashboardPage() {
  const { data, auth } = useAppData();
  const teacher = data.teachers.find((t) => t.id === auth.user?.teacherId);
  const scopedStudents =
    auth.user?.role === "ADMIN"
      ? data.students
      : data.students.filter((s) => s.grade === teacher?.grade && s.section === teacher?.section);
  const scopedAttendance =
    auth.user?.role === "ADMIN"
      ? data.attendance
      : data.attendance.filter((a) => a.teacherId === auth.user?.teacherId);
  const scopedGrades =
    auth.user?.role === "ADMIN"
      ? data.grades
      : data.grades.filter((g) => scopedStudents.some((s) => s.id === g.studentId));

  const avg =
    scopedGrades.length > 0
      ? scopedGrades.reduce((acc, item) => acc + (item.note1 + item.note2 + item.note3) / 3, 0) / scopedGrades.length
      : 0;
  const risk = scopedGrades.filter((g) => (g.note1 + g.note2 + g.note3) / 3 < 11).length;
  const faltas = scopedAttendance.filter((item) => item.status === "FALTA").length;
  const asistenciaPct = scopedAttendance.length
    ? (scopedAttendance.filter((item) => item.status === "PRESENTE").length / scopedAttendance.length) * 100
    : 0;

  const cards = [
    { title: "Total estudiantes", value: scopedStudents.length, color: "text-blue-700 bg-blue-50", icon: Users },
    { title: "Docentes registrados", value: data.teachers.length, color: "text-indigo-700 bg-indigo-50", icon: GraduationCap },
    { title: "Promedio general", value: avg.toFixed(1), color: "text-emerald-700 bg-emerald-50", icon: TrendingUp },
    { title: "Asistencia mensual", value: `${asistenciaPct.toFixed(1)}%`, color: "text-green-700 bg-green-50", icon: UserCheck },
    { title: "Estudiantes en riesgo", value: risk, color: "text-rose-700 bg-rose-50", icon: AlertTriangle },
    { title: "Sesiones generadas IA", value: data.sessions.filter((s) => s.generatedByIa).length, color: "text-purple-700 bg-purple-50", icon: Bot },
    { title: "Sesiones manuales", value: data.sessions.filter((s) => !s.generatedByIa).length, color: "text-slate-700 bg-slate-100", icon: BookOpen },
    { title: "Faltas registradas", value: faltas, color: "text-amber-700 bg-amber-50", icon: AlertTriangle },
  ];

  const performanceChart = [
    { month: "Bim I", promedio: Number((avg * 0.9).toFixed(1)) },
    { month: "Bim II", promedio: Number((avg * 0.96).toFixed(1)) },
    { month: "Bim III", promedio: Number((avg * 1.01).toFixed(1)) },
    { month: "Bim IV", promedio: Number(avg.toFixed(1)) },
  ];
  const attendanceChart = [
    { week: "S1", porcentaje: Number((asistenciaPct * 0.95).toFixed(1)) },
    { week: "S2", porcentaje: Number((asistenciaPct * 0.98).toFixed(1)) },
    { week: "S3", porcentaje: Number((asistenciaPct * 1.01).toFixed(1)) },
    { week: "S4", porcentaje: Number(asistenciaPct.toFixed(1)) },
  ];

  const pendingSessions = Math.max(1, 4 - data.sessions.length);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard académico</h2>
        <p className="text-sm text-slate-600">Resumen general de indicadores pedagógicos y gestión docente.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            className={`${metric.color} rounded-2xl`}
          />
        ))}
      </div>

      <PerformanceChart performanceChart={performanceChart} attendanceChart={attendanceChart} />

      <div className="grid gap-4 lg:grid-cols-2">
        <AlertsPanel risk={risk} faltas={faltas} pendingSessions={pendingSessions} />
        <Card>
          <h3 className="mb-3 text-base font-semibold text-slate-900">Accesos rápidos</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-blue-50" href="/estudiantes">
              Nuevo estudiante
            </Link>
            <Link className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-emerald-50" href="/asistencia">
              Registrar asistencia
            </Link>
            <Link className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-amber-50" href="/notas">
              Registrar notas
            </Link>
            <Link className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-purple-50" href="/ia-sesiones">
              Generar sesión IA
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
