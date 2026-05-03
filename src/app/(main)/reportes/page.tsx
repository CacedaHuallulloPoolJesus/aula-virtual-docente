"use client";

import { Button, Card } from "@/components/ui";
import { useAppData } from "@/components/providers/AppDataProvider";

export default function ReportesPage() {
  const { data, auth } = useAppData();
  const teacher = data.teachers.find((t) => t.id === auth.user?.teacherId);
  const students =
    auth.user?.role === "ADMIN"
      ? data.students
      : data.students.filter((s) => s.grade === teacher?.grade && s.section === teacher?.section);
  const attendance =
    auth.user?.role === "ADMIN"
      ? data.attendance
      : data.attendance.filter((item) => item.teacherId === auth.user?.teacherId);
  const grades =
    auth.user?.role === "ADMIN"
      ? data.grades
      : data.grades.filter((g) => students.some((s) => s.id === g.studentId));
  const sessions = auth.user?.role === "ADMIN" ? data.sessions : data.sessions.filter((s) => s.teacherId === auth.user?.teacherId);
  const riskStudents = grades.filter((record) => (record.note1 + record.note2 + record.note3) / 3 < 11).length;

  const reportCards = [
    { title: "Estudiantes por grado/sección", value: students.length, subtitle: "Consolidado por aula" },
    { title: "Reporte de asistencia", value: attendance.length, subtitle: "Registros totales" },
    { title: "Reporte de notas", value: grades.length, subtitle: "Evaluaciones cargadas" },
    { title: "Estudiantes en riesgo", value: riskStudents, subtitle: "Bajo rendimiento" },
    { title: "Sesiones generadas", value: sessions.length, subtitle: "Manuales + IA" },
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
              <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => alert(`Vista previa: ${report.title}`)}>Ver reporte</Button>
              <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => alert("Descarga PDF preparada.")}>Descargar PDF</Button>
              <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => alert("Exportación Excel preparada.")}>Exportar Excel</Button>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <h3 className="mb-2 font-semibold text-slate-900">Resumen académico para sustentación</h3>
        <p className="text-sm text-slate-600">
          Este módulo concentra indicadores críticos de desempeño, asistencia y riesgo académico, facilitando la toma
          de decisiones pedagógicas basada en evidencia.
        </p>
      </Card>
    </section>
  );
}
