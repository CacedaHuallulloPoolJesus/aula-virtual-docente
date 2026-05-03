"use client";

import { Button, Input } from "@/components/ui";
import type { Role } from "@/types/auth";

export type SessionFormState = {
  title: string;
  grade: string;
  section: string;
  area: string;
  competence: string;
  capacity: string;
  performance: string;
  purpose: string;
  evidence: string;
  start: string;
  development: string;
  closure: string;
  resources: string;
  evaluation: string;
  date: string;
  duration: string;
};

type Props = {
  form: SessionFormState;
  setForm: React.Dispatch<React.SetStateAction<SessionFormState>>;
  role: Role | undefined;
  teacherGrade?: string;
  teacherSection?: string;
  onSubmit: (e: React.FormEvent) => void;
  onClear?: () => void;
};

export function SessionForm({ form, setForm, role, teacherGrade, teacherSection, onSubmit, onClear }: Props) {
  const isTeacher = role === "DOCENTE";
  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
      <Input label="Título" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
      <Input label="Área curricular" value={form.area} onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))} required />
      <Input label="Grado" value={isTeacher ? teacherGrade ?? "" : form.grade} onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))} disabled={isTeacher} required />
      <Input label="Sección" value={isTeacher ? teacherSection ?? "" : form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))} disabled={isTeacher} required />
      <Input label="Competencia" value={form.competence} onChange={(e) => setForm((p) => ({ ...p, competence: e.target.value }))} required />
      <Input label="Capacidad" value={form.capacity} onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))} required />
      <Input label="Desempeño" value={form.performance} onChange={(e) => setForm((p) => ({ ...p, performance: e.target.value }))} required />
      <Input label="Propósito" value={form.purpose} onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))} required />
      <Input label="Evidencia" value={form.evidence} onChange={(e) => setForm((p) => ({ ...p, evidence: e.target.value }))} required />
      <Input label="Inicio" value={form.start} onChange={(e) => setForm((p) => ({ ...p, start: e.target.value }))} required />
      <Input label="Desarrollo" value={form.development} onChange={(e) => setForm((p) => ({ ...p, development: e.target.value }))} required />
      <Input label="Cierre" value={form.closure} onChange={(e) => setForm((p) => ({ ...p, closure: e.target.value }))} required />
      <Input label="Recursos" value={form.resources} onChange={(e) => setForm((p) => ({ ...p, resources: e.target.value }))} required />
      <Input label="Evaluación" value={form.evaluation} onChange={(e) => setForm((p) => ({ ...p, evaluation: e.target.value }))} required />
      <Input label="Fecha" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required />
      <Input label="Duración" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} required />
      <div className="flex flex-wrap gap-2 md:col-span-2">
        <Button type="submit">Guardar sesión</Button>
        {onClear && (
          <Button type="button" variant="secondary" onClick={onClear}>
            Limpiar
          </Button>
        )}
      </div>
    </form>
  );
}
