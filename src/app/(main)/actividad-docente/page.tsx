"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { ForbiddenSection } from "@/components/layout/ForbiddenSection";
import { Card } from "@/components/ui";
import { apiJson } from "@/lib/api-client";

type Row = {
  id: string;
  fullName: string;
  email: string;
  lastLogin: string | null;
  studentsRegistered: number;
  attendancesRecorded: number;
  gradesRecorded: number;
  sessionsCreated: number;
  sessionsIa: number;
  activitySummary: string | null;
};

export default function ActividadDocentePage() {
  const { data: session } = useSession();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson<Row[]>("/api/admin/teacher-activity");
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.role === Role.ADMIN) void load();
  }, [session?.user?.role, load]);

  if (session?.user?.role !== Role.ADMIN) {
    return <ForbiddenSection />;
  }

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold text-primary">Actividad docente</h2>
      <p className="text-sm text-foreground/75">
        Resumen calculado desde registros del sistema. El último inicio de sesión no está registrado de forma explícita; se muestra “—”.
      </p>
      <Card className="overflow-auto">
        {loading ? (
          <p className="p-4 text-sm text-secondary">Cargando…</p>
        ) : (
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="border-b border-secondary/30 bg-secondary text-sm font-semibold text-white">
              <tr>
                <th className="px-3 py-2">Docente</th>
                <th className="px-3 py-2">Último inicio de sesión</th>
                <th className="px-3 py-2">Estudiantes (aula)</th>
                <th className="px-3 py-2">Asistencias</th>
                <th className="px-3 py-2">Notas</th>
                <th className="px-3 py-2">Sesiones</th>
                <th className="px-3 py-2">Sesiones / IA</th>
                <th className="px-3 py-2">Observación</th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(even)]:bg-primary/[0.03]">
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-secondary/10">
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {r.fullName}
                    <br />
                    <span className="text-xs font-normal text-secondary">{r.email}</span>
                  </td>
                  <td className="px-3 py-2">—</td>
                  <td className="px-3 py-2">{r.studentsRegistered}</td>
                  <td className="px-3 py-2">{r.attendancesRecorded}</td>
                  <td className="px-3 py-2">{r.gradesRecorded}</td>
                  <td className="px-3 py-2">{r.sessionsCreated}</td>
                  <td className="px-3 py-2">{r.sessionsIa}</td>
                  <td className="px-3 py-2 text-xs text-foreground/70">{r.activitySummary ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </section>
  );
}
