import type { TeacherStatus as PrismaTeacherStatus } from "@prisma/client";

export type TeacherStatus = PrismaTeacherStatus;

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
