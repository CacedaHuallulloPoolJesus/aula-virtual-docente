# Casos de Prueba

| Código | Módulo | Caso de prueba | Datos de entrada | Resultado esperado | Estado |
|---|---|---|---|---|---|
| CP01 | Login | Iniciar sesión con credenciales válidas | Correo y contraseña registrados | El sistema permite ingresar al dashboard | Pendiente |
| CP02 | Login | Iniciar sesión con credenciales inválidas | Correo o contraseña incorrectos | El sistema muestra mensaje de error | Pendiente |
| CP03 | Docentes | Registrar nuevo docente | Datos completos del docente | El docente se registra correctamente | Pendiente |
| CP04 | Docentes | Validar campos obligatorios | Formulario vacío | El sistema solicita completar campos | Pendiente |
| CP05 | Estudiantes | Registrar nuevo estudiante | Datos completos del estudiante | El estudiante se registra correctamente | Pendiente |
| CP06 | Estudiantes | Buscar estudiante | Nombre o DNI | El sistema muestra coincidencias | Pendiente |
| CP07 | Grados y secciones | Registrar grado y sección | Grado, sección y nivel | El registro se guarda correctamente | Pendiente |
| CP08 | Asistencia | Registrar asistencia diaria | Fecha, aula y estado | La asistencia se registra correctamente | Pendiente |
| CP09 | Asistencia | Consultar asistencia | Fecha o estudiante | El sistema muestra registros existentes | Pendiente |
| CP10 | Notas | Registrar calificación | Estudiante, curso, bimestre y nota | La nota se guarda correctamente | Pendiente |
| CP11 | Notas | Validar nota fuera de rango | Nota mayor al límite permitido | El sistema muestra advertencia | Pendiente |
| CP12 | Sesiones | Crear sesión manual | Datos de sesión | La sesión se registra correctamente | Pendiente |
| CP13 | IA Sesiones | Generar sesión con IA | Grado, área, competencia y propósito | El sistema genera una propuesta de sesión | Pendiente |
| CP14 | IA Sesiones | Validar datos incompletos | Campos vacíos | El sistema solicita completar información | Pendiente |
| CP15 | Dashboard | Visualizar indicadores | Usuario autenticado | El sistema muestra KPIs y gráficos | Pendiente |
| CP16 | Reportes | Generar reporte académico | Parámetros de reporte | El sistema genera reporte correctamente | Pendiente |
| CP17 | Exportación | Exportar PDF | Reporte seleccionado | El sistema descarga o genera archivo PDF | Pendiente |
| CP18 | Configuración | Actualizar parámetros | Datos institucionales | Los cambios se guardan correctamente | Pendiente |
| CP19 | Seguridad | Acceder sin sesión | URL protegida | El sistema redirige al login | Pendiente |
| CP20 | Roles | Validar acceso por rol | Usuario docente/admin | El sistema muestra opciones según el rol | Pendiente |