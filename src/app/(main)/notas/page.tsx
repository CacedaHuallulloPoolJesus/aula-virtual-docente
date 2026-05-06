"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import type { SystemConfig } from "@prisma/client";
import * as XLSX from "xlsx";
import { GradesForm } from "@/components/forms/GradesForm";
import type { GradeRow } from "@/types/grades";
import { areas } from "@/constants/academic";
import { apiJson } from "@/lib/api-client";
import { buildAcademicPdfWithLogo } from "@/lib/pdf-export";
import { Modal, useToast } from "@/components/ui";

type ApiStudent = {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  gradeId: string;
  sectionId: string;
};

type ApiGradeRow = {
  id: string;
  studentId: string;
  area: string;
  note1: number;
  note2: number;
  note3: number;
  course: { periodId: string; period: { name: string } };
};

type Period = { id: string; name: string };
type ApiTeacherRow = { id: string; firstName: string; lastName: string; user: { email: string } };

export default function NotasPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [gradesApi, setGradesApi] = useState<ApiGradeRow[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [teachers, setTeachers] = useState<ApiTeacherRow[]>([]);
  const [adminTeacherId, setAdminTeacherId] = useState("");
  const [area, setArea] = useState(areas[0]);
  const [periodId, setPeriodId] = useState("");
  const [draft, setDraft] = useState<Record<string, { note1: number; note2: number; note3: number }>>({});
  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);

  const loadGrades = useCallback(async (pid: string) => {
    if (!pid) return;
    const g = await apiJson<ApiGradeRow[]>(`/api/grades?periodId=${encodeURIComponent(pid)}`);
    setGradesApi(g);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [stu, cat] = await Promise.all([
          apiJson<ApiStudent[]>("/api/students"),
          apiJson<{ periods: Period[]; teachers: ApiTeacherRow[] | null }>("/api/catalogs"),
        ]);
        setStudents(stu);
        setPeriods(cat.periods);
        const firstP = cat.periods[0]?.id ?? "";
        setPeriodId(firstP);
        if (role === Role.ADMIN && cat.teachers?.length) {
          setTeachers(cat.teachers);
          setAdminTeacherId(cat.teachers[0].id);
        }
        if (firstP) await loadGrades(firstP);
      } catch {
        setStudents([]);
      }
    })();
  }, [role, loadGrades]);

  useEffect(() => {
    void loadGrades(periodId);
  }, [periodId, loadGrades]);

  const currentRows: GradeRow[] = useMemo(
    () =>
      students.map((student) => {
        const existing = gradesApi.find((g) => g.studentId === student.id && g.course.periodId === periodId && g.area === area);
        const values = draft[student.id] ?? (existing ? { note1: existing.note1, note2: existing.note2, note3: existing.note3 } : { note1: 0, note2: 0, note3: 0 });
        const promedio = (values.note1 + values.note2 + values.note3) / 3;
        const nivel = promedio >= 18 ? "AD" : promedio >= 14 ? "A" : promedio >= 11 ? "B" : "C";
        return {
          student: {
            id: student.id,
            code: student.code,
            firstName: student.firstName,
            lastName: student.lastName,
            gradeId: student.gradeId,
            sectionId: student.sectionId,
          },
          values,
          promedio,
          nivel,
          riesgo: promedio < 11,
        };
      }),
    [students, gradesApi, area, periodId, draft],
  );

  function updateNote(studentId: string, key: "note1" | "note2" | "note3", value: number) {
    setDraft((prev) => ({ ...prev, [studentId]: { ...(prev[studentId] || { note1: 0, note2: 0, note3: 0 }), [key]: value } }));
  }

  async function save() {
    const teacherId = role === Role.ADMIN ? adminTeacherId : session?.user?.teacherId;
    if (!teacherId) {
      toast(role === Role.ADMIN ? "Seleccione docente." : "Sin perfil docente.", "warning");
      return;
    }
    if (!periodId) {
      toast("No hay períodos académicos configurados.", "warning");
      return;
    }
    try {
      for (const row of currentRows) {
        await apiJson("/api/grades", {
          method: "POST",
          body: JSON.stringify({
            studentId: row.student.id,
            gradeId: row.student.gradeId,
            sectionId: row.student.sectionId,
            periodId,
            area,
            note1: row.values.note1,
            note2: row.values.note2,
            note3: row.values.note3,
            ...(role === Role.ADMIN ? { teacherId } : {}),
          }),
        });
      }
      setDraft({});
      await loadGrades(periodId);
      toast("Notas guardadas correctamente.", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error al guardar", "error");
    }
  }

  async function exportPdf() {
    try {
      const config = await apiJson<SystemConfig | null>("/api/system-config").catch(() => null);
      const periodName = periods.find((p) => p.id === periodId)?.name ?? periodId;
      const gradeSection =
        session?.user?.assignedGradeName && session?.user?.assignedSectionName
          ? `${session.user.assignedGradeName} — ${session.user.assignedSectionName}`
          : role === Role.ADMIN
            ? "Institución"
            : "—";
      const doc = await buildAcademicPdfWithLogo({
        config,
        title: `Reporte de notas — ${area}`,
        subtitle: `Período: ${periodName}`,
        teacherName: session?.user?.name ?? session?.user?.email ?? "",
        gradeSection,
        columns: [
          { header: "Código", dataKey: "code" },
          { header: "Estudiante", dataKey: "name" },
          { header: "N1", dataKey: "n1" },
          { header: "N2", dataKey: "n2" },
          { header: "N3", dataKey: "n3" },
          { header: "Prom.", dataKey: "prom" },
        ],
        rows: currentRows.map((r) => ({
          code: r.student.code,
          name: `${r.student.firstName} ${r.student.lastName}`,
          n1: r.values.note1,
          n2: r.values.note2,
          n3: r.values.note3,
          prom: r.promedio.toFixed(1),
        })),
      });
      doc.save(`notas-${area.replace(/\s+/g, "-")}.pdf`);
      toast("PDF generado correctamente.", "success");
    } catch {
      toast("No se pudo generar el PDF.", "error");
    }
  }

  function exportExcel() {
    try {
      const sheet = XLSX.utils.json_to_sheet(
        currentRows.map((r) => ({
          Código: r.student.code,
          Estudiante: `${r.student.firstName} ${r.student.lastName}`,
          "Nota 1": r.values.note1,
          "Nota 2": r.values.note2,
          "Nota 3": r.values.note3,
          Promedio: Number(r.promedio.toFixed(2)),
          Nivel: r.nivel,
          Riesgo: r.riesgo ? "Sí" : "No",
        })),
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheet, "Notas");
      XLSX.writeFile(wb, `notas-${area.slice(0, 20).replace(/\s+/g, "-")}.xlsx`);
      toast("Archivo Excel generado.", "success");
    } catch {
      toast("No se pudo generar el Excel.", "error");
    }
  }

  const detailStudent = students.find((s) => s.id === detailStudentId);
  const detailGrades = gradesApi.filter((g) => g.studentId === detailStudentId);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-primary">Evaluación de Notas</h2>
        <button
          type="button"
          className="cursor-pointer rounded-xl border-2 border-primary bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-cream/50"
          onClick={() => {
            document.querySelector("table")?.scrollIntoView({ behavior: "smooth", block: "start" });
            toast("Edite las notas en la tabla y use «Guardar notas».", "info");
          }}
        >
          Registrar notas
        </button>
      </div>
      {role === Role.ADMIN && teachers.length > 0 && (
        <div className="max-w-md rounded-xl border border-accent/35 bg-cream/50 p-3 text-sm text-foreground/90">
          <label className="block font-medium text-primary/85">Docente evaluador</label>
          <select
            className="mt-1 w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-2"
            value={adminTeacherId}
            onChange={(e) => setAdminTeacherId(e.target.value)}
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </select>
        </div>
      )}
      <GradesForm
        area={area}
        setArea={setArea}
        periodId={periodId}
        setPeriodId={setPeriodId}
        periodOptions={periods.map((p) => ({ id: p.id, name: p.name }))}
        rows={currentRows}
        onChangeNote={updateNote}
        onSave={() => void save()}
        onClearDraft={() => {
          setDraft({});
          toast("Borrador de notas descartado en pantalla.", "info");
        }}
        onExportPdf={() => void exportPdf()}
        onExportExcel={exportExcel}
        onViewDetail={(id) => setDetailStudentId(id)}
        onRecalculate={() => toast("Los promedios y niveles se actualizan automáticamente al editar las notas.", "info")}
      />

      <Modal
        open={detailStudentId !== null}
        title={detailStudent ? `Notas — ${detailStudent.firstName} ${detailStudent.lastName}` : "Detalle"}
        onClose={() => setDetailStudentId(null)}
        className="max-w-lg"
      >
        {detailStudent ? (
          <div className="space-y-3 text-sm">
            <p className="text-foreground/75">
              Código: <strong>{detailStudent.code}</strong>
            </p>
            {detailGrades.length === 0 ? (
              <p className="text-foreground/65">No hay registros de evaluación almacenados para este estudiante en el sistema (visible para su rol).</p>
            ) : (
              <table className="min-w-full text-left text-xs">
                <thead className="border-b border-secondary/25 bg-secondary/90 text-white">
                  <tr>
                    <th className="px-2 py-2">Área</th>
                    <th className="px-2 py-2">Período</th>
                    <th className="px-2 py-2">N1</th>
                    <th className="px-2 py-2">N2</th>
                    <th className="px-2 py-2">N3</th>
                    <th className="px-2 py-2">Prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {detailGrades.map((g) => (
                    <tr key={g.id} className="border-b border-secondary/10">
                      <td className="px-2 py-1.5">{g.area}</td>
                      <td className="px-2 py-1.5">{g.course.period.name}</td>
                      <td className="px-2 py-1.5">{g.note1}</td>
                      <td className="px-2 py-1.5">{g.note2}</td>
                      <td className="px-2 py-1.5">{g.note3}</td>
                      <td className="px-2 py-1.5 font-semibold text-primary">{((g.note1 + g.note2 + g.note3) / 3).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
