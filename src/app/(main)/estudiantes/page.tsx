"use client";

import { useMemo, useState } from "react";
import { Button, Card, Input } from "@/components/ui";
import { StudentForm, type StudentFormState } from "@/components/forms/StudentForm";
import type { StudentStatus } from "@/types/student";
import { useAppData } from "@/components/providers/AppDataProvider";

const emptyForm: StudentFormState = {
  code: "",
  firstName: "",
  lastName: "",
  dni: "",
  birthDate: "",
  grade: "",
  section: "",
  guardian: "",
  guardianPhone: "",
  address: "",
  status: "ACTIVO",
};

export default function EstudiantesPage() {
  const { data, auth, addStudent, deleteStudent, updateStudent } = useAppData();
  const teacher = data.teachers.find((t) => t.id === auth.user?.teacherId);
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const visibleStudents = useMemo(() => {
    let list =
      auth.user?.role === "ADMIN"
        ? data.students
        : data.students.filter((student) => student.grade === teacher?.grade && student.section === teacher?.section);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((item) => `${item.code} ${item.firstName} ${item.lastName}`.toLowerCase().includes(q));
    }
    if (gradeFilter !== "ALL") list = list.filter((item) => item.grade === gradeFilter);
    if (sectionFilter !== "ALL") list = list.filter((item) => item.section === sectionFilter);
    if (statusFilter !== "ALL") list = list.filter((item) => item.status === statusFilter);
    return list;
  }, [data.students, auth.user?.role, teacher?.grade, teacher?.section, query, gradeFilter, sectionFilter, statusFilter]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      grade: auth.user?.role === "DOCENTE" ? teacher?.grade ?? form.grade : form.grade,
      section: auth.user?.role === "DOCENTE" ? teacher?.section ?? form.section : form.section,
    };
    if (editingId) updateStudent(editingId, payload);
    else addStudent(payload);
    resetForm();
  }

  function editStudent(id: string) {
    const student = data.students.find((item) => item.id === id);
    if (!student) return;
    setEditingId(id);
    setForm(student);
    setShowForm(true);
  }

  function badge(status: StudentStatus) {
    if (status === "ACTIVO") return "bg-emerald-100 text-emerald-700";
    if (status === "TRASLADO") return "bg-amber-100 text-amber-700";
    return "bg-slate-200 text-slate-700";
  }

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold text-slate-900">Módulo de estudiantes</h2>
      <Card className="space-y-3 border-blue-100">
        <div className="grid gap-2 md:grid-cols-4">
          <Input label="Buscar por nombre o código" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ej: STD-001" />
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Grado</span>
            <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900" value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
              <option value="ALL">Todos</option>
              {[...new Set(data.students.map((s) => s.grade))].map((grade) => (
                <option key={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Sección</span>
            <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
              <option value="ALL">Todas</option>
              {[...new Set(data.students.map((s) => s.section))].map((section) => (
                <option key={section}>
                  {section}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Estado</span>
            <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">Todos</option>
              <option value="ACTIVO">Activo</option>
              <option value="TRASLADO">Traslado</option>
              <option value="RETIRADO">Retirado</option>
            </select>
          </label>
        </div>
        <Button variant="primary" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? "Cerrar formulario" : "Nuevo estudiante"}
        </Button>
      </Card>

      {showForm && (
        <Card className="border-blue-100">
          <StudentForm
            form={form}
            setForm={setForm}
            role={auth.user?.role}
            teacherGrade={teacher?.grade}
            teacherSection={teacher?.section}
            editingId={editingId}
            onSubmit={submitForm}
            onCancel={resetForm}
          />
        </Card>
      )}

      <Card className="overflow-auto">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">
            <tr>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">DNI</th>
              <th className="px-3 py-2">Grado</th>
              <th className="px-3 py-2">Sección</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibleStudents.map((student) => (
              <tr key={student.code} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-3 py-2">{student.code}</td>
                <td className="px-3 py-2">
                  {student.firstName} {student.lastName}
                </td>
                <td className="px-3 py-2">{student.dni}</td>
                <td className="px-3 py-2">{student.grade}</td>
                <td className="px-3 py-2">{student.section}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${badge(student.status)}`}>{student.status}</span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      className="px-2 py-1 text-xs"
                      onClick={() => alert(`${student.firstName} ${student.lastName}\nDNI: ${student.dni}\nApoderado: ${student.guardian}`)}
                    >
                      Ver
                    </Button>
                    <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => editStudent(student.id)}>
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      className="px-2 py-1 text-xs"
                      onClick={() => {
                        if (confirm("¿Eliminar estudiante?")) deleteStudent(student.id);
                      }}
                    >
                      Eliminar
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
