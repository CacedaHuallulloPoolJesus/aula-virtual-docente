"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { AttendanceStatus, Role, StudentStatus } from "@prisma/client";
import { Button, Card, ConfirmDialog, Input, useToast } from "@/components/ui";
import { StudentForm, type StudentFormState } from "@/components/forms/StudentForm";
import { StudentProfileModal, type ProfileStudent } from "@/components/students/StudentProfileModal";
import { apiJson } from "@/lib/api-client";

type ApiStudent = {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  dni: string | null;
  birthDate: string | null;
  gradeId: string;
  sectionId: string;
  guardian: string | null;
  guardianPhone: string | null;
  address: string | null;
  status: StudentStatus;
  grade: { name: string };
  section: { name: string };
};

type CatalogGrade = { id: string; name: string };
type CatalogSection = { id: string; name: string; gradeId: string };

type ApiAttendanceRecord = {
  studentId: string;
  date: string;
  status: AttendanceStatus;
  justification: string | null;
};

type ApiGradeRecord = {
  studentId: string;
  area: string;
  note1: number;
  note2: number;
  note3: number;
  course: { period: { name: string } };
};

const emptyForm: StudentFormState = {
  code: "",
  firstName: "",
  lastName: "",
  dni: "",
  birthDate: "",
  guardian: "",
  guardianPhone: "",
  address: "",
  status: StudentStatus.ACTIVE,
};

async function downloadFile(path: string, filename: string): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(path, { credentials: "include" });
  if (!res.ok) {
    const text = await res.text();
    return { ok: false, message: text || "Error al descargar el archivo" };
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return { ok: true, message: "Descarga completada" };
}

export default function EstudiantesPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [grades, setGrades] = useState<CatalogGrade[]>([]);
  const [sections, setSections] = useState<CatalogSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [gradeId, setGradeId] = useState("");
  const [sectionId, setSectionId] = useState("");

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileStudent, setProfileStudent] = useState<ProfileStudent | null>(null);
  const [profileAtt, setProfileAtt] = useState<{ date: string; status: AttendanceStatus; justification: string | null }[]>([]);
  const [profileGrades, setProfileGrades] = useState<{ area: string; note1: number; note2: number; note3: number; period: string }[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [stu, cat] = await Promise.all([
        apiJson<ApiStudent[]>("/api/students"),
        apiJson<{ grades: CatalogGrade[]; sections: CatalogSection[] }>("/api/catalogs"),
      ]);
      setStudents(stu);
      setGrades(cat.grades);
      setSections(cat.sections);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sectionOptions = useMemo(() => sections.filter((s) => s.gradeId === gradeId), [sections, gradeId]);

  const visibleStudents = useMemo(() => {
    let list = students;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((item) => `${item.code} ${item.firstName} ${item.lastName}`.toLowerCase().includes(q));
    }
    if (gradeFilter !== "ALL") list = list.filter((item) => item.grade.name === gradeFilter);
    if (sectionFilter !== "ALL") list = list.filter((item) => item.section.name === sectionFilter);
    if (statusFilter !== "ALL") list = list.filter((item) => item.status === statusFilter);
    return list;
  }, [students, query, gradeFilter, sectionFilter, statusFilter]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setGradeId("");
    setSectionId("");
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    const gId = role === Role.TEACHER ? session?.user?.assignedGradeId : gradeId;
    const sId = role === Role.TEACHER ? session?.user?.assignedSectionId : sectionId;
    if (!gId || !sId) {
      toast(role === Role.TEACHER ? "Su usuario no tiene grado y sección asignados en el sistema." : "Seleccione grado y sección.", "warning");
      return;
    }
    const payload = {
      ...form,
      birthDate: form.birthDate || null,
      gradeId: gId,
      sectionId: sId,
    };
    try {
      if (editingId) {
        await apiJson(`/api/students/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast("Estudiante actualizado correctamente.", "success");
      } else {
        await apiJson("/api/students", { method: "POST", body: JSON.stringify(payload) });
        toast("Estudiante registrado correctamente.", "success");
      }
      await load();
      resetForm();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al guardar", "error");
    }
  }

  function editStudent(id: string) {
    const student = students.find((item) => item.id === id);
    if (!student) return;
    setEditingId(id);
    setForm({
      code: student.code,
      firstName: student.firstName,
      lastName: student.lastName,
      dni: student.dni ?? "",
      birthDate: student.birthDate ? student.birthDate.slice(0, 10) : "",
      guardian: student.guardian ?? "",
      guardianPhone: student.guardianPhone ?? "",
      address: student.address ?? "",
      status: student.status,
    });
    setGradeId(student.gradeId);
    setSectionId(student.sectionId);
    setShowForm(true);
  }

  async function openProfile(student: ApiStudent) {
    setProfileStudent({
      id: student.id,
      code: student.code,
      firstName: student.firstName,
      lastName: student.lastName,
      dni: student.dni,
      birthDate: student.birthDate,
      guardian: student.guardian,
      guardianPhone: student.guardianPhone,
      address: student.address,
      status: student.status,
      grade: student.grade,
      section: student.section,
    });
    setProfileOpen(true);
    setProfileLoading(true);
    setProfileAtt([]);
    setProfileGrades([]);
    try {
      const [attList, gradeList] = await Promise.all([
        apiJson<ApiAttendanceRecord[]>("/api/attendance"),
        apiJson<ApiGradeRecord[]>("/api/grades"),
      ]);
      const att = attList
        .filter((a) => a.studentId === student.id)
        .map((a) => ({ date: a.date, status: a.status, justification: a.justification }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const gr = gradeList
        .filter((g) => g.studentId === student.id)
        .map((g) => ({
          area: g.area,
          note1: g.note1,
          note2: g.note2,
          note3: g.note3,
          period: g.course.period.name,
        }));
      setProfileAtt(att);
      setProfileGrades(gr);
    } catch {
      toast("No se pudo cargar el resumen de asistencia y notas.", "warning");
    } finally {
      setProfileLoading(false);
    }
  }

  function badge(st: StudentStatus) {
    if (st === StudentStatus.ACTIVE) return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80";
    if (st === StudentStatus.TRANSFERRED) return "bg-accent/30 text-primary ring-1 ring-accent/45";
    if (st === StudentStatus.WITHDRAWN) return "bg-slate-200 text-slate-700 ring-1 ring-slate-300/60";
    return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }

  function statusText(st: StudentStatus) {
    if (st === StudentStatus.ACTIVE) return "ACTIVO";
    if (st === StudentStatus.TRANSFERRED) return "TRASLADO";
    if (st === StudentStatus.WITHDRAWN) return "RETIRADO";
    return "INACTIVO";
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/students/${deleteId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        toast(await res.text(), "error");
        return;
      }
      toast("Estudiante eliminado.", "success");
      setDeleteId(null);
      await load();
    } catch {
      toast("No se pudo eliminar el estudiante.", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleExportPdf() {
    const r = await downloadFile("/api/export/students/pdf", "estudiantes.pdf");
    toast(r.message, r.ok ? "success" : "error");
  }

  async function handleExportExcel() {
    const r = await downloadFile("/api/export/students/xlsx", "estudiantes.xlsx");
    toast(r.message, r.ok ? "success" : "error");
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold text-primary">Gestión de Estudiantes</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="cursor-pointer text-xs" onClick={() => void handleExportPdf()}>
            Exportar PDF
          </Button>
          <Button variant="secondary" className="cursor-pointer text-xs" onClick={() => void handleExportExcel()}>
            Exportar Excel
          </Button>
        </div>
      </div>
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
      <Card className="space-y-3">
        <div className="grid gap-2 md:grid-cols-4">
          <Input
            label="Buscar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Apellidos, nombres o código de estudiante…"
          />
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Grado</span>
            <select
              className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900"
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
            >
              <option value="ALL">Todos</option>
              {[...new Set(students.map((s) => s.grade.name))].map((grade) => (
                <option key={grade}>{grade}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Sección</span>
            <select
              className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
            >
              <option value="ALL">Todas</option>
              {[...new Set(students.map((s) => s.section.name))].map((section) => (
                <option key={section}>{section}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Estado</span>
            <select
              className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Todos</option>
              <option value={StudentStatus.ACTIVE}>Activo</option>
              <option value={StudentStatus.TRANSFERRED}>Traslado</option>
              <option value={StudentStatus.WITHDRAWN}>Retirado</option>
              <option value={StudentStatus.INACTIVE}>Inactivo</option>
            </select>
          </label>
        </div>
        <Button variant="primary" className="cursor-pointer" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? "Cerrar formulario" : "Nuevo estudiante"}
        </Button>
      </Card>

      {showForm && (
        <Card className="space-y-4">
          {role === Role.TEACHER && (
            <p className="text-sm text-slate-600">
              Aula asignada: <strong>{session?.user?.assignedGradeName ?? "—"}</strong> — Sección <strong>{session?.user?.assignedSectionName ?? "—"}</strong>
            </p>
          )}
          {role === Role.ADMIN && (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-600">Grado</span>
                <select
                  className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900"
                  value={gradeId}
                  onChange={(e) => {
                    setGradeId(e.target.value);
                    setSectionId("");
                  }}
                >
                  <option value="">Seleccione</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-600">Sección</span>
                <select
                  className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900"
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  disabled={!gradeId}
                >
                  <option value="">Seleccione</option>
                  {sectionOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <StudentForm form={form} setForm={setForm} editingId={editingId} onSubmit={submitForm} onCancel={resetForm} />
        </Card>
      )}

      <Card className="overflow-auto">
        {loading ? (
          <p className="p-4 text-sm text-secondary">Cargando listado de estudiantes…</p>
        ) : (
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="border-b border-secondary/30 bg-secondary text-sm font-semibold text-white">
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
            <tbody className="[&>tr:nth-child(even)]:bg-primary/[0.03]">
              {visibleStudents.map((student) => (
                <tr key={student.id} className="border-b border-secondary/10 transition-colors hover:bg-cream/50">
                  <td className="px-3 py-2">{student.code}</td>
                  <td className="px-3 py-2">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-3 py-2">{student.dni ?? "—"}</td>
                  <td className="px-3 py-2">{student.grade.name}</td>
                  <td className="px-3 py-2">{student.section.name}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${badge(student.status)}`}>{statusText(student.status)}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" className="cursor-pointer px-2 py-1 text-xs" onClick={() => void openProfile(student)}>
                        Ver ficha
                      </Button>
                      <Button variant="secondary" className="cursor-pointer px-2 py-1 text-xs" onClick={() => editStudent(student.id)}>
                        Editar
                      </Button>
                      {role === Role.ADMIN && (
                        <Button variant="danger" className="cursor-pointer px-2 py-1 text-xs" onClick={() => setDeleteId(student.id)}>
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <StudentProfileModal
        open={profileOpen}
        student={profileStudent}
        attendance={profileAtt}
        grades={profileGrades}
        loading={profileLoading}
        onClose={() => {
          setProfileOpen(false);
          setProfileStudent(null);
        }}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Eliminar estudiante"
        description="Esta acción eliminará el registro del estudiante. ¿Desea continuar?"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        loading={deleteLoading}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
