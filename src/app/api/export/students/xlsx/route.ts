import { Role, StudentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;

  let where: Record<string, unknown> = {};
  if (session.user.role !== Role.ADMIN) {
    if (!session.user.teacherId) return NextResponse.json({ message: "Sin aula asignada" }, { status: 400 });
    const t = await prisma.teacher.findUnique({
      where: { id: session.user.teacherId },
      select: { assignedGradeId: true, assignedSectionId: true },
    });
    if (!t?.assignedGradeId || !t.assignedSectionId) return NextResponse.json({ message: "Sin aula asignada" }, { status: 400 });
    where = { gradeId: t.assignedGradeId, sectionId: t.assignedSectionId };
  }

  const students = await prisma.student.findMany({
    where: where as object,
    include: { grade: true, section: true },
    orderBy: { fullName: "asc" },
    take: 2000,
  });

  const statusLabel = (s: StudentStatus) =>
    s === StudentStatus.ACTIVE ? "Activo" : s === StudentStatus.TRANSFERRED ? "Traslado" : s === StudentStatus.WITHDRAWN ? "Retirado" : "Inactivo";

  const rows = students.map((s) => ({
    Código: s.code,
    Nombres: s.firstName,
    Apellidos: s.lastName,
    DNI: s.dni ?? "",
    "F. nacimiento": s.birthDate ? s.birthDate.toISOString().slice(0, 10) : "",
    Grado: s.grade.name,
    Sección: s.section.name,
    Apoderado: s.guardian ?? "",
    "Tel. apoderado": s.guardianPhone ?? "",
    Dirección: s.address ?? "",
    Estado: statusLabel(s.status),
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Estudiantes");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="estudiantes.xlsx"',
    },
  });
}
