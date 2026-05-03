"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { Button, Card, Input } from "@/components/ui";
import { SessionForm, type SessionFormState } from "@/components/forms/SessionForm";
import { apiJson } from "@/lib/api-client";

type LearningSessionRow = {
  id: string;
  title: string;
  grade: string;
  section: string;
  area: string;
  competence: string;
  capacity: string;
  performance: string;
  learningPurpose: string;
  learningEvidence: string;
  startActivity: string;
  development: string;
  closure: string;
  resources: string;
  evaluation: string;
  date: string;
  duration: string;
  generatedByIa: boolean;
  teacherId: string;
};

type ApiTeacherRow = { id: string; firstName: string; lastName: string; user: { email: string } };

const defaultSession: SessionFormState = {
  title: "",
  grade: "",
  section: "",
  area: "",
  competence: "",
  capacity: "",
  performance: "",
  purpose: "",
  evidence: "",
  start: "",
  development: "",
  closure: "",
  resources: "",
  evaluation: "",
  date: new Date().toISOString().slice(0, 10),
  duration: "90 minutos",
};

export default function SesionesPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const [sessions, setSessions] = useState<LearningSessionRow[]>([]);
  const [teachers, setTeachers] = useState<ApiTeacherRow[]>([]);
  const [adminTeacherId, setAdminTeacherId] = useState("");
  const [form, setForm] = useState(defaultSession);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [areaFilter, setAreaFilter] = useState("ALL");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const load = useCallback(async () => {
    const list = await apiJson<LearningSessionRow[]>("/api/sessions");
    setSessions(list);
  }, []);

  useEffect(() => {
    void load();
    if (role === Role.ADMIN) {
      apiJson<ApiTeacherRow[]>("/api/admin/teachers")
        .then((t) => {
          setTeachers(t);
          if (t[0]) setAdminTeacherId(t[0].id);
        })
        .catch(() => {});
    }
  }, [role, load]);

  const list = useMemo(() => {
    let items = sessions;
    if (areaFilter !== "ALL") items = items.filter((item) => item.area === areaFilter);
    if (gradeFilter !== "ALL") items = items.filter((item) => item.grade === gradeFilter);
    if (dateFilter) items = items.filter((item) => item.date.slice(0, 10) === dateFilter);
    return items;
  }, [sessions, areaFilter, gradeFilter, dateFilter]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const teacherId = role === Role.ADMIN ? adminTeacherId : session?.user?.teacherId;
    if (!teacherId) {
      alert(role === Role.ADMIN ? "Seleccione docente." : "Solo docentes pueden crear sesiones manuales.");
      return;
    }
    const grade = role === Role.TEACHER ? session?.user?.assignedGradeName ?? form.grade : form.grade;
    const section = role === Role.TEACHER ? session?.user?.assignedSectionName ?? form.section : form.section;
    const body = {
      title: form.title,
      grade,
      section,
      area: form.area,
      competence: form.competence,
      capacity: form.capacity,
      performance: form.performance,
      learningPurpose: form.purpose,
      learningEvidence: form.evidence,
      startActivity: form.start,
      development: form.development,
      closure: form.closure,
      resources: form.resources,
      evaluation: form.evaluation,
      date: form.date,
      duration: form.duration,
      generatedByIa: false,
      ...(role === Role.ADMIN ? { teacherId } : {}),
    };
    try {
      if (editingId) {
        await apiJson(`/api/sessions/${editingId}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        await apiJson("/api/sessions", { method: "POST", body: JSON.stringify(body) });
      }
      setForm(defaultSession);
      setShowForm(false);
      setEditingId(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    }
  }

  function startEdit(s: LearningSessionRow) {
    setEditingId(s.id);
    setForm({
      title: s.title,
      grade: s.grade,
      section: s.section,
      area: s.area,
      competence: s.competence,
      capacity: s.capacity,
      performance: s.performance,
      purpose: s.learningPurpose,
      evidence: s.learningEvidence,
      start: s.startActivity,
      development: s.development,
      closure: s.closure,
      resources: s.resources,
      evaluation: s.evaluation,
      date: s.date.slice(0, 10),
      duration: s.duration,
    });
    setShowForm(true);
    if (role === Role.ADMIN) setAdminTeacherId(s.teacherId);
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar sesión?")) return;
    try {
      await fetch(`/api/sessions/${id}`, { method: "DELETE", credentials: "include" });
      await load();
    } catch {
      alert("No se pudo eliminar");
    }
  }

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold text-slate-900">Módulo de sesiones de aprendizaje</h2>
      <Card className="grid gap-3 border-blue-100 md:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Área</span>
          <select className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900" value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
            <option value="ALL">Todas</option>
            {[...new Set(sessions.map((s) => s.area))].map((a) => (
              <option key={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Grado</span>
          <select className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900" value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
            <option value="ALL">Todos</option>
            {[...new Set(sessions.map((s) => s.grade))].map((g) => (
              <option key={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <Input label="Fecha" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        <div className="flex flex-col justify-end gap-2">
          <Button onClick={() => { setShowForm((prev) => !prev); if (showForm) { setEditingId(null); setForm(defaultSession); } }}>
            {showForm ? "Cerrar" : "Nueva sesión"}
          </Button>
        </div>
      </Card>

      {showForm && (
        <Card className="space-y-3 border-blue-100">
          {role === Role.ADMIN && (
            <label className="text-sm block max-w-md">
              <span className="mb-1 block font-medium text-slate-600">Docente</span>
              <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900" value={adminTeacherId} onChange={(e) => setAdminTeacherId(e.target.value)}>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </label>
          )}
          <SessionForm
            form={form}
            setForm={setForm}
            role={role === Role.ADMIN ? "ADMIN" : "TEACHER"}
            teacherGrade={session?.user?.assignedGradeName ?? undefined}
            teacherSection={session?.user?.assignedSectionName ?? undefined}
            onSubmit={submit}
            onClear={() => {
              setForm(defaultSession);
              setEditingId(null);
            }}
          />
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((s) => (
          <Card key={s.id} className="space-y-2 bg-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{s.area}</p>
            <h3 className="font-semibold text-slate-900">{s.title}</h3>
            <p className="text-sm text-slate-600">
              {s.grade} — {s.section} | {new Date(s.date).toLocaleDateString("es-PE")} | {s.duration}
            </p>
            <p className="text-xs text-slate-700">Competencia: {s.competence}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => alert(`${s.development.slice(0, 400)}...`)}>
                Ver detalle
              </Button>
              <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => startEdit(s)}>
                Editar
              </Button>
              <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => void remove(s.id)}>
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
