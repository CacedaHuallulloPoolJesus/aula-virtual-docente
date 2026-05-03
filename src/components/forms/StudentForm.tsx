"use client";

import { Button, Input } from "@/components/ui";
import type { Role } from "@/types/auth";
import type { StudentStatus } from "@/types/student";

export type StudentFormState = {
  code: string;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  grade: string;
  section: string;
  guardian: string;
  guardianPhone: string;
  address: string;
  status: StudentStatus;
};

type Props = {
  form: StudentFormState;
  setForm: React.Dispatch<React.SetStateAction<StudentFormState>>;
  role: Role | undefined;
  teacherGrade?: string;
  teacherSection?: string;
  editingId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

export function StudentForm({ form, setForm, role, teacherGrade, teacherSection, editingId, onSubmit, onCancel }: Props) {
  const isTeacher = role === "DOCENTE";
  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
      <Input label="Código" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} required />
      <Input label="DNI" value={form.dni} onChange={(e) => setForm((p) => ({ ...p, dni: e.target.value }))} required />
      <Input label="Nombres" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} required />
      <Input label="Apellidos" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} required />
      <Input label="Fecha de nacimiento" type="date" value={form.birthDate} onChange={(e) => setForm((p) => ({ ...p, birthDate: e.target.value }))} required />
      <Input label="Apoderado" value={form.guardian} onChange={(e) => setForm((p) => ({ ...p, guardian: e.target.value }))} required />
      <Input label="Teléfono apoderado" value={form.guardianPhone} onChange={(e) => setForm((p) => ({ ...p, guardianPhone: e.target.value }))} required />
      <Input label="Dirección" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} required />
      <Input label="Grado" value={isTeacher ? teacherGrade ?? "" : form.grade} onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))} disabled={isTeacher} required />
      <Input label="Sección" value={isTeacher ? teacherSection ?? "" : form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))} disabled={isTeacher} required />
      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-600">Estado</span>
        <select
          className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900"
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as StudentStatus }))}
        >
          <option value="ACTIVO">Activo</option>
          <option value="TRASLADO">Traslado</option>
          <option value="RETIRADO">Retirado</option>
        </select>
      </label>
      <div className="flex gap-2 md:col-span-2">
        <Button type="submit">{editingId ? "Actualizar estudiante" : "Guardar estudiante"}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Limpiar
        </Button>
      </div>
    </form>
  );
}
