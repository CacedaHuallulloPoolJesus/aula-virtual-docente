"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AttendanceStatus, Role, StudentStatus } from "@prisma/client";
import { Button, Card } from "@/components/ui";
import { apiJson } from "@/lib/api-client";

type ApiStudent = { id: string; code: string; firstName: string; lastName: string; grade: { name: string }; section: { name: string }; status: StudentStatus };
type ApiAttendance = { id: string; date: string; status: AttendanceStatus; student: { firstName: string; lastName: string } };
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
    { key: "attendance", title: "Reporte de asistencia", value: attendance.length, subtitle: "Registros en base de datos" },
    { key: "grades", title: "Reporte de notas", value: grades.length, subtitle: "Registros de evaluación" },
    { key: "risk", title: "Estudiantes en riesgo", value: riskCount, subtitle: "Promedio menor a 11 (por estudiante)" },
    { key: "sessions", title: "Sesiones generadas", value: sessions.length, subtitle: "Manuales + IA" },
  ];

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold text-slate-900">Módulo de reportes</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportCards.map((report) => (
          <Card key={report.title} className="bg-white">
            <p className="text-sm text-slate-600">{report.title}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{report.value}</p>
            <p className="text-xs text-slate-600">{report.subtitle}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => setModal(report.key)}>
                Ver reporte
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <Card className="max-h-[85vh] w-full max-w-3xl overflow-auto p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-slate-900">Detalle</h3>
              <Button variant="secondary" className="text-xs" onClick={() => setModal(null)}>
                Cerrar
              </Button>
            </div>
            {modal === "students" && (
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-1">Código</th>
                    <th className="py-1">Estudiante</th>
                    <th className="py-1">Grado</th>
                    <th className="py-1">Sección</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100">
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
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-1">Fecha</th>
                    <th className="py-1">Estudiante</th>
                    <th className="py-1">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.slice(0, 200).map((a) => (
                    <tr key={a.id} className="border-b border-slate-100">
                      <td className="py-1">{new Date(a.date).toLocaleDateString("es-PE")}</td>
                      <td className="py-1">
                        {a.student.firstName} {a.student.lastName}
                      </td>
                      <td className="py-1">{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {modal === "grades" && (
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-1">Estudiante</th>
                    <th className="py-1">Área</th>
                    <th className="py-1">Periodo</th>
                    <th className="py-1">Prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.slice(0, 200).map((g) => {
                    const stu = students.find((s) => s.id === g.studentId);
                    return (
                      <tr key={g.id} className="border-b border-slate-100">
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
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
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
              <ul className="space-y-2 text-sm text-slate-700">
                {sessions.map((s) => (
                  <li key={s.id}>
                    <strong>{s.title}</strong> ({s.area}) — {s.generatedByIa ? "IA" : "Manual"} — {new Date(s.date).toLocaleDateString("es-PE")}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      <Card>
        <h3 className="mb-2 font-semibold text-slate-900">Resumen académico para sustentación</h3>
        <p className="text-sm text-slate-600">
          Indicadores calculados desde PostgreSQL. Los datos respetan el alcance del rol ({session?.user?.role === Role.ADMIN ? "toda la institución" : "su aula asignada"}).
        </p>
      </Card>
    </section>
  );
}
