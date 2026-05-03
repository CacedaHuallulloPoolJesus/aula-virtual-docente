export type AttendanceStatus = "PRESENTE" | "TARDE" | "FALTA" | "JUSTIFICADO";

export type AttendanceRecord = {
  id: string;
  date: string;
  studentId: string;
  status: AttendanceStatus;
  justification?: string;
  teacherId: string;
};
