# Scripts SQL

## Objetivo

Documentar los scripts SQL utilizados para la creación, consulta, respaldo y mantenimiento de la base de datos del sistema.

## Base de datos

El sistema utiliza Prisma ORM como herramienta de acceso a datos. Durante el desarrollo puede emplearse SQLite y para producción PostgreSQL.

## Consultas de verificación

### Listar usuarios

```sql
SELECT * FROM "User";
