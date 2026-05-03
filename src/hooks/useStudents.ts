"use client";

import { useMemo } from "react";
import { useAppData } from "@/components/providers/AppDataProvider";
import type { Student } from "@/types/student";

/** Estudiantes visibles según rol (admin: todos; docente: su grado/sección). */
export function useStudents(): Student[] {
  const { data, auth } = useAppData();
  const teacher = data.teachers.find((t) => t.id === auth.user?.teacherId);
  return useMemo(() => {
    if (auth.user?.role === "ADMIN") return data.students;
    return data.students.filter((s) => s.grade === teacher?.grade && s.section === teacher?.section);
  }, [data.students, auth.user?.role, teacher?.grade, teacher?.section]);
}
