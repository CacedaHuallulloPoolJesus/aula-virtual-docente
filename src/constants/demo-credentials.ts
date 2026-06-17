import { Role } from "@prisma/client";

/** Credenciales demo del login local (NextAuth + Prisma). Fuente única para seed y documentación. */
export const demoCredentials = [
  {
    email: "admin@virgendelcarmen.edu.pe",
    password: "Admin123*",
    role: Role.ADMIN,
  },
  {
    email: "docente1@virgendelcarmen.edu.pe",
    password: "123456",
    role: Role.TEACHER,
  },
  {
    email: "docente2@virgendelcarmen.edu.pe",
    password: "123456",
    role: Role.TEACHER,
  },
] as const;
