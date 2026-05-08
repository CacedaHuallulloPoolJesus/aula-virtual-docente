# Sistema Integral de Aula Virtual Docente

Aplicación web para la **I.E. Virgen del Carmen (Huayucachi)** y contexto de tesis de Ingeniería de Sistemas: gestión académica de primaria, sesiones de aprendizaje y módulos de apoyo con **inteligencia artificial** (simulación local + puntos de extensión a API externa).

## Tecnologías

- **Next.js** (App Router) + **React** + **TypeScript**
- **Tailwind CSS**
- **Prisma ORM** — **SQLite** en demo local; mismo esquema orientado a **PostgreSQL** en producción
- **NextAuth** (credenciales + adaptador Prisma, según configuración)
- **Recharts**, **lucide-react**, **jsPDF** / **jspdf-autotable**, **Zod**

## Estructura de carpetas (resumen)

```text
sistema-aula-virtual/
├── docs/                    # Documentación de arquitectura, BD, demo y manual
├── prisma/                  # schema, migrations, seed, dev.db (local)
├── public/                  # insignia, assets estáticos
├── src/
│   ├── app/
│   │   ├── (main)/          # Rutas autenticadas (URL sin "(main)": /dashboard, /notas, …)
│   │   ├── api/             # API Routes (Prisma, agentes, etc.)
│   │   ├── login/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/          # AppLayout, Sidebar, Navbar, DemoAuthGuard
│   │   ├── ui/              # Button, Card, Input, Badge, Modal, Table
│   │   ├── forms/           # TeacherForm, StudentForm, SessionForm, GradesForm, IaSessionForm
│   │   ├── dashboard/       # MetricCard, PerformanceChart, AlertsPanel
│   │   └── agents/          # AgentCard, AgentResultPanel, AgentAlertPreview
│   ├── constants/           # routes (navegación), roles, academic (áreas, periodos)
│   ├── hooks/               # useAuth, useStudents, useTeachers
│   ├── lib/                 # prisma, auth (NextAuth), mock-data, agents, validations, utils
│   └── types/               # Tipos de dominio (auth, teacher, student, …)
├── .env / .env.example
├── package.json
└── tsconfig.json
```

## Credenciales demo (login local)

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Admin | `admin@aula.com` | `123456` |
| Docente 1 | `docente1@aula.com` | `123456` |
| Docente 2 | `docente2@aula.com` | `123456` |

admin@virgendelcarmen.edu.pe / Admin123*
docente1@virgendelcarmen.edu.pe / 123456
docente2@virgendelcarmen.edu.pe / 123456

Detalle en [docs/usuarios-demo.md](docs/usuarios-demo.md).

## Instalación y ejecución

```bash
npm install
npm run dev
```
```bash git
npm run build
git add .
git commit -m "mensaje del cambio"
git push origin main
```

Abrir [http://localhost:3000](http://localhost:3000), iniciar sesión y navegar por el panel.

## Preparar demo (migraciones + seed + servidor)

```bash
npm run demo
```

Equivale a generar cliente Prisma, aplicar migraciones, ejecutar seed y levantar `npm run dev` (ver `package.json`).

### Comandos Prisma útiles

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

En Windows, si el CLI de Prisma no ve `DATABASE_URL`:

```bash
npm run setup:demo
```

## Calidad de código

```bash
npm run lint
npm run build
```

## Módulos implementados

- Dashboard con métricas y gráficos
- Docentes, estudiantes, asistencia, notas, sesiones
- IA Sesiones (generación local editable)
- **Agentes IA** (planificación, rendimiento, alertas, actividades, asistente)
- Reportes, grados/secciones, configuración (admin)
- Documentación en `docs/`

## Documentación adicional

- [Arquitectura](docs/arquitectura.md)
- [Base de datos](docs/base-datos.md)
- [Manual de usuario](docs/manual-usuario.md)

## Variables de entorno

Ver `.env.example`. Para agentes con API externa opcional: `NEXT_PUBLIC_AI_API_URL`.
