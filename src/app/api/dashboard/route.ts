import { AttendanceStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const [studentCount, attendance, grades] = await Promise.all([
    prisma.student.count(),
    prisma.attendance.findMany(),
    prisma.gradeRecord.findMany({ include: { student: true } }),
  ]);

  const present = attendance.filter((a) => a.status === AttendanceStatus.PRESENT).length;
  const attendanceRate = attendance.length ? (present / attendance.length) * 100 : 0;
  const average = grades.length ? grades.reduce((acc, g) => acc + g.score, 0) / grades.length : 0;

  const riskyStudents = new Set(grades.filter((g) => g.score < 11).map((g) => g.studentId)).size;

  return NextResponse.json({
    studentCount,
    average: Number(average.toFixed(2)),
    attendanceRate: Number(attendanceRate.toFixed(2)),
    riskyStudents,
  });
}
