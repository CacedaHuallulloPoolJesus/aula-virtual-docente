# Arquitectura del sistema

## Visión general

El **Sistema Integral de Aula Virtual Docente** es una aplicación **Next.js (App Router)** con **TypeScript**. La interfaz principal combina:

- **Capa de presentación**: páginas en `src/app`, componentes reutilizables en `src/components`, estilos con **Tailwind CSS**.
- **Estado de demostración (demo)**: `AppDataProvider` persiste usuarios, docentes, estudiantes, asistencia, notas y sesiones en **localStorage**, con login simulado por roles `ADMIN` y `DOCENTE`.
- **Persistencia institucional (Prisma)**: modelos en `prisma/schema.prisma` orientados a **SQLite** en local y preparados para **PostgreSQL** en producción; rutas API bajo `src/app/api` para datos servidor y NextAuth.

## Agrupación de rutas

Las pantallas autenticadas viven en el grupo de rutas **`(main)`** (`src/app/(main)/…`). El nombre del grupo **no aparece en la URL**; por ejemplo `(main)/dashboard/page.tsx` se sirve como `/dashboard`. El layout del grupo aplica `AppLayout` (sidebar, barra superior, guard de sesión demo).

## Módulos principales

| Ruta | Rol típico | Descripción breve |
|------|------------|-------------------|
| `/dashboard` | Ambos | KPIs y gráficos resumidos |
| `/docentes` | Admin | CRUD docentes |
| `/estudiantes` | Ambos | Estudiantes por aula o global |
| `/asistencia` | Docente / Admin | Registro de asistencia |
| `/notas` | Docente / Admin | Notas por área y bimestre |
| `/sesiones` | Docente | Sesiones de aprendizaje manuales |
| `/ia-sesiones` | Docente | Generador local de sesiones IA |
| `/agentes-ia` | Ambos | Agentes pedagógicos simulados |
| `/reportes` | Ambos | Reportes y exportaciones |
| `/grados-secciones`, `/configuracion` | Admin | Catálogos y ajustes |

## Agentes IA

La lógica está centralizada en `src/lib/agents.ts`. Opcionalmente se registra cada ejecución vía `POST /api/agents/log` y el modelo Prisma `AgentLog`.

## Convenciones de código

- Tipos de dominio en `src/types`.
- Constantes de navegación y académicas en `src/constants`.
- Componentes UI base con nombres **PascalCase** en `src/components/ui`.
- Formularios reutilizables en `src/components/forms`.
