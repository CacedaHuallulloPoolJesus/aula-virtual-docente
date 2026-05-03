# Usuarios y credenciales demo

El login **local** (pantalla `/login`) valida contra los usuarios definidos en `src/lib/mock-data.ts` (`initialMockData.users`). Contraseña común de demo:

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | `admin@aula.com` | `123456` |
| Docente 1 | `docente1@aula.com` | `123456` |
| Docente 2 | `docente2@aula.com` | `123456` |

Tras iniciar sesión, el estado se guarda en `localStorage` bajo la clave configurada en `AppDataProvider`.

**NextAuth / Prisma**: si se usa el flujo con base de datos Prisma, las credenciales serán las del seed (`prisma/seed.ts`) y contraseñas hasheadas; consulte ese archivo para usuarios servidor.
