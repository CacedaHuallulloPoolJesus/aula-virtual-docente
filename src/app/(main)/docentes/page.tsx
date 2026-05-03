"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Role, TeacherStatus } from "@prisma/client";
import { Button, Card } from "@/components/ui";
import { TeacherForm, type TeacherFormState, type CatalogGrade, type CatalogSection } from "@/components/forms/TeacherForm";
import { apiJson } from "@/lib/api-client";

type ApiTeacher = {
  id: string;
  firstName: string;
  lastName: string;
  dni: string | null;
  status: TeacherStatus;
  assignedGradeId: string | null;
  assignedSectionId: string | null;
  assignedGrade: { name: string } | null;
  assignedSection: { name: string } | null;
  user: { email: string; role: Role };
};

const emptyTeacher: TeacherFormState = {
  firstName: "",
  lastName: "",
  dni: "",
  email: "",
  password: "123456",
  assignedGradeId: "",
  assignedSectionId: "",
  status: TeacherStatus.ACTIVE,
};

export default function DocentesPage() {
  const { data: session } = useSession();
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [grades, setGrades] = useState<CatalogGrade[]>([]);
  const [sections, setSections] = useState<CatalogSection[]>([]);
  const [form, setForm] = useState(emptyTeacher);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, cat] = await Promise.all([
        apiJson<ApiTeacher[]>("/api/admin/teachers"),
        apiJson<{ grades: CatalogGrade[]; sections: CatalogSection[] }>("/api/catalogs"),
      ]);
      setTeachers(t);
      setGrades(cat.grades);
      setSections(cat.sections);
    } catch {
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.role === Role.ADMIN) void load();
  }, [session?.user?.role, load]);

  if (session?.user?.role !== Role.ADMIN) {
    return <Card className="text-foreground/85">Solo el administrador puede gestionar docentes.</Card>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        const body: Record<string, unknown> = {
          firstName: form.firstName,
          lastName: form.lastName,
          dni: form.dni || null,
          email: form.email,
          status: form.status,
          assignedGradeId: form.assignedGradeId || null,
          assignedSectionId: form.assignedSectionId || null,
        };
        if (form.password.trim()) body.password = form.password;
        await apiJson(`/api/admin/teachers/${editingId}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        await apiJson("/api/admin/teachers", {
          method: "POST",
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            dni: form.dni || null,
            email: form.email,
            password: form.password,
            status: form.status,
            assignedGradeId: form.assignedGradeId || null,
            assignedSectionId: form.assignedSectionId || null,
          }),
        });
      }
      setForm(emptyTeacher);
      setEditingId(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    }
  }

  async function deleteTeacher(id: string) {
    if (!confirm("¿Eliminar docente y su usuario?")) return;
    try {
      await fetch(`/api/admin/teachers/${id}`, { method: "DELETE", credentials: "include" });
      await load();
    } catch {
      alert("No se pudo eliminar");
    }
  }

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold text-primary">Gestión del Personal Docente</h2>
      <Card>
        <TeacherForm
          form={form}
          setForm={setForm}
          grades={grades}
          sections={sections}
          editingId={editingId}
          onSubmit={submit}
          onClear={() => {
            setForm(emptyTeacher);
            setEditingId(null);
          }}
        />
      </Card>

      <Card className="overflow-auto">
        {loading ? (
          <p className="p-4 text-sm text-secondary">Cargando personal docente…</p>
        ) : (
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="border-b border-secondary/30 bg-secondary text-sm font-semibold text-white">
              <tr>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">DNI</th>
                <th className="px-3 py-2">Correo</th>
                <th className="px-3 py-2">Rol</th>
                <th className="px-3 py-2">Grado</th>
                <th className="px-3 py-2">Sección</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(even)]:bg-primary/[0.03]">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="border-b border-secondary/10 transition-colors hover:bg-cream/50">
                  <td className="px-3 py-2 text-slate-900">
                    {teacher.firstName} {teacher.lastName}
                  </td>
                  <td className="px-3 py-2">{teacher.dni ?? "—"}</td>
                  <td className="px-3 py-2">{teacher.user.email}</td>
                  <td className="px-3 py-2">{teacher.user.role === Role.ADMIN ? "Administrador" : "Docente"}</td>
                  <td className="px-3 py-2">{teacher.assignedGrade?.name ?? "—"}</td>
                  <td className="px-3 py-2">{teacher.assignedSection?.name ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        teacher.status === TeacherStatus.ACTIVE
                          ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80"
                          : "bg-slate-200 text-slate-700 ring-1 ring-slate-300/60"
                      }`}
                    >
                      {teacher.status === TeacherStatus.ACTIVE ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        className="px-2 py-1 text-xs"
                        onClick={() => {
                          setEditingId(teacher.id);
                          setForm({
                            firstName: teacher.firstName,
                            lastName: teacher.lastName,
                            dni: teacher.dni ?? "",
                            email: teacher.user.email,
                            password: "",
                            assignedGradeId: teacher.assignedGradeId ?? "",
                            assignedSectionId: teacher.assignedSectionId ?? "",
                            status: teacher.status,
                          });
                        }}
                      >
                        Editar
                      </Button>
                      <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => void deleteTeacher(teacher.id)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </section>
  );
}
