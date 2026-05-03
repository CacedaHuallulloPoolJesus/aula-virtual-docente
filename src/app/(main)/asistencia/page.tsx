"use client";

import { useMemo, useState } from "react";
import { Button, Card, Input } from "@/components/ui";
import { AttendanceStatus } from "@/lib/mock-data";
import { useAppData } from "@/components/providers/AppDataProvider";

export default function AsistenciaPage() {
  const { data, auth, saveAttendanceBatch } = useAppData();
  const teacher = data.teachers.find((t) => t.id === auth.user?.teacherId);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [grade, setGrade] = useState("ALL");
  const [section, setSection] = useState("ALL");
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});
  const [justificationMap, setJustificationMap] = useState<Record<string, string>>({});

  const filteredStudents = useMemo(() => {
    const base =
      auth.user?.role === "ADMIN"
        ? data.students
        : data.students.filter((s) => s.grade === teacher?.grade && s.section === teacher?.section);
    return base.filter((student) => (grade === "ALL" || student.grade === grade) && (section === "ALL" || student.section === section));
  }, [data.students, auth.user?.role, teacher?.grade, teacher?.section, grade, section]);

  function save() {
    if (!auth.user) return;
    const registradorId = auth.user.teacherId ?? "admin";
    const records = filteredStudents.map((student) => ({
      id: crypto.randomUUID(),
      date,
      studentId: student.id,
      status: statusMap[student.id] ?? "PRESENTE",
      justification: (statusMap[student.id] ?? "PRESENTE") === "JUSTIFICADO" ? justificationMap[student.id] ?? "" : "",
      teacherId: registradorId,
    }));
    saveAttendanceBatch(records);
    alert("Asistencia guardada correctamente.");
  }

  function clear() {
    setStatusMap({});
    setJustificationMap({});
  }

  function badge(status: AttendanceStatus) {
    if (status === "PRESENTE") return "bg-emerald-100 text-emerald-700";
    if (status === "TARDE") return "bg-amber-100 text-amber-700";
    if (status === "FALTA") return "bg-rose-100 text-rose-700";
    return "bg-blue-100 text-blue-700";
  }

  const visibleHistory =
    auth.user?.role === "ADMIN"
      ? data.attendance
      : data.attendance.filter((item) => item.teacherId === auth.user?.teacherId);

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold text-slate-900">Módulo de asistencia</h2>
      <Card className="space-y-3 border-emerald-100">
        <div className="grid gap-3 md:grid-cols-3">
          <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {auth.user?.role === "ADMIN" && (
            <>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-600">Grado</span>
                <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900" value={grade} onChange={(e) => setGrade(e.target.value)}>
                  <option value="ALL">Todos</option>
                  {[...new Set(data.students.map((s) => s.grade))].map((g) => <option key={g}>{g}</option>)}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-600">Sección</span>
                <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900" value={section} onChange={(e) => setSection(e.target.value)}>
                  <option value="ALL">Todas</option>
                  {[...new Set(data.students.map((s) => s.section))].map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </>
          )}
        </div>
      </Card>

      <Card className="overflow-auto border-emerald-100">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-800 font-semibold">
            <tr>
              <th className="px-3 py-2">Estudiante</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Justificación</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => {
              const status = statusMap[student.id] ?? "PRESENTE";
              return (
                <tr key={student.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-900">{student.firstName} {student.lastName}</td>
                  <td className="px-3 py-2">
                    <select
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-900"
                      value={status}
                      onChange={(e) => setStatusMap((prev) => ({ ...prev, [student.id]: e.target.value as AttendanceStatus }))}
                    >
                      <option value="PRESENTE">Presente</option>
                      <option value="TARDE">Tarde</option>
                      <option value="FALTA">Falta</option>
                      <option value="JUSTIFICADO">Justificado</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    {status === "JUSTIFICADO" ? (
                      <input
                        className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                        value={justificationMap[student.id] ?? ""}
                        onChange={(e) => setJustificationMap((prev) => ({ ...prev, [student.id]: e.target.value }))}
                        placeholder="Ej: Cita médica"
                      />
                    ) : (
                      <span className="text-slate-500">No aplica</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="success" onClick={save}>Guardar asistencia</Button>
          <Button variant="secondary" onClick={clear}>Limpiar</Button>
          <Button variant="secondary" onClick={() => alert("Exportación preparada para PDF/Excel.")}>Exportar reporte</Button>
        </div>
      </Card>

      <Card className="overflow-auto">
        <h3 className="mb-2 text-base font-semibold text-slate-900">Historial de asistencia</h3>
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-800 font-semibold">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Estudiante</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Justificación</th>
              <th className="px-3 py-2">Registrado por</th>
            </tr>
          </thead>
          <tbody>
            {visibleHistory.map((item) => {
              const student = data.students.find((s) => s.id === item.studentId);
              const teacherInfo = data.teachers.find((t) => t.id === item.teacherId);
              return (
              <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-3 py-2">{item.date}</td>
                <td className="px-3 py-2">{student?.firstName} {student?.lastName}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${badge(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-3 py-2">{item.justification || "-"}</td>
                <td className="px-3 py-2">{teacherInfo ? `${teacherInfo.firstName} ${teacherInfo.lastName}` : "Admin"}</td>
              </tr>
            )})}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
