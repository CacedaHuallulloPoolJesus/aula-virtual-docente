# SQuaRE - ISO/IEC 25000

## Sistema Integral de Aula Virtual Docente

## 1. Introducción

La familia de normas **ISO/IEC 25000**, conocida como **SQuaRE (Systems and Software Quality Requirements and Evaluation)**, proporciona un marco de referencia para definir, medir y evaluar la calidad de productos de software.

En el presente proyecto, SQuaRE se utiliza como referencia para evaluar la calidad del **Sistema Integral de Aula Virtual Docente**, considerando atributos relacionados con funcionalidad, usabilidad, seguridad, mantenibilidad, eficiencia y portabilidad.

---

## 2. Objetivo

Aplicar los criterios de calidad de software propuestos por ISO/IEC 25000 al Sistema Integral de Aula Virtual Docente, con la finalidad de asegurar que el producto desarrollado cumpla con las necesidades funcionales, pedagógicas y técnicas de los usuarios.

---

## 3. Relación con ISO/IEC 25010

Dentro de la familia ISO/IEC 25000, la norma **ISO/IEC 25010** define el modelo de calidad del producto software. Para este sistema se consideran las siguientes características:

| Característica ISO/IEC 25010 | Aplicación en el sistema |
|---|---|
| Adecuación funcional | El sistema cubre módulos de login, docentes, estudiantes, asistencia, notas, sesiones, IA, reportes y dashboard. |
| Eficiencia de desempeño | El sistema debe responder de forma rápida al registrar, consultar y visualizar información académica. |
| Compatibilidad | El sistema funciona desde navegadores modernos y puede integrarse con servicios externos como IA y base de datos. |
| Usabilidad | La interfaz debe ser clara, intuitiva y comprensible para docentes y administradores. |
| Fiabilidad | El sistema debe mantener disponibilidad y evitar pérdida de datos académicos. |
| Seguridad | El acceso se controla mediante autenticación, roles y variables de entorno. |
| Mantenibilidad | El código está organizado en módulos, componentes reutilizables, API Routes y servicios. |
| Portabilidad | El sistema puede ejecutarse en entorno local y desplegarse en Vercel con PostgreSQL/Neon. |

---

## 4. Evaluación de Calidad del Sistema

| Criterio | Evidencia en el proyecto | Estado |
|---|---|---|
| Funcionalidad | Módulos implementados en `src/app/(main)` | Cumple |
| Usabilidad | Manual de usuario y diseño de interfaces | Cumple |
| Seguridad | Login, roles, NextAuth y `.env` | Cumple |
| Mantenibilidad | Estructura modular en `src/components`, `src/lib` y `src/app/api` | Cumple |
| Portabilidad | Despliegue en Vercel y configuración mediante variables de entorno | Cumple |
| Fiabilidad | Base de datos gestionada mediante Prisma ORM | Cumple |
| Eficiencia | Uso de Next.js y consultas API organizadas | Cumple |

---

## 5. Matriz de Cumplimiento SQuaRE

| ID | Característica | Subcaracterística | Evidencia | Observación |
|---|---|---|---|---|
| SQR-001 | Adecuación funcional | Completitud funcional | `docs/02_analisis/requerimientos.md` | El sistema cubre los principales requerimientos funcionales. |
| SQR-002 | Adecuación funcional | Corrección funcional | `docs/05_pruebas/casos-prueba.md` | Los casos de prueba validan el funcionamiento esperado. |
| SQR-003 | Usabilidad | Facilidad de aprendizaje | `docs/08_manual/manual-usuario.md` | El manual facilita el aprendizaje del sistema. |
| SQR-004 | Usabilidad | Operabilidad | `docs/03_diseño/mockups.md` | Las interfaces están organizadas por módulos. |
| SQR-005 | Seguridad | Confidencialidad | `src/app/login/page.tsx` / `src/lib/auth.ts` | El acceso está restringido a usuarios autenticados. |
| SQR-006 | Seguridad | Control de acceso | `src/app/api/auth` | El sistema diferencia roles de usuario. |
| SQR-007 | Mantenibilidad | Modularidad | `src/components`, `src/lib`, `src/app/api` | La estructura facilita mantenimiento y crecimiento. |
| SQR-008 | Portabilidad | Adaptabilidad | `docs/07_despliegue/guia-instalacion.md` | El sistema puede instalarse en otro entorno. |
| SQR-009 | Fiabilidad | Disponibilidad | Despliegue en Vercel | La aplicación se encuentra publicada en entorno web. |
| SQR-010 | Eficiencia | Tiempo de respuesta | `docs/05_pruebas/resultados-pruebas.md` | Se valida mediante pruebas funcionales. |

---

## 6. Evidencias Técnicas

Las evidencias de aplicación del modelo SQuaRE se encuentran distribuidas en los siguientes artefactos del proyecto:

| Artefacto | Ruta |
|---|---|
| Requerimientos | `docs/02_analisis/requerimientos.md` |
| Arquitectura | `docs/03_diseño/arquitectura.md` |
| Diseño de interfaces | `docs/03_diseño/mockups.md` |
| Código fuente | `src/app`, `src/components`, `src/lib` |
| Pruebas | `docs/05_pruebas/` |
| Mantenimiento | `docs/06_mantenimiento/` |
| Despliegue | `docs/07_despliegue/` |
| Manual de usuario | `docs/08_manual/manual-usuario.md` |

---

## 7. Conclusión

La aplicación de la familia de normas **ISO/IEC 25000 - SQuaRE** permite establecer criterios de evaluación de calidad para el Sistema Integral de Aula Virtual Docente. A través de la documentación de requerimientos, diseño, pruebas, mantenimiento y despliegue, se evidencia que el sistema considera atributos fundamentales de calidad como funcionalidad, usabilidad, seguridad, mantenibilidad y portabilidad.