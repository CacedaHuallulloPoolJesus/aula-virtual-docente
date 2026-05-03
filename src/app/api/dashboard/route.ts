import { AttendanceStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

function avgNotes(n: { note1: number; note2: number; note3: number }) {
  return (n.note1 + n.note2 + n.note3) / 3;
}

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;

  let scopedGradeId: string | undefined;
  let scopedSectionId: string | undefined;
  if (session.user.role !== Role.ADMIN && session.user.teacherId) {
    const t = await prisma.teacher.findUnique({
      where: { id: session.user.teacherId },
      select: { assignedGradeId: true, assignedSectionId: true },
    });
    if (t?.assignedGradeId && t.assignedSectionId) {
      scopedGradeId = t.assignedGradeId;
      scopedSectionId = t.assignedSectionId;
    }
  }

  const studentWhere =
    scopedGradeId && scopedSectionId ? { gradeId: scopedGradeId, sectionId: scopedSectionId } : {};

  const [studentCount, attendance, grades, sessions] = await Promise.all([
    prisma.student.count({ where: studentWhere }),
    prisma.attendance.findMany({
      where: scopedSectionId
        ? {
            sectionId: scopedSectionId,
          }
        : {},
      take: 500,
    }),
    prisma.gradeRecord.findMany({
      where: scopedGradeId && scopedSectionId
        ? {
            student: { gradeId: scopedGradeId, sectionId: scopedSectionId },
          }
        : {},
      include: { student: true },
      take: 500,
    }),
    prisma.learningSession.findMany({
      where: session.user.role === Role.ADMIN ? {} : { teacherId: session.user.teacherId! },
      take: 100,
    }),
  ]);

  const present = attendance.filter((a) => a.status === AttendanceStatus.PRESENT).length;
  const attendanceRate = attendance.length ? (present / attendance.length) * 100 : 0;
  const average = grades.length ? grades.reduce((acc, g) => acc + avgNotes(g), 0) / grades.length : 0;
  const riskyStudents = new Set(grades.filter((g) => avgNotes(g) < 11).map((g) => g.studentId)).size;

  return NextResponse.json({
    studentCount,
    average: Number(average.toFixed(2)),
    attendanceRate: Number(attendanceRate.toFixed(2)),
    riskyStudents,
    sessionsIa: sessions.filter((s) => s.generatedByIa).length,
    sessionsManual: sessions.filter((s) => !s.generatedByIa).length,
    faltas: attendance.filter((a) => a.status === AttendanceStatus.ABSENT).length,
  });
}
