# Plan de Pruebas

## Objetivo

Verificar que el Sistema Integral de Aula Virtual Docente funcione correctamente en sus módulos principales: autenticación, gestión académica, planificación pedagógica, generación inteligente de sesiones, reportes y configuración.

## Alcance

Las pruebas se aplicarán a los siguientes módulos:

- Login
- Dashboard
- Docentes
- Estudiantes
- Grados y secciones
- Asistencia
- Notas
- Sesiones
- IA Sesiones
- Reportes
- Configuración

## Tipos de pruebas

| Tipo de prueba | Descripción |
|---|---|
| Pruebas funcionales | Verifican que cada módulo cumpla con sus funciones principales. |
| Pruebas de interfaz | Evalúan que las pantallas sean claras y fáciles de usar. |
| Pruebas de validación | Verifican que los formularios no acepten datos incompletos o incorrectos. |
| Pruebas de integración | Comprueban la comunicación entre frontend, API, Prisma y base de datos. |
| Pruebas de seguridad básica | Verifican acceso mediante login y control de roles. |
| Pruebas de exportación | Comprueban la generación de reportes o documentos PDF. |

## Responsables

| Responsable | Actividad |
|---|---|
| Pool Jesús Cáceda Huallullo | Pruebas técnicas, backend, APIs y base de datos. |
| Nayely Nilda Cuicapuza Remigio | Pruebas de interfaz, formularios, documentación y validación funcional. |

## Criterios de aceptación

Una prueba será considerada exitosa cuando:

- El módulo realice la función esperada.
- No se presenten errores críticos.
- Los datos se registren correctamente.
- El sistema muestre mensajes claros al usuario.
- La interfaz sea comprensible para el docente.