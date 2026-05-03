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

/** Rutas del panel docente (orden = sidebar) */
export const TEACHER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/estudiantes", label: "Estudiantes", icon: Users },
  { href: "/asistencia", label: "Asistencia", icon: CalendarCheck },
  { href: "/notas", label: "Notas", icon: ClipboardList },
  { href: "/sesiones", label: "Sesiones", icon: BookOpen },
  { href: "/ia-sesiones", label: "IA Sesiones", icon: Bot },
  { href: "/agentes-ia", label: "Agentes IA", icon: Sparkles },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
];

/** Rutas del panel administrador */
export const ADMIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/docentes", label: "Docentes", icon: UserSquare2 },
  { href: "/grados-secciones", label: "Grados y secciones", icon: BookOpen },
  { href: "/estudiantes", label: "Estudiantes", icon: Users },
  { href: "/agentes-ia", label: "Agentes IA", icon: Sparkles },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];
