import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Bot,
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
  UserSquare2,
  Layers,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Navegación del panel docente (orden = barra lateral) */
export const TEACHER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Panel Académico Docente", icon: LayoutDashboard },
  { href: "/estudiantes", label: "Gestión de Estudiantes", icon: Users },
  { href: "/asistencia", label: "Registro de Asistencia", icon: CalendarCheck },
  { href: "/notas", label: "Evaluación de Notas", icon: ClipboardList },
  { href: "/sesiones", label: "Sesiones de Aprendizaje", icon: BookOpen },
  { href: "/ia-sesiones", label: "IA Sesiones", icon: Bot },
  { href: "/agentes-ia", label: "Agentes IA", icon: Sparkles },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
];

/** Navegación del panel administrador */
export const ADMIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Panel Administrativo", icon: LayoutDashboard },
  { href: "/docentes", label: "Docentes / Usuarios", icon: UserSquare2 },
  { href: "/grados-secciones", label: "Grados y Secciones", icon: Layers },
  { href: "/estudiantes", label: "Estudiantes", icon: Users },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
  { href: "/actividad-docente", label: "Actividad docente", icon: Activity },
];
