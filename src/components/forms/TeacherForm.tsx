"use client";

import { TeacherStatus } from "@prisma/client";
import { Button, Input } from "@/components/ui";

export type TeacherFormState = {
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  password: string;
  assignedGradeId: string;
  assignedSectionId: string;
  status: TeacherStatus;
};

export type CatalogGrade = { id: string; name: string };
export type CatalogSection = { id: string; name: string; gradeId: string };

type Props = {
  form: TeacherFormState;
  setForm: React.Dispatch<React.SetStateAction<TeacherFormState>>;
  grades: CatalogGrade[];
  sections: CatalogSection[];
  editingId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
};

const teacherStatusLabel: Record<TeacherStatus, string> = {
  [TeacherStatus.ACTIVE]: "Activo",
  [TeacherStatus.INACTIVE]: "Inactivo",
};

export function TeacherForm({ form, setForm, grades, sections, editingId, onSubmit, onClear }: Props) {
  const sectionOptions = sections.filter((s) => s.gradeId === form.assignedGradeId);

  return (
    <form className="grid gap-3 md:grid-cols-3" onSubmit={onSubmit}>
      <Input label="Nombre" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} required />
      <Input label="Apellidos" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} required />
      <Input label="DNI" value={form.dni} onChange={(e) => setForm((p) => ({ ...p, dni: e.target.value }))} />
      <Input label="Correo" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
      <Input
        label={editingId ? "Nueva contraseña (opcional)" : "Contraseña"}
        type="password"
        value={form.password}
        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        required={!editingId}
      />
      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-600">Grado asignado</span>
        <select
          className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900"
          value={form.assignedGradeId}
          onChange={(e) => setForm((p) => ({ ...p, assignedGradeId: e.target.value, assignedSectionId: "" }))}
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
        <span className="mb-1 block font-medium text-slate-600">Sección asignada</span>
        <select
          className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900"
          value={form.assignedSectionId}
          onChange={(e) => setForm((p) => ({ ...p, assignedSectionId: e.target.value }))}
          disabled={!form.assignedGradeId}
        >
          <option value="">Seleccione</option>
          {sectionOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-600">Estado</span>
        <select
          className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900"
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as TeacherStatus }))}
        >
          {(Object.keys(teacherStatusLabel) as TeacherStatus[]).map((key) => (
            <option key={key} value={key}>
              {teacherStatusLabel[key]}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end gap-2 md:col-span-2">
        <Button type="submit" variant="primary">
          {editingId ? "Actualizar docente" : "Nuevo docente"}
        </Button>
        <Button type="button" variant="secondary" onClick={onClear}>
          Limpiar
        </Button>
      </div>
    </form>
  );
}
