# Flujo del Sistema

## Flujo General

Usuario
↓
Interfaz Web
↓
Formulario
↓
Validación
↓
API Route
↓
Lógica de negocio
↓
Prisma ORM
↓
Base de datos
↓
Respuesta al usuario

## Ejemplo: Registro de Estudiante

1. El usuario ingresa al módulo Estudiantes.
2. El sistema muestra el formulario.
3. El usuario completa los datos.
4. El sistema valida los campos.
5. Se envía la información a la API.
6. Prisma registra el estudiante en la base de datos.
7. El sistema muestra mensaje de confirmación.

## Ejemplo: Generación de Sesión con IA

1. El docente ingresa al módulo IA Sesiones.
2. Completa grado, área, competencia y propósito.
3. El sistema envía la información al generador IA.
4. El servicio construye una propuesta de sesión.
5. El docente revisa, edita y guarda la sesión.