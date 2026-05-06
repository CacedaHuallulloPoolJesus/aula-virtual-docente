"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import type { SystemConfig } from "@prisma/client";
import { Button, Card, ConfirmDialog, Input, Modal, useToast } from "@/components/ui";
import { SessionForm, type SessionFormState } from "@/components/forms/SessionForm";
import { apiJson } from "@/lib/api-client";
import { buildAcademicPdfWithLogo } from "@/lib/pdf-export";

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
  const { toast } = useToast();
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
  const [viewSession, setViewSession] = useState<LearningSessionRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      toast(role === Role.ADMIN ? "Seleccione docente." : "Solo docentes pueden crear sesiones manuales.", "warning");
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
        toast("Sesión actualizada.", "success");
      } else {
        await apiJson("/api/sessions", { method: "POST", body: JSON.stringify(body) });
        toast("Sesión creada.", "success");
      }
      setForm(defaultSession);
      setShowForm(false);
      setEditingId(null);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al guardar", "error");
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/sessions/${deleteId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        toast(await res.text(), "error");
        return;
      }
      toast("Sesión eliminada.", "success");
      setDeleteId(null);
      await load();
    } catch {
      toast("No se pudo eliminar la sesión.", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function exportSessionPdf(s: LearningSessionRow) {
    try {
      const config = await apiJson<SystemConfig | null>("/api/system-config").catch(() => null);
      const doc = await buildAcademicPdfWithLogo({
        config,
        title: s.generatedByIa ? "Sesión de aprendizaje (IA)" : "Sesión de aprendizaje",
        subtitle: `${s.title} · ${s.area} · ${s.grade} ${s.section} · ${new Date(s.date).toLocaleDateString("es-PE")}`,
        teacherName: session?.user?.name ?? session?.user?.email ?? "",
        gradeSection: `${s.grade} — ${s.section}`,
        columns: [
          { header: "Sección", dataKey: "k" },
          { header: "Contenido", dataKey: "v" },
        ],
        rows: [
          { k: "Competencia", v: s.competence },
          { k: "Capacidad", v: s.capacity },
          { k: "Desempeño", v: s.performance },
          { k: "Propósito", v: s.learningPurpose },
          { k: "Evidencia", v: s.learningEvidence },
          { k: "Inicio", v: s.startActivity },
          { k: "Desarrollo", v: s.development },
          { k: "Cierre", v: s.closure },
          { k: "Recursos", v: s.resources },
          { k: "Evaluación", v: s.evaluation },
        ],
      });
      doc.save(`sesion-${s.id.slice(0, 8)}.pdf`);
      toast("PDF generado correctamente.", "success");
    } catch {
      toast("No se pudo exportar el PDF.", "error");
    }
  }

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold text-primary">Sesiones de Aprendizaje</h2>
      <Card className="grid gap-3 md:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Área</span>
          <select
            className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-900"
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
          >
            <option value="ALL">Todas</option>
            {[...new Set(sessions.map((s) => s.area))].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Grado</span>
          <select
            className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-900"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="ALL">Todos</option>
            {[...new Set(sessions.map((s) => s.grade))].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <Input label="Fecha" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        <div className="flex flex-col justify-end gap-2">
          <Button
            type="button"
            className="cursor-pointer"
            onClick={() => {
              setShowForm((prev) => !prev);
              if (showForm) {
                setEditingId(null);
                setForm(defaultSession);
              }
            }}
          >
            {showForm ? "Cerrar" : "Nueva sesión"}
          </Button>
        </div>
      </Card>

      {showForm && (
        <Card id="sesion-formulario" className="space-y-3 scroll-mt-24">
          {role === Role.ADMIN && (
            <label className="block max-w-md text-sm">
              <span className="mb-1 block font-medium text-slate-600">Docente</span>
              <select
                className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900"
                value={adminTeacherId}
                onChange={(e) => setAdminTeacherId(e.target.value)}
              >
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
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{s.area}</p>
            <h3 className="font-semibold text-primary">{s.title}</h3>
            <p className="text-sm text-foreground/70">
              {s.grade} — {s.section} | {new Date(s.date).toLocaleDateString("es-PE")} | {s.duration}
            </p>
            <p className="text-xs text-foreground/75">Competencia: {s.competence}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" className="cursor-pointer px-2 py-1 text-xs" type="button" onClick={() => setViewSession(s)}>
                Ver
              </Button>
              <Button variant="secondary" className="cursor-pointer px-2 py-1 text-xs" type="button" onClick={() => void exportSessionPdf(s)}>
                Exportar PDF
              </Button>
              <Button variant="secondary" className="cursor-pointer px-2 py-1 text-xs" type="button" onClick={() => startEdit(s)}>
                Editar
              </Button>
              <Button variant="danger" className="cursor-pointer px-2 py-1 text-xs" type="button" onClick={() => setDeleteId(s.id)}>
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={viewSession !== null} title={viewSession?.title ?? "Detalle"} onClose={() => setViewSession(null)} className="max-w-lg">
        {viewSession ? (
          <div className="space-y-2 text-sm text-foreground/90">
            <p>
              <strong>Área:</strong> {viewSession.area}
            </p>
            <p>
              <strong>Grado / Sección:</strong> {viewSession.grade} — {viewSession.section}
            </p>
            <p>
              <strong>Fecha:</strong> {new Date(viewSession.date).toLocaleDateString("es-PE")}
            </p>
            <p>
              <strong>Competencia:</strong> {viewSession.competence}
            </p>
            <p>
              <strong>Propósito:</strong> {viewSession.learningPurpose}
            </p>
            <p>
              <strong>Inicio:</strong> {viewSession.startActivity}
            </p>
            <p>
              <strong>Desarrollo:</strong> {viewSession.development}
            </p>
            <p>
              <strong>Cierre:</strong> {viewSession.closure}
            </p>
            <p>
              <strong>Recursos:</strong> {viewSession.resources}
            </p>
            <p>
              <strong>Evaluación:</strong> {viewSession.evaluation}
            </p>
            <Button type="button" variant="secondary" className="cursor-pointer mt-2" onClick={() => void exportSessionPdf(viewSession)}>
              Exportar esta sesión (PDF)
            </Button>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Eliminar sesión"
        description="Se eliminará permanentemente esta sesión de aprendizaje."
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteLoading}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
