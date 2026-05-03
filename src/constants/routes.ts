import type { LucideIcon } from "lucide-react";
import {
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
  { href: "/ia-sesiones", label: "Sesiones con Inteligencia Artificial", icon: Bot },
  { href: "/agentes-ia", label: "Agentes de Inteligencia Artificial", icon: Sparkles },
  { href: "/reportes", label: "Reportes Académicos", icon: BarChart3 },
];

/** Navegación del panel administrador */
export const ADMIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Panel Académico Docente", icon: LayoutDashboard },
  { href: "/docentes", label: "Gestión del Personal Docente", icon: UserSquare2 },
  { href: "/grados-secciones", label: "Grados y Secciones", icon: BookOpen },
  { href: "/estudiantes", label: "Gestión de Estudiantes", icon: Users },
  { href: "/asistencia", label: "Registro de Asistencia", icon: CalendarCheck },
  { href: "/notas", label: "Evaluación de Notas", icon: ClipboardList },
  { href: "/sesiones", label: "Sesiones de Aprendizaje", icon: BookOpen },
  { href: "/ia-sesiones", label: "Sesiones con Inteligencia Artificial", icon: Bot },
  { href: "/agentes-ia", label: "Agentes de Inteligencia Artificial", icon: Sparkles },
  { href: "/reportes", label: "Reportes Académicos", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];
