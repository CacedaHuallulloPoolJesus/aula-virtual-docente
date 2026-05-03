"use client";

import { StudentStatus } from "@prisma/client";
import { Button, Input } from "@/components/ui";
export type StudentFormState = {
  code: string;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  guardian: string;
  guardianPhone: string;
  address: string;
  status: StudentStatus;
};

type Props = {
  form: StudentFormState;
  setForm: React.Dispatch<React.SetStateAction<StudentFormState>>;
  editingId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

const statusLabel: Record<StudentStatus, string> = {
  [StudentStatus.ACTIVE]: "Activo",
  [StudentStatus.INACTIVE]: "Inactivo",
  [StudentStatus.TRANSFERRED]: "Traslado",
  [StudentStatus.WITHDRAWN]: "Retirado",
};

export function StudentForm({ form, setForm, editingId, onSubmit, onCancel }: Props) {
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
      <label className="text-sm md:col-span-2">
        <span className="mb-1 block font-medium text-primary/80">Estado</span>
        <select
          className="w-full max-w-md rounded-lg border border-secondary/20 bg-white p-2.5 text-foreground"
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as StudentStatus }))}
        >
          {(Object.keys(statusLabel) as StudentStatus[]).map((key) => (
            <option key={key} value={key}>
              {statusLabel[key]}
            </option>
          ))}
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
