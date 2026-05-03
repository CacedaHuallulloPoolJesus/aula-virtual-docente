"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { TeacherForm, type TeacherFormState } from "@/components/forms/TeacherForm";
import { useAppData } from "@/components/providers/AppDataProvider";

const emptyTeacher: TeacherFormState = {
  firstName: "",
  lastName: "",
  email: "",
  grade: "",
  section: "",
  status: "ACTIVO",
  password: "123456",
};

export default function DocentesPage() {
  const { auth, data, addTeacher, updateTeacher, deleteTeacher } = useAppData();
  const [form, setForm] = useState(emptyTeacher);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (auth.user?.role !== "ADMIN") {
    return <Card className="text-slate-700">Solo el administrador puede gestionar docentes.</Card>;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) updateTeacher(editingId, form);
    else addTeacher(form);
    setForm(emptyTeacher);
    setEditingId(null);
  }

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold text-slate-900">Gestión de docentes</h2>
      <Card className="border-blue-100">
        <TeacherForm
          form={form}
          setForm={setForm}
          editingId={editingId}
          onSubmit={submit}
          onClear={() => {
            setForm(emptyTeacher);
            setEditingId(null);
          }}
        />
      </Card>

      <Card className="overflow-auto border-slate-200">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">
            <tr>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Nombre del docente</th>
              <th className="px-3 py-2">Correo</th>
              <th className="px-3 py-2">Grado</th>
              <th className="px-3 py-2">Sección</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.teachers.map((teacher) => (
              <tr key={teacher.id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-3 py-2">{teacher.code}</td>
                <td className="px-3 py-2 text-slate-900">
                  {teacher.firstName} {teacher.lastName}
                </td>
                <td className="px-3 py-2">{teacher.email}</td>
                <td className="px-3 py-2">{teacher.grade}</td>
                <td className="px-3 py-2">{teacher.section}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${teacher.status === "ACTIVO" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}
                  >
                    {teacher.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      className="px-2 py-1 text-xs"
                      onClick={() => {
                        setEditingId(teacher.id);
                        setForm({ ...teacher, password: "123456" });
                      }}
                    >
                      Editar
                    </Button>
                    <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => deleteTeacher(teacher.id)}>
                      Eliminar
                    </Button>
                    <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => alert(`${teacher.grade} - Sección ${teacher.section}`)}>
                      Ver asignación
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
