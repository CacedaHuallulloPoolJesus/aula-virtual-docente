import { Prisma, Role, TeacherStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;
  const body = await req.json();

  const teacher = await prisma.teacher.findUnique({ where: { id }, include: { user: true } });
  if (!teacher) return NextResponse.json({ message: "Docente no encontrado" }, { status: 404 });

  const firstName = body.firstName != null ? String(body.firstName).trim() : teacher.firstName;
  const lastName = body.lastName != null ? String(body.lastName).trim() : teacher.lastName;
  const fullName = body.fullName != null ? String(body.fullName).trim() : `${firstName} ${lastName}`.trim();

  if (body.email) {
    const nextEmail = String(body.email).toLowerCase().trim();
    try {
      await prisma.user.update({
        where: { id: teacher.userId },
        data: { email: nextEmail },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return NextResponse.json({ message: "Ya existe un usuario con ese correo institucional." }, { status: 409 });
      }
      throw e;
    }
  }

  if (body.password) {
    const hashed = await bcrypt.hash(String(body.password), 10);
    await prisma.user.update({
      where: { id: teacher.userId },
      data: { password: hashed },
    });
  }

  if (body.role && teacher.user.role !== Role.ADMIN) {
    await prisma.user.update({
      where: { id: teacher.userId },
      data: { role: body.role === "ADMIN" ? Role.ADMIN : Role.TEACHER },
    });
  }

  const updated = await prisma.teacher.update({
    where: { id },
    data: {
      firstName,
      lastName,
      fullName,
      dni: body.dni !== undefined ? (body.dni ? String(body.dni) : null) : teacher.dni,
      status: (body.status as TeacherStatus) ?? teacher.status,
      assignedGradeId: body.assignedGradeId !== undefined ? body.assignedGradeId : teacher.assignedGradeId,
      assignedSectionId: body.assignedSectionId !== undefined ? body.assignedSectionId : teacher.assignedSectionId,
    },
    include: { user: { select: { id: true, email: true, role: true } }, assignedGrade: true, assignedSection: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const teacher = await prisma.teacher.findUnique({ where: { id }, include: { user: true } });
  if (!teacher) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

  await prisma.user.delete({ where: { id: teacher.userId } });
  return NextResponse.json({ ok: true });
}
