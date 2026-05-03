export type AttendanceRecord = {
  id: string;
  date: string;
  studentId: string;
  /** Valores Prisma (`PRESENT`, `LATE`, …) o etiquetas legacy en español */
  status: string;
  justification?: string;
  teacherId: string;
};
