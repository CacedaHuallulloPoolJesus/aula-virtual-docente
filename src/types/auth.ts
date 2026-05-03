export type Role = "ADMIN" | "DOCENTE";

export type User = {
  id: string;
  email: string;
  password: string;
  role: Role;
  teacherId?: string;
};
