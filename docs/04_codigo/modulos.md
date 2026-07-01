# Módulos del Sistema

## Módulo Login

Permite el acceso seguro al sistema mediante autenticación de usuarios.

Archivos relacionados:
- src/app/login/page.tsx
- src/app/api/auth/[...nextauth]/route.ts
- src/lib/auth.ts

## Módulo Dashboard

Presenta indicadores académicos generales.

Archivos relacionados:
- src/app/(main)/dashboard/page.tsx
- src/app/api/dashboard/route.ts

## Módulo Estudiantes

Permite registrar, editar, consultar y eliminar estudiantes.

Archivos relacionados:
- src/app/(main)/estudiantes/page.tsx
- src/app/api/students/route.ts
- src/components/forms/StudentForm.tsx

## Módulo Docentes

Permite administrar docentes del sistema.

Archivos relacionados:
- src/app/(main)/docentes/page.tsx
- src/components/forms/TeacherForm.tsx

## Módulo Asistencia

Permite registrar y consultar asistencia estudiantil.

Archivos relacionados:
- src/app/(main)/asistencia/page.tsx
- src/app/api/attendance/route.ts

## Módulo Notas

Permite registrar y consultar calificaciones.

Archivos relacionados:
- src/app/(main)/notas/page.tsx
- src/app/api/grades/route.ts
- src/components/forms/GradesForm.tsx

## Módulo Sesiones

Permite crear y gestionar sesiones de aprendizaje.

Archivos relacionados:
- src/app/(main)/sesiones/page.tsx
- src/app/api/sessions/route.ts
- src/components/forms/SessionForm.tsx

## Módulo IA Sesiones

Permite generar sesiones de aprendizaje mediante inteligencia artificial.

Archivos relacionados:
- src/app/(main)/ia-sesiones/page.tsx
- src/components/forms/IaSessionForm.tsx
- src/lib/ai-session-generator.ts
- src/lib/agents.ts

## Módulo Reportes

Permite consultar reportes académicos y exportar información.

Archivos relacionados:
- src/app/(main)/reportes/page.tsx
- src/app/api/export/route.ts
- src/lib/pdf-export.ts