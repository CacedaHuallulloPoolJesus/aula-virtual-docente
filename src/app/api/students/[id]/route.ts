import { Role, StudentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const { id } = await ctx.params;
  const body = await req.json();

  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

  if (session.user.role === Role.TEACHER && session.user.teacherId) {
    const t = await prisma.teacher.findUnique({
      where: { id: session.user.teacherId },
      select: { assignedGradeId: true, assignedSectionId: true },
    });
    if (existing.gradeId !== t?.assignedGradeId || existing.sectionId !== t?.assignedSectionId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }
  } else if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  const firstName = body.firstName != null ? String(body.firstName).trim() : existing.firstName;
  const lastName = body.lastName != null ? String(body.lastName).trim() : existing.lastName;
  const fullName = body.fullName != null ? String(body.fullName).trim() : `${firstName} ${lastName}`.trim();

  const updated = await prisma.student.update({
    where: { id },
    data: {
      code: body.code ?? existing.code,
      firstName,
      lastName,
      fullName,
      dni: body.dni ?? existing.dni,
      birthDate: body.birthDate ? new Date(body.birthDate) : existing.birthDate,
      guardian: body.guardian ?? existing.guardian,
      guardianPhone: body.guardianPhone ?? existing.guardianPhone,
      address: body.address ?? existing.address,
      gradeId: body.gradeId ?? existing.gradeId,
      sectionId: body.sectionId ?? existing.sectionId,
      status: (body.status as StudentStatus) ?? existing.status,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const { id } = await ctx.params;

  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Solo el administrador puede eliminar estudiantes" }, { status: 403 });
  }

  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
