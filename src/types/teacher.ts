export type TeacherStatus = "ACTIVO" | "INACTIVO";

export type Teacher = {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  section: string;
  status: TeacherStatus;
};
