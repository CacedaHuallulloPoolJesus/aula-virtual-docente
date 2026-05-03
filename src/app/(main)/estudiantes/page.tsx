"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Role, StudentStatus } from "@prisma/client";
import { Button, Card, Input } from "@/components/ui";
import { StudentForm, type StudentFormState } from "@/components/forms/StudentForm";
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

async function downloadFile(path: string, filename: string) {
  const res = await fetch(path, { credentials: "include" });
  if (!res.ok) {
    alert(await res.text());
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function EstudiantesPage() {
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
      alert(role === Role.TEACHER ? "Su usuario no tiene grado y sección asignados en el sistema." : "Seleccione grado y sección.");
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
      } else {
        await apiJson("/api/students", { method: "POST", body: JSON.stringify(payload) });
      }
      await load();
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar");
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

  function badge(st: StudentStatus) {
    if (st === StudentStatus.ACTIVE) return "bg-emerald-100 text-emerald-700";
    if (st === StudentStatus.TRANSFERRED) return "bg-amber-100 text-amber-700";
    if (st === StudentStatus.WITHDRAWN) return "bg-slate-200 text-slate-700";
    return "bg-slate-100 text-slate-600";
  }

  function statusText(st: StudentStatus) {
    if (st === StudentStatus.ACTIVE) return "ACTIVO";
    if (st === StudentStatus.TRANSFERRED) return "TRASLADO";
    if (st === StudentStatus.WITHDRAWN) return "RETIRADO";
    return "INACTIVO";
  }

  async function removeStudent(id: string) {
    if (!confirm("¿Eliminar estudiante?")) return;
    try {
      await fetch(`/api/students/${id}`, { method: "DELETE", credentials: "include" });
      await load();
    } catch {
      alert("No se pudo eliminar");
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold text-slate-900">Módulo de estudiantes</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="text-xs" onClick={() => downloadFile("/api/export/students/pdf", "estudiantes.pdf")}>
            PDF
          </Button>
          <Button variant="secondary" className="text-xs" onClick={() => downloadFile("/api/export/students/xlsx", "estudiantes.xlsx")}>
            Excel
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <Card className="space-y-3 border-blue-100">
        <div className="grid gap-2 md:grid-cols-4">
          <Input label="Buscar por nombre o código" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ej: STD-001" />
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Grado</span>
            <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900" value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
              <option value="ALL">Todos</option>
              {[...new Set(students.map((s) => s.grade.name))].map((grade) => (
                <option key={grade}>{grade}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Sección</span>
            <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
              <option value="ALL">Todas</option>
              {[...new Set(students.map((s) => s.section.name))].map((section) => (
                <option key={section}>{section}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Estado</span>
            <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">Todos</option>
              <option value={StudentStatus.ACTIVE}>Activo</option>
              <option value={StudentStatus.TRANSFERRED}>Traslado</option>
              <option value={StudentStatus.WITHDRAWN}>Retirado</option>
              <option value={StudentStatus.INACTIVE}>Inactivo</option>
            </select>
          </label>
        </div>
        <Button variant="primary" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? "Cerrar formulario" : "Nuevo estudiante"}
        </Button>
      </Card>

      {showForm && (
        <Card className="space-y-4 border-blue-100">
          {role === Role.TEACHER && (
            <p className="text-sm text-slate-600">
              Aula asignada: <strong>{session?.user?.assignedGradeName ?? "—"}</strong> — Sección <strong>{session?.user?.assignedSectionName ?? "—"}</strong>
            </p>
          )}
          {role === Role.ADMIN && (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-600">Grado</span>
                <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900" value={gradeId} onChange={(e) => { setGradeId(e.target.value); setSectionId(""); }}>
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
                <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!gradeId}>
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
          <p className="p-4 text-sm text-slate-600">Cargando estudiantes...</p>
        ) : (
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
                <tr key={student.id} className="border-b border-slate-200 hover:bg-slate-50">
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
                      <Button
                        variant="secondary"
                        className="px-2 py-1 text-xs"
                        onClick={() =>
                          alert(`${student.firstName} ${student.lastName}\nDNI: ${student.dni ?? "—"}\nApoderado: ${student.guardian ?? "—"}`)
                        }
                      >
                        Ver
                      </Button>
                      <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => editStudent(student.id)}>
                        Editar
                      </Button>
                      {role === Role.ADMIN && (
                        <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => void removeStudent(student.id)}>
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
    </section>
  );
}
