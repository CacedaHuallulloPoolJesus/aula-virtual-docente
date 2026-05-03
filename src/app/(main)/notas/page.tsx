"use client";

import { useMemo, useState } from "react";
import { GradesForm } from "@/components/forms/GradesForm";
import { areas, periods } from "@/constants/academic";
import type { GradeRecord } from "@/types/grades";
import { useAppData } from "@/components/providers/AppDataProvider";

export default function NotasPage() {
  const { data, auth, saveGradesBatch } = useAppData();
  const teacher = data.teachers.find((t) => t.id === auth.user?.teacherId);
  const [area, setArea] = useState(areas[0]);
  const [period, setPeriod] = useState(periods[0]);
  const [draft, setDraft] = useState<Record<string, { note1: number; note2: number; note3: number }>>({});

  const students =
    auth.user?.role === "ADMIN"
      ? data.students
      : data.students.filter((s) => s.grade === teacher?.grade && s.section === teacher?.section);

  const currentRows = useMemo(
    () =>
      students.map((student) => {
        const existing = data.grades.find((grade) => grade.studentId === student.id && grade.area === area && grade.period === period);
        const values = draft[student.id] || existing || { note1: 0, note2: 0, note3: 0 };
        const promedio = (values.note1 + values.note2 + values.note3) / 3;
        const nivel = promedio >= 18 ? "AD" : promedio >= 14 ? "A" : promedio >= 11 ? "B" : "C";
        return { student, values, promedio, nivel, riesgo: promedio < 11 };
      }),
    [students, data.grades, area, period, draft],
  );

  function updateNote(studentId: string, key: "note1" | "note2" | "note3", value: number) {
    setDraft((prev) => ({ ...prev, [studentId]: { ...(prev[studentId] || { note1: 0, note2: 0, note3: 0 }), [key]: value } }));
  }

  function save() {
    const payload: GradeRecord[] = currentRows.map((row) => ({
      id: crypto.randomUUID(),
      studentId: row.student.id,
      area,
      period,
      note1: row.values.note1,
      note2: row.values.note2,
      note3: row.values.note3,
    }));
    saveGradesBatch(payload);
    alert("Notas guardadas.");
  }

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold text-slate-900">Módulo de notas</h2>
      <GradesForm
        area={area}
        setArea={setArea}
        period={period}
        setPeriod={setPeriod}
        rows={currentRows}
        onChangeNote={updateNote}
        onSave={save}
        onClearDraft={() => setDraft({})}
      />
    </section>
  );
}
