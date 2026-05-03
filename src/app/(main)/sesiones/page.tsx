"use client";

import { useMemo, useState } from "react";
import { Button, Card, Input } from "@/components/ui";
import { SessionForm, type SessionFormState } from "@/components/forms/SessionForm";
import { useAppData } from "@/components/providers/AppDataProvider";

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
  date: "",
  duration: "",
};

export default function SesionesPage() {
  const { data, auth, addSession, deleteSession } = useAppData();
  const teacher = data.teachers.find((t) => t.id === auth.user?.teacherId);
  const [form, setForm] = useState(defaultSession);
  const [showForm, setShowForm] = useState(false);
  const [areaFilter, setAreaFilter] = useState("ALL");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const list = useMemo(() => {
    let items = auth.user?.role === "ADMIN" ? data.sessions : data.sessions.filter((s) => s.teacherId === auth.user?.teacherId);
    if (areaFilter !== "ALL") items = items.filter((item) => item.area === areaFilter);
    if (gradeFilter !== "ALL") items = items.filter((item) => item.grade === gradeFilter);
    if (dateFilter) items = items.filter((item) => item.date === dateFilter);
    return items;
  }, [data.sessions, auth.user?.role, auth.user?.teacherId, areaFilter, gradeFilter, dateFilter]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.user?.teacherId) return;
    addSession({
      ...form,
      grade: auth.user.role === "DOCENTE" ? teacher?.grade || form.grade : form.grade,
      section: auth.user.role === "DOCENTE" ? teacher?.section || form.section : form.section,
      teacherId: auth.user.teacherId,
      generatedByIa: false,
    });
    setForm(defaultSession);
    setShowForm(false);
  }

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold text-slate-900">Módulo de sesiones de aprendizaje</h2>
      <Card className="grid gap-3 border-blue-100 md:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Área</span>
          <select className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900" value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
            <option value="ALL">Todas</option>
            {[...new Set(data.sessions.map((s) => s.area))].map((a) => (
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
            {[...new Set(data.sessions.map((s) => s.grade))].map((g) => (
              <option key={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <Input label="Fecha" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        <div className="flex items-end">
          <Button onClick={() => setShowForm((prev) => !prev)}>{showForm ? "Cerrar" : "Nueva sesión"}</Button>
        </div>
      </Card>

      {showForm && (
        <Card className="border-blue-100">
          <SessionForm
            form={form}
            setForm={setForm}
            role={auth.user?.role}
            teacherGrade={teacher?.grade}
            teacherSection={teacher?.section}
            onSubmit={submit}
            onClear={() => setForm(defaultSession)}
          />
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((session) => (
          <Card key={session.id} className="space-y-2 bg-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{session.area}</p>
            <h3 className="font-semibold text-slate-900">{session.title}</h3>
            <p className="text-sm text-slate-600">
              {session.grade} - {session.section} | {session.date} | {session.duration}
            </p>
            <p className="text-xs text-slate-700">Competencia: {session.competence}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => alert(`Detalle:\n${session.development}`)}>
                Ver detalle
              </Button>
              <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => alert("Edición preparada para versión ampliada.")}>
                Editar
              </Button>
              <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => deleteSession(session.id)}>
                Eliminar
              </Button>
              <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => alert("Exportación PDF preparada.")}>
                Exportar PDF
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
