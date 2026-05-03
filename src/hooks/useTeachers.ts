"use client";

import { useAppData } from "@/components/providers/AppDataProvider";
import type { Teacher } from "@/types/teacher";

/** Lista de docentes (solo admin debería usar esto en UI). */
export function useTeachers(): Teacher[] {
  const { data } = useAppData();
  return data.teachers;
}
