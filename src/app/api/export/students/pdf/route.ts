import { Role, StudentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { buildAcademicPdf } from "@/lib/pdf-export";
import { getInstitutionalLogoDataUrlFromDisk } from "@/lib/pdf-server";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;

  let where: Record<string, unknown> = {};
  let teacherName = "Administración";
  let gradeSection = "Todos los grados";

  if (session.user.role !== Role.ADMIN) {
    if (!session.user.teacherId) return NextResponse.json({ message: "Sin aula asignada" }, { status: 400 });
    const t = await prisma.teacher.findUnique({
      where: { id: session.user.teacherId },
      include: { assignedGrade: true, assignedSection: true },
    });
    if (!t?.assignedGradeId || !t.assignedSectionId) return NextResponse.json({ message: "Sin aula asignada" }, { status: 400 });
    where = { gradeId: t.assignedGradeId, sectionId: t.assignedSectionId };
    teacherName = `${t.firstName} ${t.lastName}`.trim();
    if (t.assignedGrade && t.assignedSection) {
      gradeSection = `${t.assignedGrade.name} — ${t.assignedSection.name}`;
    }
  }

  const students = await prisma.student.findMany({
    where: where as object,
    include: { grade: true, section: true },
    orderBy: { fullName: "asc" },
    take: 500,
  });

  const config = await prisma.systemConfig.findUnique({ where: { id: "default" } });

  const statusLabel = (s: StudentStatus) =>
    s === StudentStatus.ACTIVE ? "Activo" : s === StudentStatus.TRANSFERRED ? "Traslado" : s === StudentStatus.WITHDRAWN ? "Retirado" : "Inactivo";

  const logoDataUrl = getInstitutionalLogoDataUrlFromDisk();

  const doc = buildAcademicPdf({
    config,
    title: "Reporte de estudiantes",
    teacherName,
    gradeSection,
    logoDataUrl,
    columns: [
      { header: "Código", dataKey: "code" },
      { header: "Apellidos y nombres", dataKey: "name" },
      { header: "DNI", dataKey: "dni" },
      { header: "Grado", dataKey: "grade" },
      { header: "Sección", dataKey: "section" },
      { header: "Estado", dataKey: "status" },
    ],
    rows: students.map((s) => ({
      code: s.code,
      name: `${s.lastName}, ${s.firstName}`,
      dni: s.dni ?? "",
      grade: s.grade.name,
      section: s.section.name,
      status: statusLabel(s.status),
    })),
  });

  const buf = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="estudiantes.pdf"',
    },
  });
}
