"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { GradesForm } from "@/components/forms/GradesForm";
import type { GradeRow } from "@/types/grades";
import { areas } from "@/constants/academic";
import { apiJson } from "@/lib/api-client";

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

  const loadGrades = useCallback(async (pid: string) => {
    if (!pid) return;
    const g = await apiJson<ApiGradeRow[]>(`/api/grades?periodId=${encodeURIComponent(pid)}`);
    setGradesApi(g);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [stu, cat] = await Promise.all([apiJson<ApiStudent[]>("/api/students"), apiJson<{ periods: Period[]; teachers: ApiTeacherRow[] | null }>("/api/catalogs")]);
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
      alert(role === Role.ADMIN ? "Seleccione docente." : "Sin perfil docente.");
      return;
    }
    if (!periodId) {
      alert("No hay períodos académicos configurados.");
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
      alert("Notas guardadas.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al guardar");
    }
  }

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold text-primary">Evaluación de Notas</h2>
      {role === Role.ADMIN && teachers.length > 0 && (
        <div className="max-w-md rounded-xl border border-accent/35 bg-cream/50 p-3 text-sm text-foreground/90">
          <label className="block font-medium text-primary/85">Docente evaluador</label>
          <select className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2" value={adminTeacherId} onChange={(e) => setAdminTeacherId(e.target.value)}>
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
        onClearDraft={() => setDraft({})}
      />
    </section>
  );
}
