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
  [TeacherStatus.ACTIVE]: "ACTIVO",
  [TeacherStatus.INACTIVE]: "INACTIVO",
};

export function TeacherForm({ form, setForm, grades, sections, editingId, onSubmit, onClear }: Props) {
  const sectionOptions = sections.filter((s) => s.gradeId === form.assignedGradeId);

  return (
    <form id="formulario-docente" className="grid gap-3 scroll-mt-24 md:grid-cols-3" onSubmit={onSubmit}>
      <Input label="Nombres" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} required />
      <Input label="Apellidos" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} required />
      <Input label="DNI" value={form.dni} onChange={(e) => setForm((p) => ({ ...p, dni: e.target.value }))} />
      <Input label="Correo institucional" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
      <Input
        label={editingId ? "Nueva contraseña (opcional)" : "Contraseña"}
        type="password"
        value={form.password}
        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        required={!editingId}
      />
      <label className="text-sm">
        <span className="mb-1 block font-medium text-primary/80">Grado asignado</span>
        <select
          className="w-full rounded-lg border border-secondary/20 bg-white p-2.5 text-foreground"
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
        <span className="mb-1 block font-medium text-primary/80">Sección asignada</span>
        <select
          className="w-full rounded-lg border border-secondary/20 bg-white p-2.5 text-foreground"
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
        <span className="mb-1 block font-medium text-primary/80">Estado</span>
        <select
          className="w-full rounded-lg border border-secondary/20 bg-white p-2.5 text-foreground"
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
        <Button type="submit" variant="primary" className="cursor-pointer">
          {editingId ? "Actualizar docente" : "Registrar docente"}
        </Button>
        <Button type="button" variant="secondary" className="cursor-pointer" onClick={onClear}>
          Limpiar
        </Button>
      </div>
    </form>
  );
}
