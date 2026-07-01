# Estructura del Proyecto

## Objetivo

Describir la organización del código fuente del Sistema Integral de Aula Virtual Docente.

## Estructura General

src/
├── app/
├── components/
├── constants/
├── contexts/
├── hooks/
├── lib/
├── providers/
└── types/

prisma/
└── schema.prisma

## Descripción de Carpetas

| Carpeta | Descripción |
|---------|-------------|
| src/app | Contiene las rutas, páginas y API Routes del sistema. |
| src/components | Contiene componentes visuales reutilizables. |
| src/components/forms | Contiene formularios del sistema. |
| src/components/ui | Contiene componentes base de interfaz. |
| src/lib | Contiene funciones auxiliares, servicios, Prisma, IA, PDF y validaciones. |
| src/contexts | Contiene el contexto global de datos de demostración. |
| src/hooks | Contiene hooks personalizados. |
| src/types | Contiene tipos e interfaces TypeScript. |
| prisma | Contiene el esquema de base de datos. |