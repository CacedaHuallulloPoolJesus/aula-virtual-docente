# Arquitectura del Sistema

## Objetivo

Describir la arquitectura de software utilizada en el desarrollo del **Sistema Integral de Aula Virtual Docente**, identificando las principales capas, componentes tecnológicos y flujo de comunicación entre el cliente, servidor, base de datos y servicios de inteligencia artificial.

---

# Arquitectura General

El Sistema Integral de Aula Virtual Docente fue desarrollado utilizando una arquitectura cliente-servidor basada en **Next.js (App Router)** y **TypeScript**, permitiendo una separación clara entre la interfaz de usuario, la lógica de negocio y la persistencia de datos.

La solución está conformada por las siguientes capas:

- Capa de presentación.
- Capa de aplicación.
- Capa de servicios.
- Capa de persistencia.
- Capa de inteligencia artificial.

---

# Arquitectura de Capas

```text
                Usuario
                   │
                   ▼
        Interfaz Web (Next.js)
                   │
                   ▼
          API Routes (Next.js)
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
 Lógica de negocio      Servicios IA
(src/lib, validaciones) (AI Session Generator)
        │
        ▼
      Prisma ORM
        │
        ▼
 PostgreSQL / SQLite
```

---

# Componentes del Sistema

## Capa de Presentación

Corresponde a la interfaz utilizada por los usuarios para interactuar con el sistema.

Componentes principales:

- Dashboard
- Login
- Docentes
- Estudiantes
- Asistencia
- Notas
- Sesiones
- IA Sesiones
- Reportes
- Configuración

Implementación:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS

---

## Capa de Aplicación

Implementa la lógica de negocio del sistema mediante las rutas API de Next.js.

Principales servicios:

- Gestión de docentes.
- Gestión de estudiantes.
- Gestión de asistencia.
- Gestión de notas.
- Gestión de sesiones.
- Dashboard.
- Configuración.
- Reportes.

Ubicación:

```
src/app/api/
```

---

## Capa de Servicios

Contiene funciones reutilizables utilizadas por toda la aplicación.

Principales módulos:

- auth.ts
- api-client.ts
- prisma.ts
- validations.ts
- pdf-export.ts
- ai-session-generator.ts
- agents.ts

Ubicación:

```
src/lib/
```

---

## Capa de Persistencia

La persistencia de información se realiza mediante Prisma ORM.

Durante el desarrollo se utiliza SQLite.

Para producción la arquitectura está preparada para PostgreSQL.

Modelos principales:

- User
- Teacher
- Student
- Attendance
- Grade
- Session
- AgentLog
- SystemConfig

Ubicación:

```
prisma/schema.prisma
```

---

## Capa de Inteligencia Artificial

La generación inteligente de sesiones se implementa mediante un servicio especializado encargado de construir sesiones pedagógicas a partir de información proporcionada por el docente.

Componentes principales:

- ai-session-generator.ts
- agents.ts
- API /agents

Funciones principales:

- Generación automática de sesiones.
- Recomendaciones pedagógicas.
- Registro de agentes utilizados.

---

# Organización de Rutas

Las pantallas autenticadas se encuentran agrupadas dentro de:

```
src/app/(main)
```

El grupo `(main)` no forma parte de la URL pública.

Por ejemplo:

```
src/app/(main)/dashboard/page.tsx
```

se publica como:

```
/dashboard
```

---

# Módulos Funcionales

| Módulo | Descripción |
|---------|-------------|
| Dashboard | Indicadores y estadísticas académicas |
| Docentes | Administración de docentes |
| Estudiantes | Gestión de estudiantes |
| Asistencia | Registro y consulta de asistencia |
| Notas | Registro de calificaciones |
| Sesiones | Gestión de sesiones de aprendizaje |
| IA Sesiones | Generación automática mediante IA |
| Agentes IA | Administración de agentes inteligentes |
| Reportes | Reportes académicos y exportación PDF |
| Configuración | Parámetros generales del sistema |

---

# Convenciones de Desarrollo

Durante la implementación del sistema se siguieron las siguientes convenciones:

- Arquitectura basada en componentes.
- Separación entre frontend y backend.
- Uso de TypeScript para tipado estático.
- Componentes reutilizables.
- Validaciones centralizadas.
- Acceso a datos mediante Prisma ORM.
- Organización modular del proyecto.

---

# Tecnologías Utilizadas

| Tecnología | Uso |
|------------|-----|
| Next.js | Framework principal |
| React | Desarrollo de interfaces |
| TypeScript | Lenguaje de programación |
| Tailwind CSS | Estilos |
| Prisma ORM | Acceso a datos |
| PostgreSQL | Base de datos en producción |
| SQLite | Base de datos de desarrollo |
| NextAuth | Autenticación |
| PDF Export | Generación de reportes |
| Inteligencia Artificial | Generación automática de sesiones |