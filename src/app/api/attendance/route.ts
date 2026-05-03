import { AttendanceStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const records = await prisma.attendance.findMany({
    include: { student: true, section: true },
    orderBy: { date: "desc" },
    take: 100,
  });
  return NextResponse.json(records);
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;
  if (!session.user.teacherId) {
    return NextResponse.json({ message: "El usuario no tiene perfil docente" }, { status: 400 });
  }

  const body = await req.json();
  const attendance = await prisma.attendance.create({
    data: {
      date: new Date(body.date),
      status: body.status as AttendanceStatus,
      studentId: body.studentId,
      sectionId: body.sectionId,
      teacherId: session.user.teacherId,
    },
  });
  return NextResponse.json(attendance);
}
