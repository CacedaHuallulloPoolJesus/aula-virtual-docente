# API REST del Sistema

## Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | /api/auth | Gestiona autenticación mediante NextAuth. |

## Estudiantes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/students | Lista estudiantes registrados. |
| POST | /api/students | Registra un nuevo estudiante. |

## Asistencia

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/attendance | Consulta registros de asistencia. |
| POST | /api/attendance | Registra asistencia diaria. |

## Notas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/grades | Consulta calificaciones. |
| POST | /api/grades | Registra o actualiza notas. |

## Sesiones

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/sessions | Lista sesiones de aprendizaje. |
| POST | /api/sessions | Registra una nueva sesión. |

## Dashboard

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/dashboard | Obtiene indicadores académicos. |

## Agentes IA

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/agents | Lista agentes disponibles. |
| POST | /api/agents/log | Registra uso de agente IA. |

## Exportación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/export | Genera archivo exportable en PDF. |