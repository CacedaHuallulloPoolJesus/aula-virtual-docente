"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AttendanceStatus, Role, StudentStatus } from "@prisma/client";
import { Button, Card } from "@/components/ui";
import { apiJson } from "@/lib/api-client";

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
              <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => setModal(report.key)}>
                Ver reporte
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <Card className="max-h-[85vh] w-full max-w-3xl overflow-auto p-4 shadow-xl shadow-primary/15">
            <div className="mb-3 flex items-center justify-between gap-2 border-b border-secondary/10 pb-3">
              <h3 className="text-lg font-semibold text-primary">Detalle</h3>
              <Button variant="secondary" className="text-xs" onClick={() => setModal(null)}>
                Cerrar
              </Button>
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
