import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const [grades, sections, courses, periods, users] = await Promise.all([
    prisma.grade.findMany({ orderBy: { name: "asc" } }),
    prisma.section.findMany({ include: { grade: true }, orderBy: { name: "asc" } }),
    prisma.course.findMany({ orderBy: { name: "asc" } }),
    prisma.academicPeriod.findMany({ orderBy: { startDate: "desc" } }),
    prisma.user.findMany({ include: { teacher: true } }),
  ]);

  return NextResponse.json({ grades, sections, courses, periods, users });
}
