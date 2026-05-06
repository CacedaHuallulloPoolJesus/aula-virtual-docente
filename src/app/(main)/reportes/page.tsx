"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AttendanceStatus, Role, StudentStatus } from "@prisma/client";
import type { SystemConfig } from "@prisma/client";
import * as XLSX from "xlsx";
import { Button, Card, useToast } from "@/components/ui";
import { apiJson } from "@/lib/api-client";
import { buildAcademicPdfWithLogo } from "@/lib/pdf-export";

type ApiStudent = { id: string; code: string; firstName: string; lastName: string; grade: { name: string }; section: { name: string }; status: StudentStatus };
type ApiAttendance = { id: string; date: string; status: AttendanceStatus; student: { firstName: string; lastName: string } };

function etiquetaEstadoAsistencia(status: AttendanceStatus): string {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return "Presente";
    case AttendanceStatus.LATE:
      return "Tarde";
    case AttendanceStatus.ABSENT:
      return "Falta";
    case AttendanceStatus.JUSTIFIED:
      return "Justificado";
    default:
      return String(status);
  }
}
type ApiGrade = { id: string; studentId: string; note1: number; note2: number; note3: number; area: string; course: { period: { name: string } } };
type ApiSession = { id: string; title: string; area: string; generatedByIa: boolean; date: string };

export default function ReportesPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [attendance, setAttendance] = useState<ApiAttendance[]>([]);
  const [grades, setGrades] = useState<ApiGrade[]>([]);
  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [modal, setModal] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [stu, att, gr, ses] = await Promise.all([
      apiJson<ApiStudent[]>("/api/students"),
      apiJson<ApiAttendance[]>("/api/attendance"),
      apiJson<ApiGrade[]>("/api/grades"),
      apiJson<ApiSession[]>("/api/sessions"),
    ]);
    setStudents(stu);
    setAttendance(att);
    setGrades(gr);
    setSessions(ses);
  }, []);

  useEffect(() => {
    void load().catch(() => {});
  }, [load]);

  const avg = (g: ApiGrade) => (g.note1 + g.note2 + g.note3) / 3;
  const riskCount = new Set(grades.filter((g) => avg(g) < 11).map((g) => g.studentId)).size;

  async function exportModalPdf() {
    if (!modal) return;
    try {
      const config = await apiJson<SystemConfig | null>("/api/system-config").catch(() => null);
      const titleMap: Record<string, string> = {
        students: "Reporte — Estudiantes",
        attendance: "Reporte — Asistencia",
        grades: "Reporte — Evaluaciones",
        risk: "Reporte — Estudiantes en riesgo",
        sessions: "Reporte — Sesiones",
      };
      let rows: Record<string, string | number>[] = [];
      let columns: { header: string; dataKey: string }[] = [];
      if (modal === "students") {
        columns = [
          { header: "Código", dataKey: "c" },
          { header: "Estudiante", dataKey: "n" },
          { header: "Grado", dataKey: "g" },
          { header: "Sección", dataKey: "s" },
        ];
        rows = students.map((s) => ({
          c: s.code,
          n: `${s.firstName} ${s.lastName}`,
          g: s.grade.name,
          s: s.section.name,
        }));
      } else if (modal === "attendance") {
        columns = [
          { header: "Fecha", dataKey: "d" },
          { header: "Estudiante", dataKey: "n" },
          { header: "Estado", dataKey: "e" },
        ];
        rows = attendance.slice(0, 200).map((a) => ({
          d: new Date(a.date).toLocaleDateString("es-PE"),
          n: `${a.student.firstName} ${a.student.lastName}`,
          e: etiquetaEstadoAsistencia(a.status),
        }));
      } else if (modal === "grades" || modal === "risk") {
        const list = modal === "risk" ? grades.filter((g) => avg(g) < 11) : grades.slice(0, 200);
        columns = [
          { header: "Estudiante", dataKey: "n" },
          { header: "Área", dataKey: "a" },
          { header: "Período", dataKey: "p" },
          { header: "Prom.", dataKey: "m" },
        ];
        rows = list.map((g) => {
          const stu = students.find((s) => s.id === g.studentId);
          return {
            n: stu ? `${stu.firstName} ${stu.lastName}` : g.studentId,
            a: g.area,
            p: g.course.period.name,
            m: avg(g).toFixed(1),
          };
        });
      } else {
        columns = [
          { header: "Título", dataKey: "t" },
          { header: "Área", dataKey: "a" },
          { header: "Tipo", dataKey: "y" },
          { header: "Fecha", dataKey: "d" },
        ];
        rows = sessions.map((s) => ({
          t: s.title,
          a: s.area,
          y: s.generatedByIa ? "IA" : "Manual",
          d: new Date(s.date).toLocaleDateString("es-PE"),
        }));
      }
      const gradeSection =
        session?.user?.assignedGradeName && session?.user?.assignedSectionName
          ? `${session.user.assignedGradeName} — ${session.user.assignedSectionName}`
          : session?.user?.role === Role.ADMIN
            ? "Institución"
            : "—";
      const doc = await buildAcademicPdfWithLogo({
        config,
        title: titleMap[modal] ?? "Reporte",
        subtitle: `Alcance: ${session?.user?.role === Role.ADMIN ? "Institución" : "Aula asignada"}`,
        teacherName: session?.user?.name ?? session?.user?.email ?? "",
        gradeSection,
        columns,
        rows,
      });
      doc.save(`reporte-${modal}.pdf`);
      toast("PDF generado correctamente.", "success");
    } catch {
      toast("No se pudo generar el PDF.", "error");
    }
  }

  function exportModalExcel() {
    if (!modal) return;
    try {
      let data: Record<string, string | number>[] = [];
      if (modal === "students") {
        data = students.map((s) => ({
          Código: s.code,
          Estudiante: `${s.firstName} ${s.lastName}`,
          Grado: s.grade.name,
          Sección: s.section.name,
        }));
      } else if (modal === "attendance") {
        data = attendance.slice(0, 500).map((a) => ({
          Fecha: new Date(a.date).toLocaleDateString("es-PE"),
          Estudiante: `${a.student.firstName} ${a.student.lastName}`,
          Estado: etiquetaEstadoAsistencia(a.status),
        }));
      } else if (modal === "grades") {
        data = grades.slice(0, 500).map((g) => {
          const stu = students.find((s) => s.id === g.studentId);
          return {
            Estudiante: stu ? `${stu.firstName} ${stu.lastName}` : g.studentId,
            Área: g.area,
            Período: g.course.period.name,
            Promedio: Number(avg(g).toFixed(2)),
          };
        });
      } else if (modal === "risk") {
        data = grades
          .filter((g) => avg(g) < 11)
          .map((g) => {
            const stu = students.find((s) => s.id === g.studentId);
            return {
              Estudiante: stu ? `${stu.firstName} ${stu.lastName}` : g.studentId,
              Área: g.area,
              Promedio: Number(avg(g).toFixed(2)),
            };
          });
      } else {
        data = sessions.map((s) => ({
          Título: s.title,
          Área: s.area,
          Tipo: s.generatedByIa ? "IA" : "Manual",
          Fecha: new Date(s.date).toLocaleDateString("es-PE"),
        }));
      }
      const sheet = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheet, "Reporte");
      XLSX.writeFile(wb, `reporte-${modal}.xlsx`);
      toast("Archivo Excel generado.", "success");
    } catch {
      toast("No se pudo generar el Excel.", "error");
    }
  }

  const reportCards = [
    { key: "students", title: "Estudiantes por grado/sección", value: students.length, subtitle: "Matrícula visible según su rol" },
    { key: "attendance", title: "Reporte de asistencia", value: attendance.length, subtitle: "Registros almacenados en el sistema" },
    { key: "grades", title: "Reporte de evaluaciones (notas)", value: grades.length, subtitle: "Registros de evaluación académica" },
    { key: "risk", title: "Estudiantes en riesgo", value: riskCount, subtitle: "Promedio menor a 11 (por estudiante)" },
    { key: "sessions", title: "Sesiones de aprendizaje registradas", value: sessions.length, subtitle: "Manuales y con inteligencia artificial" },
  ];

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold text-primary">Reportes Académicos</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportCards.map((report) => (
          <Card key={report.title} className="bg-white">
            <p className="text-sm text-foreground/70">{report.title}</p>
            <p className="mt-2 text-2xl font-bold text-primary">{report.value}</p>
            <p className="text-xs text-foreground/65">{report.subtitle}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" className="cursor-pointer px-2 py-1 text-xs" type="button" onClick={() => setModal(report.key)}>
                Ver reporte
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setModal(null)}
          onKeyDown={(e) => e.key === "Escape" && setModal(null)}
        >
          <Card
            className="max-h-[85vh] w-full max-w-3xl overflow-auto p-4 shadow-xl shadow-primary/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-secondary/10 pb-3">
              <h3 className="text-lg font-semibold text-primary">Detalle</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" className="cursor-pointer text-xs" type="button" onClick={() => void exportModalPdf()}>
                  Descargar PDF
                </Button>
                <Button variant="secondary" className="cursor-pointer text-xs" type="button" onClick={exportModalExcel}>
                  Exportar Excel
                </Button>
                <Button variant="secondary" className="cursor-pointer text-xs" type="button" onClick={() => setModal(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
            {modal === "students" && (
              <table className="min-w-full text-left text-sm text-foreground/90">
                <thead>
                  <tr className="border-b border-secondary/25 bg-secondary text-white">
                    <th className="px-2 py-2">Código</th>
                    <th className="px-2 py-2">Estudiante</th>
                    <th className="px-2 py-2">Grado</th>
                    <th className="px-2 py-2">Sección</th>
                  </tr>
                </thead>
                <tbody className="[&>tr:nth-child(even)]:bg-primary/[0.03]">
                  {students.map((s) => (
                    <tr key={s.id} className="border-b border-secondary/10 transition-colors hover:bg-cream/50">
                      <td className="py-1">{s.code}</td>
                      <td className="py-1">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="py-1">{s.grade.name}</td>
                      <td className="py-1">{s.section.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {modal === "attendance" && (
              <table className="min-w-full text-left text-sm text-foreground/90">
                <thead>
                  <tr className="border-b border-secondary/25 bg-secondary text-white">
                    <th className="px-2 py-2">Fecha</th>
                    <th className="px-2 py-2">Estudiante</th>
                    <th className="px-2 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody className="[&>tr:nth-child(even)]:bg-primary/[0.03]">
                  {attendance.slice(0, 200).map((a) => (
                    <tr key={a.id} className="border-b border-secondary/10 transition-colors hover:bg-cream/50">
                      <td className="py-1">{new Date(a.date).toLocaleDateString("es-PE")}</td>
                      <td className="py-1">
                        {a.student.firstName} {a.student.lastName}
                      </td>
                      <td className="py-1">{etiquetaEstadoAsistencia(a.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {modal === "grades" && (
              <table className="min-w-full text-left text-sm text-foreground/90">
                <thead>
                  <tr className="border-b border-secondary/25 bg-secondary text-white">
                    <th className="px-2 py-2">Estudiante</th>
                    <th className="px-2 py-2">Área</th>
                    <th className="px-2 py-2">Período</th>
                    <th className="px-2 py-2">Prom.</th>
                  </tr>
                </thead>
                <tbody className="[&>tr:nth-child(even)]:bg-primary/[0.03]">
                  {grades.slice(0, 200).map((g) => {
                    const stu = students.find((s) => s.id === g.studentId);
                    return (
                      <tr key={g.id} className="border-b border-secondary/10 transition-colors hover:bg-cream/50">
                        <td className="py-1">{stu ? `${stu.firstName} ${stu.lastName}` : g.studentId}</td>
                        <td className="py-1">{g.area}</td>
                        <td className="py-1">{g.course.period.name}</td>
                        <td className="py-1">{avg(g).toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {modal === "risk" && (
              <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/85">
                {grades
                  .filter((g) => avg(g) < 11)
                  .map((g) => {
                    const stu = students.find((s) => s.id === g.studentId);
                    return (
                      <li key={`${g.studentId}-${g.area}`}>
                        {stu ? `${stu.firstName} ${stu.lastName}` : g.studentId} — {g.area}: {avg(g).toFixed(1)}
                      </li>
                    );
                  })}
              </ul>
            )}
            {modal === "sessions" && (
              <ul className="space-y-2 text-sm text-foreground/85">
                {sessions.map((s) => (
                  <li key={s.id}>
                    <strong>{s.title}</strong> ({s.area}) — {s.generatedByIa ? "Con IA" : "Manual"} — {new Date(s.date).toLocaleDateString("es-PE")}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      <Card>
        <h3 className="mb-2 font-semibold text-primary">Resumen académico</h3>
        <p className="text-sm text-foreground/70">
          Indicadores calculados a partir de la base de datos. Los datos respetan el alcance de su perfil ({session?.user?.role === Role.ADMIN ? "toda la institución" : "su aula asignada"}).
        </p>
      </Card>
    </section>
  );
}
