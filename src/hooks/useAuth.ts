"use client";

import { useAppData } from "@/components/providers/AppDataProvider";

export function useAuth() {
  const { auth, login, logout } = useAppData();
  return {
    user: auth.user,
    login,
    logout,
    isAuthenticated: Boolean(auth.user),
    isAdmin: auth.user?.role === "ADMIN",
    isTeacher: auth.user?.role === "DOCENTE",
  };
}
