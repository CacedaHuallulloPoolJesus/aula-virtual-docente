import { Role, TeacherStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const teachers = await prisma.teacher.findMany({
    include: {
      user: { select: { id: true, email: true, role: true, createdAt: true } },
      assignedGrade: true,
      assignedSection: true,
    },
    orderBy: { fullName: "asc" },
  });
  return NextResponse.json(teachers);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const password = await bcrypt.hash(String(body.password ?? "123456"), 10);
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const fullName = `${firstName} ${lastName}`.trim() || String(body.fullName ?? "").trim();

  const role = body.role === "ADMIN" || body.role === Role.ADMIN ? Role.ADMIN : Role.TEACHER;

  const user = await prisma.user.create({
    data: {
      email: String(body.email).toLowerCase().trim(),
      password,
      role,
      teacher:
        role === Role.TEACHER
          ? {
              create: {
                firstName: firstName || fullName.split(" ")[0] || "Docente",
                lastName: lastName || fullName.split(" ").slice(1).join(" ") || "Nuevo",
                fullName: fullName || `${firstName} ${lastName}`.trim(),
                dni: body.dni ? String(body.dni) : null,
                status: (body.status as TeacherStatus) ?? TeacherStatus.ACTIVE,
                assignedGradeId: body.assignedGradeId || null,
                assignedSectionId: body.assignedSectionId || null,
              },
            }
          : undefined,
    },
    include: { teacher: { include: { assignedGrade: true, assignedSection: true } } },
  });

  return NextResponse.json(user);
}
