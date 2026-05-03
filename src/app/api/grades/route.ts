import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const grades = await prisma.gradeRecord.findMany({
    include: { student: true, course: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(grades);
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;
  if (!session.user.teacherId) {
    return NextResponse.json({ message: "El usuario no tiene perfil docente" }, { status: 400 });
  }
  const body = await req.json();
  const grade = await prisma.gradeRecord.create({
    data: {
      score: Number(body.score),
      studentId: body.studentId,
      courseId: body.courseId,
      area: body.area,
      teacherId: session.user.teacherId,
    },
  });
  return NextResponse.json(grade);
}
