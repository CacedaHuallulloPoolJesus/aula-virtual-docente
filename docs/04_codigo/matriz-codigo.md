# Matriz de Código

| Módulo | Funcionalidad | Archivo Principal | Archivo de Soporte | Descripción |
|--------|---------------|------------------|--------------------|-------------|
| Login | Iniciar sesión | src/app/login/page.tsx | src/lib/auth.ts | Permite autenticar usuarios. |
| Dashboard | Mostrar indicadores | src/app/(main)/dashboard/page.tsx | src/app/api/dashboard/route.ts | Presenta KPIs académicos. |
| Estudiantes | Gestionar estudiantes | src/app/(main)/estudiantes/page.tsx | src/components/forms/StudentForm.tsx | Registra y administra estudiantes. |
| Docentes | Gestionar docentes | src/app/(main)/docentes/page.tsx | src/components/forms/TeacherForm.tsx | Administra docentes. |
| Asistencia | Registrar asistencia | src/app/(main)/asistencia/page.tsx | src/app/api/attendance/route.ts | Registra asistencia diaria. |
| Notas | Registrar notas | src/app/(main)/notas/page.tsx | src/components/forms/GradesForm.tsx | Gestiona calificaciones. |
| Sesiones | Crear sesiones | src/app/(main)/sesiones/page.tsx | src/components/forms/SessionForm.tsx | Administra sesiones de aprendizaje. |
| IA Sesiones | Generar sesiones IA | src/app/(main)/ia-sesiones/page.tsx | src/lib/ai-session-generator.ts | Genera sesiones automáticamente. |
| Reportes | Exportar reportes | src/app/(main)/reportes/page.tsx | src/lib/pdf-export.ts | Permite generar reportes académicos. |
| Configuración | Parámetros del sistema | src/app/(main)/configuracion/page.tsx | src/app/api/system-config/route.ts | Administra configuración general. |
