"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import type { SystemConfig } from "@prisma/client";
import { Role } from "@prisma/client";
import { ForbiddenSection } from "@/components/layout/ForbiddenSection";
import { Button, Card, useToast } from "@/components/ui";
import { apiJson } from "@/lib/api-client";
import { buildAcademicPdfWithLogo } from "@/lib/pdf-export";

type TeacherRow = {
  id: string;
  firstName: string;
  lastName: string;
  assignedGrade: { name: string } | null;
  assignedSection: { name: string } | null;
};

type StudentRow = { id: string; grade: { name: string }; section: { name: string } };

export default function GradosSeccionesPage() {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.allSettled([
        apiJson<TeacherRow[]>("/api/admin/teachers"),
        apiJson<StudentRow[]>("/api/students"),
      ]);
      setTeachers(tRes.status === "fulfilled" ? tRes.value : []);
      setStudents(sRes.status === "fulfilled" ? sRes.value : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.role === Role.ADMIN) void loadData();
  }, [session?.user?.role, loadData]);

  async function handleRefresh() {
    await loadData();
    toast("Datos actualizados.", "success");
  }

  const groups = useMemo(() => {
    const map = new Map<string, { teachers: number; students: number }>();
    for (const teacher of teachers) {
      const g = teacher.assignedGrade?.name ?? "—";
      const sec = teacher.assignedSection?.name ?? "—";
      const key = `${g} — ${sec}`;
      const cur = map.get(key) ?? { teachers: 0, students: 0 };
      cur.teachers += 1;
      map.set(key, cur);
    }
    for (const st of students) {
      const key = `${st.grade.name} — ${st.section.name}`;
      const cur = map.get(key) ?? { teachers: 0, students: 0 };
      cur.students += 1;
      map.set(key, cur);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [teachers, students]);

  async function exportPdf() {
    try {
      const config = await apiJson<SystemConfig | null>("/api/system-config").catch(() => null);
      const doc = await buildAcademicPdfWithLogo({
        config,
        title: "Grados y secciones — resumen",
        subtitle: "Docentes asignados y matrícula por aula",
        teacherName: session?.user?.name ?? session?.user?.email ?? "Administración",
        gradeSection: "Institución",
        columns: [
          { header: "Grado y sección", dataKey: "g" },
          { header: "Docentes", dataKey: "t" },
          { header: "Estudiantes", dataKey: "s" },
        ],
        rows: groups.map(([label, c]) => ({ g: label, t: c.teachers, s: c.students })),
      });
      doc.save("grados-secciones-resumen.pdf");
      toast("PDF generado correctamente.", "success");
    } catch {
      toast("No se pudo generar el PDF.", "error");
    }
  }

  if (status === "loading") {
    return (
      <Card className="p-6">
        <p className="text-sm text-secondary">Cargando…</p>
      </Card>
    );
  }

  if (session?.user?.role !== Role.ADMIN) {
    return <ForbiddenSection />;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-primary">Grados y Secciones</h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" className="cursor-pointer text-sm" disabled={loading} onClick={() => void handleRefresh()}>
            {loading ? "Actualizando…" : "Actualizar datos"}
          </Button>
          <Button type="button" variant="primary" className="cursor-pointer text-sm" onClick={() => void exportPdf()} disabled={groups.length === 0}>
            Exportar PDF
          </Button>
        </div>
      </div>
      <Card className="overflow-auto">
        {loading ? (
          <p className="text-sm text-secondary">Cargando…</p>
        ) : (
          <table className="min-w-full text-left text-sm text-foreground/90">
            <thead className="border-b border-secondary/30 bg-secondary text-sm font-semibold text-white">
              <tr>
                <th className="px-3 py-2">Grado y sección</th>
                <th className="px-3 py-2">Docentes asignados</th>
                <th className="px-3 py-2">Estudiantes</th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(even)]:bg-primary/[0.03]">
              {groups.map(([group, counts]) => (
                <tr key={group} className="border-b border-secondary/10 transition-colors hover:bg-cream/50">
                  <td className="px-3 py-2 text-foreground">{group}</td>
                  <td className="px-3 py-2">{counts.teachers}</td>
                  <td className="px-3 py-2">{counts.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </section>
  );
}
