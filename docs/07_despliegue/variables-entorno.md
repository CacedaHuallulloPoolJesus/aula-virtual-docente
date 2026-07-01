# Variables de Entorno

## Objetivo

## ¿Qué es un archivo .env?

## Archivo utilizado

.env

## Variables utilizadas

DATABASE_URL

Descripción

NEXTAUTH_SECRET

Descripción

NEXTAUTH_URL

Descripción

OPENAI_API_KEY

Descripción

...

## Ejemplo

DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

## Buenas prácticas

- No subir .env al repositorio.
- Utilizar .env.example.
- Mantener claves seguras.
- Cambiar secretos en producción.