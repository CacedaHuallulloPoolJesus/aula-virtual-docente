import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

async function ensureCourse(params: {
  name: string;
  gradeId: string;
  sectionId: string;
  teacherId: string;
  periodId: string;
}) {
  return prisma.course.upsert({
    where: {
      name_sectionId_periodId: {
        name: params.name,
        sectionId: params.sectionId,
        periodId: params.periodId,
      },
    },
    create: {
      name: params.name,
      gradeId: params.gradeId,
      sectionId: params.sectionId,
      teacherId: params.teacherId,
      periodId: params.periodId,
    },
    update: {},
  });
}

export async function GET(req: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const { searchParams } = new URL(req.url);
  const periodId = searchParams.get("periodId") ?? undefined;

  const teacherId = session.user.role === Role.ADMIN ? null : session.user.teacherId;
  const grades = await prisma.gradeRecord.findMany({
    where: {
      ...(teacherId ? { teacherId } : {}),
      ...(periodId ? { course: { periodId } } : {}),
    },
    include: { student: { include: { grade: true, section: true } }, course: { include: { period: true } } },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });
  return NextResponse.json(grades);
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;
  if (!session.user.teacherId && session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Sin perfil docente" }, { status: 400 });
  }

  const body = await req.json();
  const teacherId = session.user.teacherId ?? body.teacherId;
  if (!teacherId) return NextResponse.json({ message: "teacherId requerido" }, { status: 400 });

  const course = await ensureCourse({
    name: body.area,
    gradeId: body.gradeId,
    sectionId: body.sectionId,
    teacherId,
    periodId: body.periodId,
  });

  const note1 = Number(body.note1);
  const note2 = Number(body.note2);
  const note3 = Number(body.note3);

  const record = await prisma.gradeRecord.upsert({
    where: {
      studentId_courseId: {
        studentId: body.studentId,
        courseId: course.id,
      },
    },
    create: {
      note1,
      note2,
      note3,
      studentId: body.studentId,
      courseId: course.id,
      area: body.area,
      teacherId,
    },
    update: { note1, note2, note3, area: body.area, teacherId },
  });

  return NextResponse.json(record);
}
