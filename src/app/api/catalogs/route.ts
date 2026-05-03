import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const [grades, sections, periods] = await Promise.all([
    prisma.grade.findMany({ orderBy: { name: "asc" } }),
    prisma.section.findMany({ include: { grade: true }, orderBy: [{ gradeId: "asc" }, { name: "asc" }] }),
    prisma.academicPeriod.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  let teachers = null as Awaited<ReturnType<typeof prisma.teacher.findMany>> | null;
  if (auth.session.user.role === Role.ADMIN) {
    teachers = await prisma.teacher.findMany({
      include: {
        user: { select: { id: true, email: true, role: true } },
        assignedGrade: true,
        assignedSection: true,
      },
      orderBy: { fullName: "asc" },
    });
  } else if (auth.session.user.teacherId) {
    teachers = await prisma.teacher.findMany({
      where: { id: auth.session.user.teacherId },
      include: {
        user: { select: { id: true, email: true, role: true } },
        assignedGrade: true,
        assignedSection: true,
      },
    });
  }

  const courses =
    auth.session.user.role === Role.ADMIN
      ? await prisma.course.findMany({ include: { grade: true, section: true, period: true, teacher: { include: { user: true } } } })
      : auth.session.user.teacherId
        ? await prisma.course.findMany({
            where: { teacherId: auth.session.user.teacherId },
            include: { grade: true, section: true, period: true },
          })
        : [];

  return NextResponse.json({ grades, sections, periods, teachers, courses });
}
