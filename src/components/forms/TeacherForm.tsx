"use client";

import { Button, Input } from "@/components/ui";
import type { TeacherStatus } from "@/types/teacher";

export type TeacherFormState = {
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  section: string;
  status: TeacherStatus;
  password: string;
};

type Props = {
  form: TeacherFormState;
  setForm: React.Dispatch<React.SetStateAction<TeacherFormState>>;
  editingId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
};

export function TeacherForm({ form, setForm, editingId, onSubmit, onClear }: Props) {
  return (
    <form className="grid gap-3 md:grid-cols-3" onSubmit={onSubmit}>
      <Input label="Nombre" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} required />
      <Input label="Apellidos" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} required />
      <Input label="Correo" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
      <Input label="Contraseña" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
      <Input label="Grado asignado" value={form.grade} onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))} required />
      <Input label="Sección asignada" value={form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))} required />
      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-600">Estado</span>
        <select
          className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900"
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as TeacherStatus }))}
        >
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
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
