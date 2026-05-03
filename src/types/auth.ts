export type Role = "ADMIN" | "TEACHER";

export type User = {
  id: string;
  email: string;
  password: string;
  role: Role;
  teacherId?: string;
};
