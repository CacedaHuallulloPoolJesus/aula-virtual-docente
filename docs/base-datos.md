# Base de datos (Prisma)

## Proveedor

- **Local / demo**: SQLite (`DATABASE_URL="file:./dev.db"`).
- **Producción**: se puede cambiar el `provider` del datasource a `postgresql` y la URL correspondiente, manteniendo el mismo esquema lógico (ajustando migraciones según el motor).

## Modelos principales (resumen)

| Área | Modelos representativos |
|------|-------------------------|
| Identidad | `User`, `Account`, `Session`, `VerificationToken` (NextAuth) |
| Docencia | `Teacher`, `Course`, `LearningSession`, `GeneratedSession` |
| Académico | `Student`, `Grade`, `Section`, `Attendance`, `GradeRecord` (según versión del esquema) |
| Agentes | `AgentLog` — registro opcional de invocaciones (`agentName`, `input`, `output`, `userId`, `createdAt`) |

> Consulte siempre `prisma/schema.prisma` como fuente de verdad; los nombres exactos pueden evolucionar con migraciones.

## Comandos útiles

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

En Windows, el script `npm run setup:demo` fuerza `DATABASE_URL` para generar cliente, migrar y sembrar datos de ejemplo.
