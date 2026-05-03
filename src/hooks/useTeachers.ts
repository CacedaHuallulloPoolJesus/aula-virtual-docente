"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/lib/api-client";
import type { Teacher } from "@/types/teacher";
import { TeacherStatus } from "@prisma/client";

type ApiTeacher = {
  id: string;
  firstName: string;
  lastName: string;
  status: TeacherStatus;
  assignedGrade: { name: string } | null;
  assignedSection: { name: string } | null;
  user: { email: string };
};

export function useTeachers(): Teacher[] {
  const [list, setList] = useState<Teacher[]>([]);

  useEffect(() => {
    apiJson<ApiTeacher[]>("/api/admin/teachers")
      .then((rows) =>
        setList(
          rows.map((t, i) => ({
            id: t.id,
            code: `DOC-${String(i + 1).padStart(3, "0")}`,
            firstName: t.firstName,
            lastName: t.lastName,
            email: t.user.email,
            grade: t.assignedGrade?.name ?? "",
            section: t.assignedSection?.name ?? "",
            status: t.status,
          })),
        ),
      )
      .catch(() => setList([]));
  }, []);

  return list;
}
