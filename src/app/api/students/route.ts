import { Role, StudentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function GET(req: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase();
  const gradeId = searchParams.get("gradeId");
  const sectionId = searchParams.get("sectionId");
  const statusParam = searchParams.get("status");

  let where: Record<string, unknown> = {};
  if (session.user.role !== Role.ADMIN) {
    if (!session.user.teacherId) {
      return NextResponse.json([]);
    }
    const t = await prisma.teacher.findUnique({
      where: { id: session.user.teacherId },
      select: { assignedGradeId: true, assignedSectionId: true },
    });
    if (!t?.assignedGradeId || !t.assignedSectionId) {
      return NextResponse.json([]);
    }
    where = { gradeId: t.assignedGradeId, sectionId: t.assignedSectionId };
  } else {
    if (gradeId) where = { ...where, gradeId };
    if (sectionId) where = { ...where, sectionId };
  }

  if (statusParam && (Object.values(StudentStatus) as string[]).includes(statusParam)) {
    where = { ...where, status: statusParam as StudentStatus };
  }

  if (q) {
    where = {
      ...where,
      OR: [
        { code: { contains: q, mode: "insensitive" } },
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { fullName: { contains: q, mode: "insensitive" } },
        { dni: { contains: q, mode: "insensitive" } },
      ],
    };
  }

  const students = await prisma.student.findMany({
    where: where as { gradeId?: string; sectionId?: string },
    include: { grade: true, section: true },
    orderBy: { fullName: "asc" },
  });
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const body = await req.json();

  if (session.user.role === Role.TEACHER && session.user.teacherId) {
    const t = await prisma.teacher.findUnique({
      where: { id: session.user.teacherId },
      select: { assignedGradeId: true, assignedSectionId: true },
    });
    if (body.gradeId !== t?.assignedGradeId || body.sectionId !== t?.assignedSectionId) {
      return NextResponse.json({ message: "Solo puede registrar estudiantes de su aula asignada" }, { status: 403 });
    }
  } else if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const fullName = `${firstName} ${lastName}`.trim() || String(body.fullName ?? "").trim();

  const student = await prisma.student.create({
    data: {
      code: body.code,
      firstName: firstName || fullName.split(" ")[0] || "Sin",
      lastName: lastName || fullName.split(" ").slice(1).join(" ") || "Nombre",
      fullName: fullName || `${firstName} ${lastName}`.trim(),
      dni: body.dni || null,
      birthDate: body.birthDate ? new Date(body.birthDate) : null,
      guardian: body.guardian || null,
      guardianPhone: body.guardianPhone || null,
      address: body.address || null,
      gradeId: body.gradeId,
      sectionId: body.sectionId,
      status: (body.status as StudentStatus) ?? StudentStatus.ACTIVE,
    },
  });
  return NextResponse.json(student);
}
