/** Roles de la demo local (mock) y equivalente conceptual en UI */
export const DEMO_ROLES = {
  ADMIN: "ADMIN",
  DOCENTE: "DOCENTE",
} as const;

export type DemoRole = (typeof DEMO_ROLES)[keyof typeof DEMO_ROLES];
