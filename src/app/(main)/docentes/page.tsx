"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Role, TeacherStatus } from "@prisma/client";
import { ForbiddenSection } from "@/components/layout/ForbiddenSection";
import { Button, Card, ConfirmDialog, Input, Modal, useToast } from "@/components/ui";
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
  user: { email: string; role: Role; createdAt: string };
};

const emptyTeacher: TeacherFormState = {
  firstName: "",
  lastName: "",
  dni: "",
  email: "",
  password: "",
  assignedGradeId: "",
  assignedSectionId: "",
  status: TeacherStatus.ACTIVE,
};

export default function DocentesPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [grades, setGrades] = useState<CatalogGrade[]>([]);
  const [sections, setSections] = useState<CatalogSection[]>([]);
  const [form, setForm] = useState(emptyTeacher);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewTeacher, setViewTeacher] = useState<ApiTeacher | null>(null);
  const [passwordTeacher, setPasswordTeacher] = useState<ApiTeacher | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    return <ForbiddenSection />;
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
        toast("Docente actualizado correctamente.", "success");
      } else {
        if (!form.password.trim() || form.password.trim().length < 6) {
          toast("Indique una contraseña de al menos 6 caracteres.", "error");
          return;
        }
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
        toast("Docente creado correctamente.", "success");
      }
      setForm(emptyTeacher);
      setEditingId(null);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al guardar", "error");
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/teachers/${deleteId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        toast(await res.text(), "error");
        return;
      }
      toast("Docente eliminado.", "success");
      setDeleteId(null);
      await load();
    } catch {
      toast("No se pudo eliminar.", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function toggleStatus(teacher: ApiTeacher) {
    const next = teacher.status === TeacherStatus.ACTIVE ? TeacherStatus.INACTIVE : TeacherStatus.ACTIVE;
    try {
      await apiJson(`/api/admin/teachers/${teacher.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      toast(next === TeacherStatus.ACTIVE ? "Docente activado correctamente." : "Docente desactivado correctamente.", "success");
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo cambiar el estado", "error");
    }
  }

  async function submitPasswordChange() {
    if (!passwordTeacher) return;
    if (newPassword.length < 6) {
      toast("La contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }
    if (newPassword !== newPassword2) {
      toast("Las contraseñas no coinciden.", "error");
      return;
    }
    setPasswordSaving(true);
    try {
      await apiJson(`/api/admin/teachers/${passwordTeacher.id}`, {
        method: "PATCH",
        body: JSON.stringify({ password: newPassword }),
      });
      toast("Contraseña actualizada correctamente.", "success");
      setPasswordTeacher(null);
      setNewPassword("");
      setNewPassword2("");
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo actualizar la contraseña.", "error");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-primary">Gestión del Personal Docente</h2>
        <Button
          type="button"
          variant="primary"
          className="cursor-pointer"
          onClick={() => {
            setForm(emptyTeacher);
            setEditingId(null);
            document.getElementById("formulario-docente")?.scrollIntoView({ behavior: "smooth", block: "start" });
            toast("Complete el formulario para registrar un nuevo docente.", "info");
          }}
        >
          Nuevo docente
        </Button>
      </div>
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
            toast("Formulario limpiado.", "info");
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
                <th className="px-3 py-2">Nombre completo</th>
                <th className="px-3 py-2">DNI</th>
                <th className="px-3 py-2">Correo</th>
                <th className="px-3 py-2">Grado</th>
                <th className="px-3 py-2">Sección</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Fecha de registro</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(even)]:bg-primary/[0.03]">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="border-b border-secondary/10 transition-colors hover:bg-cream/50">
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {teacher.firstName} {teacher.lastName}
                  </td>
                  <td className="px-3 py-2">{teacher.dni ?? "—"}</td>
                  <td className="px-3 py-2">{teacher.user.email}</td>
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
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(teacher.user.createdAt).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex max-w-[280px] flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="cursor-pointer px-2 py-1 text-xs"
                        onClick={() => setViewTeacher(teacher)}
                      >
                        Ver
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="cursor-pointer px-2 py-1 text-xs"
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
                          document.getElementById("formulario-docente")?.scrollIntoView({ behavior: "smooth", block: "start" });
                          toast("Edite los datos y guarde los cambios.", "info");
                        }}
                      >
                        Editar
                      </Button>
                      {teacher.user.role !== Role.ADMIN && (
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            className="cursor-pointer px-2 py-1 text-xs"
                            onClick={() => {
                              setPasswordTeacher(teacher);
                              setNewPassword("");
                              setNewPassword2("");
                            }}
                          >
                            Cambiar contraseña
                          </Button>
                          <Button
                            type="button"
                            variant="warning"
                            className="cursor-pointer px-2 py-1 text-xs"
                            onClick={() => void toggleStatus(teacher)}
                          >
                            {teacher.status === TeacherStatus.ACTIVE ? "Desactivar" : "Activar"}
                          </Button>
                          <Button type="button" variant="danger" className="cursor-pointer px-2 py-1 text-xs" onClick={() => setDeleteId(teacher.id)}>
                            Eliminar
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={viewTeacher !== null} title="Ficha del docente" onClose={() => setViewTeacher(null)} className="max-w-md">
        {viewTeacher ? (
          <div className="space-y-2 text-sm text-foreground/90">
            <p>
              <strong>Nombre completo:</strong> {viewTeacher.firstName} {viewTeacher.lastName}
            </p>
            <p>
              <strong>DNI:</strong> {viewTeacher.dni ?? "—"}
            </p>
            <p>
              <strong>Correo:</strong> {viewTeacher.user.email}
            </p>
            <p>
              <strong>Grado asignado:</strong> {viewTeacher.assignedGrade?.name ?? "Sin asignar"}
            </p>
            <p>
              <strong>Sección asignada:</strong> {viewTeacher.assignedSection?.name ?? "Sin asignar"}
            </p>
            <p>
              <strong>Estado:</strong> {viewTeacher.status === TeacherStatus.ACTIVE ? "ACTIVO" : "INACTIVO"}
            </p>
            <p>
              <strong>Fecha de registro:</strong>{" "}
              {new Date(viewTeacher.user.createdAt).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            <p className="text-xs text-foreground/60">La asignación determina el aula visible en estudiantes, asistencia y notas.</p>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={passwordTeacher !== null}
        title="Cambiar contraseña"
        onClose={() => {
          setPasswordTeacher(null);
          setNewPassword("");
          setNewPassword2("");
        }}
        className="max-w-md"
      >
        {passwordTeacher ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void submitPasswordChange();
            }}
          >
            <p className="text-sm text-foreground/80">
              Docente: <strong>{passwordTeacher.firstName}</strong> — correo <strong>{passwordTeacher.user.email}</strong>
            </p>
            <Input label="Nueva contraseña" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            <Input
              label="Confirmar contraseña"
              type="password"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              required
              minLength={6}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                className="cursor-pointer"
                onClick={() => {
                  setPasswordTeacher(null);
                  setNewPassword("");
                  setNewPassword2("");
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" className="cursor-pointer" disabled={passwordSaving}>
                {passwordSaving ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Eliminar docente"
        description="Se eliminará el usuario y el perfil docente asociado. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteLoading}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
