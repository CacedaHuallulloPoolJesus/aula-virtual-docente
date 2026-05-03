"use client";

import { Card } from "@/components/ui";
import { useAppData } from "@/components/providers/AppDataProvider";

export default function GradosSeccionesPage() {
  const { data } = useAppData();
  const groups = Array.from(
    data.teachers.reduce((map, teacher) => {
      const key = `${teacher.grade} - ${teacher.section}`;
      map.set(key, (map.get(key) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
  );

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Grados y secciones</h2>
      <Card className="overflow-auto">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-800 font-semibold">
            <tr>
              <th className="px-3 py-2">Grado y sección</th>
              <th className="px-3 py-2">Docentes asignados</th>
              <th className="px-3 py-2">Estudiantes</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(([group, teachers]) => (
              <tr key={group} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-3 py-2 text-slate-900">{group}</td>
                <td className="px-3 py-2">{teachers}</td>
                <td className="px-3 py-2">{data.students.filter((student) => `${student.grade} - ${student.section}` === group).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
