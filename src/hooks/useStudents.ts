"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/lib/api-client";
import type { Student } from "@/types/student";

type ApiStudent = {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  dni: string | null;
  birthDate: string | null;
  guardian: string | null;
  guardianPhone: string | null;
  address: string | null;
  status: Student["status"];
  grade: { name: string };
  section: { name: string };
};

export function useStudents(): Student[] {
  const [list, setList] = useState<Student[]>([]);

  useEffect(() => {
    apiJson<ApiStudent[]>("/api/students")
      .then((rows) =>
        setList(
          rows.map((s) => ({
            id: s.id,
            code: s.code,
            firstName: s.firstName,
            lastName: s.lastName,
            dni: s.dni ?? "",
            birthDate: s.birthDate ? s.birthDate.slice(0, 10) : "",
            grade: s.grade.name,
            section: s.section.name,
            guardian: s.guardian ?? "",
            guardianPhone: s.guardianPhone ?? "",
            address: s.address ?? "",
            status: s.status,
          })),
        ),
      )
      .catch(() => setList([]));
  }, []);

  return list;
}
