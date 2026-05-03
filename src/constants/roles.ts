/** Alineado con Prisma `Role` */
export const APP_ROLES = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];
