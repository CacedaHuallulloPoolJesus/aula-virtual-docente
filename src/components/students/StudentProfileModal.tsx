"use client";

import { AttendanceStatus, StudentStatus } from "@prisma/client";
import { Modal } from "@/components/ui/Modal";

export type ProfileStudent = {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  dni: string | null;
  birthDate: string | null;
  guardian: string | null;
  guardianPhone: string | null;
  address: string | null;
  status: StudentStatus;
  grade: { name: string };
  section: { name: string };
};

type AttendanceRow = { date: string; status: AttendanceStatus; justification: string | null };
type GradeRow = { area: string; note1: number; note2: number; note3: number; period: string };

function statusStudentLabel(s: StudentStatus): string {
  switch (s) {
    case StudentStatus.ACTIVE:
      return "Activo";
    case StudentStatus.INACTIVE:
      return "Inactivo";
    case StudentStatus.TRANSFERRED:
      return "Traslado";
    case StudentStatus.WITHDRAWN:
      return "Retirado";
    default:
      return String(s);
  }
}

function statusAttendanceLabel(s: AttendanceStatus): string {
  switch (s) {
    case AttendanceStatus.PRESENT:
      return "Presente";
    case AttendanceStatus.LATE:
      return "Tarde";
    case AttendanceStatus.ABSENT:
      return "Falta";
    case AttendanceStatus.JUSTIFIED:
      return "Justificado";
    default:
      return String(s);
  }
}

type Props = {
  open: boolean;
  student: ProfileStudent | null;
  attendance: AttendanceRow[];
  grades: GradeRow[];
  loading?: boolean;
  onClose: () => void;
};

export function StudentProfileModal({ open, student, attendance, grades, loading, onClose }: Props) {
  if (!open || !student) return null;

  const attCounts = attendance.reduce(
    (acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<AttendanceStatus, number>>,
  );

  return (
    <Modal open={open} title="Ficha del estudiante" onClose={onClose} className="max-w-xl">
      {loading ? (
        <p className="text-sm text-secondary">Cargando resumen académico…</p>
      ) : (
        <div className="space-y-4 text-sm text-foreground/90">
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-secondary">Código</dt>
              <dd className="font-medium text-primary">{student.code}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-secondary">Estado</dt>
              <dd>{statusStudentLabel(student.status)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase text-secondary">Nombres y apellidos</dt>
              <dd className="font-medium text-primary">
                {student.firstName} {student.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-secondary">DNI</dt>
              <dd>{student.dni ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-secondary">Fecha de nacimiento</dt>
              <dd>{student.birthDate ? new Date(student.birthDate).toLocaleDateString("es-PE") : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-secondary">Grado</dt>
              <dd>{student.grade.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-secondary">Sección</dt>
              <dd>{student.section.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-secondary">Apoderado</dt>
              <dd>{student.guardian ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-secondary">Teléfono apoderado</dt>
              <dd>{student.guardianPhone ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase text-secondary">Dirección</dt>
              <dd>{student.address ?? "—"}</dd>
            </div>
          </dl>

          <div className="rounded-xl border border-secondary/15 bg-cream/40 p-3">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">Resumen de asistencia</h3>
            {attendance.length === 0 ? (
              <p className="text-xs text-foreground/60">No hay registros de asistencia visibles para este estudiante.</p>
            ) : (
              <>
                <ul className="mb-2 flex flex-wrap gap-2 text-xs">
                  {(Object.keys(attCounts) as AttendanceStatus[]).map((k) => (
                    <li key={k} className="rounded-full bg-white px-2 py-1 ring-1 ring-secondary/15">
                      {statusAttendanceLabel(k)}: {attCounts[k]}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-foreground/65">Últimos {Math.min(8, attendance.length)} registros:</p>
                <ul className="mt-1 max-h-28 space-y-1 overflow-y-auto text-xs">
                  {attendance.slice(0, 8).map((a, i) => (
                    <li key={`${a.date}-${i}`} className="flex justify-between gap-2 border-b border-secondary/10 py-0.5">
                      <span>{new Date(a.date).toLocaleDateString("es-PE")}</span>
                      <span className="font-medium">{statusAttendanceLabel(a.status)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="rounded-xl border border-secondary/15 bg-white p-3">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">Resumen de notas</h3>
            {grades.length === 0 ? (
              <p className="text-xs text-foreground/60">No hay evaluaciones registradas visibles para este estudiante.</p>
            ) : (
              <ul className="max-h-36 space-y-1 overflow-y-auto text-xs">
                {grades.map((g, idx) => {
                  const avg = ((g.note1 + g.note2 + g.note3) / 3).toFixed(1);
                  return (
                    <li key={`${g.area}-${idx}`} className="flex justify-between gap-2 border-b border-secondary/10 py-0.5">
                      <span>
                        {g.area} <span className="text-foreground/50">({g.period})</span>
                      </span>
                      <span className="font-semibold text-primary">Prom. {avg}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
