import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const teachers = await prisma.teacher.findMany({
    include: { user: { select: { email: true } }, assignedGrade: true, assignedSection: true },
    orderBy: { fullName: "asc" },
  });

  const rows = await Promise.all(
    teachers.map(async (t) => {
      const gradeId = t.assignedGradeId;
      const sectionId = t.assignedSectionId;

      const [studentsCount, attendancesCount, notesCount, sessionsCount, sessionsIaCount, generatedIaCount] = await Promise.all([
        gradeId && sectionId
          ? prisma.student.count({ where: { gradeId, sectionId } })
          : Promise.resolve(0),
        prisma.attendance.count({ where: { teacherId: t.id } }),
        prisma.gradeRecord.count({ where: { teacherId: t.id } }),
        prisma.learningSession.count({ where: { teacherId: t.id, generatedByIa: false } }),
        prisma.learningSession.count({ where: { teacherId: t.id, generatedByIa: true } }),
        prisma.generatedSession.count({ where: { teacherId: t.id } }),
      ]);

      const hasActivity =
        studentsCount + attendancesCount + notesCount + sessionsCount + sessionsIaCount + generatedIaCount > 0;

      return {
        id: t.id,
        fullName: `${t.firstName} ${t.lastName}`.trim(),
        email: t.user.email,
        lastLogin: null as string | null,
        studentsRegistered: studentsCount,
        attendancesRecorded: attendancesCount,
        gradesRecorded: notesCount,
        sessionsCreated: sessionsCount,
        sessionsIa: sessionsIaCount + generatedIaCount,
        activitySummary: hasActivity ? null : "Sin actividad registrada",
      };
    }),
  );

  return NextResponse.json(rows);
}
