import { AttendanceStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function GET(req: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter =
    from || to
      ? {
          date: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {};

  const where =
    session.user.role === Role.ADMIN
      ? { ...dateFilter }
      : session.user.teacherId
        ? { teacherId: session.user.teacherId, ...dateFilter }
        : { id: "__none__" };

  const records = await prisma.attendance.findMany({
    where,
    include: { student: { include: { grade: true, section: true } }, section: true, teacher: { include: { user: true } } },
    orderBy: { date: "desc" },
    take: 500,
  });
  return NextResponse.json(records);
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const body = await req.json();
  const adminTeacherId = session.user.role === Role.ADMIN ? (body.teacherId as string | undefined) : undefined;
  const teacherId = session.user.teacherId ?? adminTeacherId;
  if (!teacherId) {
    return NextResponse.json(
      { message: session.user.role === Role.ADMIN ? "Seleccione un docente para registrar asistencia" : "Solo docentes registran asistencia" },
      { status: 400 },
    );
  }

  const rows = body.records as {
    studentId: string;
    sectionId: string;
    date: string;
    status: AttendanceStatus;
    justification?: string;
  }[];

  if (!Array.isArray(rows)) {
    return NextResponse.json({ message: "Formato inválido" }, { status: 400 });
  }

  const results = [];
  for (const row of rows) {
    const attendance = await prisma.attendance.upsert({
      where: {
        date_studentId: {
          date: new Date(row.date),
          studentId: row.studentId,
        },
      },
      create: {
        date: new Date(row.date),
        status: row.status,
        justification: row.status === AttendanceStatus.JUSTIFIED ? row.justification ?? "" : null,
        studentId: row.studentId,
        sectionId: row.sectionId,
        teacherId,
      },
      update: {
        status: row.status,
        justification: row.status === AttendanceStatus.JUSTIFIED ? row.justification ?? "" : null,
        sectionId: row.sectionId,
        ...(session.user.role === Role.ADMIN ? { teacherId } : {}),
      },
    });
    results.push(attendance);
  }

  return NextResponse.json({ ok: true, count: results.length });
}
