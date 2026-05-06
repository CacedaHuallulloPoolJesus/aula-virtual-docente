"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { AttendanceStatus, Role } from "@prisma/client";
import { Button, Card, Input, useToast } from "@/components/ui";
import { apiJson } from "@/lib/api-client";
import { buildAcademicPdfWithLogo } from "@/lib/pdf-export";
import type { SystemConfig } from "@prisma/client";

type ApiStudent = {
  id: string;
  firstName: string;
  lastName: string;
  grade: { name: string };
  section: { name: string };
  sectionId: string;
};

type ApiAttendance = {
  id: string;
  date: string;
  status: AttendanceStatus;
  justification: string | null;
  studentId: string;
  student: { firstName: string; lastName: string };
  teacher: { firstName: string; lastName: string };
};

type ApiTeacherRow = { id: string; firstName: string; lastName: string; user: { email: string } };

export default function AsistenciaPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const registerRef = useRef<HTMLDivElement>(null);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [history, setHistory] = useState<ApiAttendance[]>([]);
  const [teachers, setTeachers] = useState<ApiTeacherRow[]>([]);
  const [adminTeacherId, setAdminTeacherId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [grade, setGrade] = useState("ALL");
  const [section, setSection] = useState("ALL");
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});
  const [justificationMap, setJustificationMap] = useState<Record<string, string>>({});

  const loadStudents = useCallback(async () => {
    const list = await apiJson<ApiStudent[]>("/api/students");
    setStudents(list);
  }, []);

  const loadHistory = useCallback(async () => {
    const list = await apiJson<ApiAttendance[]>("/api/attendance");
    setHistory(list);
  }, []);

  useEffect(() => {
    void loadStudents();
    void loadHistory();
    if (role === Role.ADMIN) {
      apiJson<ApiTeacherRow[]>("/api/admin/teachers")
        .then((t) => {
          setTeachers(t);
          if (t[0]) setAdminTeacherId(t[0].id);
        })
        .catch(() => {});
    }
  }, [role, loadStudents, loadHistory]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => (grade === "ALL" || student.grade.name === grade) && (section === "ALL" || student.section.name === section));
  }, [students, grade, section]);

  function scrollToRegister() {
    registerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    toast("Registre el estado de cada estudiante y pulse «Guardar asistencia».", "info");
  }

  async function save() {
    const teacherId = role === Role.ADMIN ? adminTeacherId : session?.user?.teacherId;
    if (!teacherId) {
      toast(role === Role.ADMIN ? "Seleccione un docente." : "Solo los docentes registran asistencia.", "warning");
      return;
    }
    const records = filteredStudents.map((student) => ({
      studentId: student.id,
      sectionId: student.sectionId,
      date,
      status: statusMap[student.id] ?? AttendanceStatus.PRESENT,
      justification:
        (statusMap[student.id] ?? AttendanceStatus.PRESENT) === AttendanceStatus.JUSTIFIED ? justificationMap[student.id] ?? "" : undefined,
    }));
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records, ...(role === Role.ADMIN ? { teacherId } : {}) }),
      });
      if (!res.ok) {
        toast(await res.text(), "error");
        return;
      }
      await loadHistory();
      toast("Asistencia guardada correctamente.", "success");
    } catch {
      toast("Error al guardar la asistencia.", "error");
    }
  }

  function clear() {
    setStatusMap({});
    setJustificationMap({});
    toast("Selecciones limpiadas. Puede volver a marcar los estados.", "info");
  }

  async function exportAttendancePdf() {
    try {
      const config = await apiJson<SystemConfig | null>("/api/system-config").catch(() => null);
      const rows = history.slice(0, 80).map((item) => ({
        k: `${new Date(item.date).toLocaleDateString("es-PE")} — ${item.student.firstName} ${item.student.lastName}`,
        v: `${statusLabel(item.status)}${item.justification ? ` (${item.justification})` : ""}`,
      }));
      const gradeSection =
        session?.user?.assignedGradeName && session?.user?.assignedSectionName
          ? `${session.user.assignedGradeName} — ${session.user.assignedSectionName}`
          : role === Role.ADMIN
            ? "Institución"
            : "—";
      const doc = await buildAcademicPdfWithLogo({
        config,
        title: "Reporte de asistencia",
        subtitle: `Historial visible (${history.length} registros, mostrando ${rows.length})`,
        teacherName: session?.user?.name ?? session?.user?.email ?? "",
        gradeSection,
        columns: [
          { header: "Registro", dataKey: "k" },
          { header: "Detalle", dataKey: "v" },
        ],
        rows,
      });
      doc.save("asistencia-historial.pdf");
      toast("PDF generado correctamente.", "success");
    } catch {
      toast("No se pudo generar el PDF. Intente nuevamente.", "error");
    }
  }

  function badge(st: AttendanceStatus) {
    if (st === AttendanceStatus.PRESENT) return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80";
    if (st === AttendanceStatus.LATE) return "bg-accent/30 text-primary ring-1 ring-accent/45";
    if (st === AttendanceStatus.ABSENT) return "bg-danger/12 text-danger ring-1 ring-danger/25";
    return "bg-secondary/15 text-secondary ring-1 ring-secondary/25";
  }

  function statusLabel(st: AttendanceStatus) {
    if (st === AttendanceStatus.PRESENT) return "Presente";
    if (st === AttendanceStatus.LATE) return "Tarde";
    if (st === AttendanceStatus.ABSENT) return "Falta";
    return "Justificado";
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-primary">Registro de Asistencia</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" className="cursor-pointer text-sm" type="button" onClick={scrollToRegister}>
            Registrar asistencia
          </Button>
          <Button variant="secondary" className="cursor-pointer text-sm" type="button" onClick={() => void exportAttendancePdf()}>
            Exportar PDF
          </Button>
        </div>
      </div>
      <Card className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {role === Role.ADMIN && (
            <>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-600">Grado</span>
                <select
                  className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  <option value="ALL">Todos</option>
                  {[...new Set(students.map((s) => s.grade.name))].map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-600">Sección</span>
                <select
                  className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                >
                  <option value="ALL">Todas</option>
                  {[...new Set(students.map((s) => s.section.name))].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm md:col-span-3">
                <span className="mb-1 block font-medium text-slate-600">Docente que registra</span>
                <select
                  className="w-full max-w-md cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900"
                  value={adminTeacherId}
                  onChange={(e) => setAdminTeacherId(e.target.value)}
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.user.email})
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>
      </Card>

      <div ref={registerRef} className="scroll-mt-24">
        <Card className="overflow-auto">
        <h3 className="mb-2 text-base font-semibold text-primary">Registro del día</h3>
        <p className="mb-3 text-xs text-foreground/65">
          Seleccione Presente, Tarde, Falta o Justificado. Para Justificado, indique el motivo en el campo correspondiente.
        </p>
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="border-b border-secondary/30 bg-secondary text-sm font-semibold text-white">
            <tr>
              <th className="px-3 py-2">Estudiante</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Justificación</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-primary/[0.03]">
            {filteredStudents.map((student) => {
              const st = statusMap[student.id] ?? AttendanceStatus.PRESENT;
              return (
                <tr key={student.id} className="border-b border-secondary/10 transition-colors hover:bg-cream/50">
                  <td className="px-3 py-2 text-slate-900">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-900"
                      value={st}
                      onChange={(e) => setStatusMap((prev) => ({ ...prev, [student.id]: e.target.value as AttendanceStatus }))}
                    >
                      <option value={AttendanceStatus.PRESENT}>Presente</option>
                      <option value={AttendanceStatus.LATE}>Tarde</option>
                      <option value={AttendanceStatus.ABSENT}>Falta</option>
                      <option value={AttendanceStatus.JUSTIFIED}>Justificado</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    {st === AttendanceStatus.JUSTIFIED ? (
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
          <Button variant="success" className="cursor-pointer" type="button" onClick={() => void save()}>
            Guardar asistencia
          </Button>
          <Button variant="secondary" className="cursor-pointer" type="button" onClick={clear}>
            Limpiar
          </Button>
        </div>
        </Card>
      </div>

      <Card className="overflow-auto">
        <h3 className="mb-2 text-base font-semibold text-slate-900">Historial de asistencia</h3>
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="border-b border-secondary/30 bg-secondary text-sm font-semibold text-white">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Estudiante</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Justificación</th>
              <th className="px-3 py-2">Registrado por</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-primary/[0.03]">
            {history.map((item) => (
              <tr key={item.id} className="border-b border-secondary/10 transition-colors hover:bg-cream/50">
                <td className="px-3 py-2">{new Date(item.date).toLocaleDateString("es-PE")}</td>
                <td className="px-3 py-2">
                  {item.student.firstName} {item.student.lastName}
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${badge(item.status)}`}>{statusLabel(item.status)}</span>
                </td>
                <td className="px-3 py-2">{item.justification || "—"}</td>
                <td className="px-3 py-2">
                  {item.teacher.firstName} {item.teacher.lastName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
