"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui";
import { apiJson } from "@/lib/api-client";

type TeacherRow = {
  id: string;
  firstName: string;
  lastName: string;
  assignedGrade: { name: string } | null;
  assignedSection: { name: string } | null;
};

type StudentRow = { id: string; grade: { name: string }; section: { name: string } };

export default function GradosSeccionesPage() {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [t, s] = await Promise.all([apiJson<TeacherRow[]>("/api/admin/teachers"), apiJson<StudentRow[]>("/api/students")]);
        setTeachers(t);
        setStudents(s);
      } catch {
        setTeachers([]);
        setStudents([]);
      }
    })();
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, { teachers: number; students: number }>();
    for (const teacher of teachers) {
      const g = teacher.assignedGrade?.name ?? "—";
      const sec = teacher.assignedSection?.name ?? "—";
      const key = `${g} — ${sec}`;
      const cur = map.get(key) ?? { teachers: 0, students: 0 };
      cur.teachers += 1;
      map.set(key, cur);
    }
    for (const st of students) {
      const key = `${st.grade.name} — ${st.section.name}`;
      const cur = map.get(key) ?? { teachers: 0, students: 0 };
      cur.students += 1;
      map.set(key, cur);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [teachers, students]);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-primary">Grados y Secciones</h2>
      <Card className="overflow-auto">
        <table className="min-w-full text-left text-sm text-foreground/90">
          <thead className="border-b border-secondary/30 bg-secondary text-sm font-semibold text-white">
            <tr>
              <th className="px-3 py-2">Grado y sección</th>
              <th className="px-3 py-2">Docentes asignados</th>
              <th className="px-3 py-2">Estudiantes</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-primary/[0.03]">
            {groups.map(([group, counts]) => (
              <tr key={group} className="border-b border-secondary/10 transition-colors hover:bg-cream/50">
                <td className="px-3 py-2 text-foreground">{group}</td>
                <td className="px-3 py-2">{counts.teachers}</td>
                <td className="px-3 py-2">{counts.students}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
