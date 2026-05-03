export type StudentStatus = "ACTIVO" | "TRASLADO" | "RETIRADO";

export type Student = {
  id: string;
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
