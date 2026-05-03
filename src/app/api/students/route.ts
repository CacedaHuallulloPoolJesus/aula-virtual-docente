import { NextResponse } from "next/server";
import { StudentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const students = await prisma.student.findMany({
    include: { grade: true, section: true },
    orderBy: { fullName: "asc" },
  });
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const student = await prisma.student.create({
    data: {
      fullName: body.fullName,
      code: body.code,
      gradeId: body.gradeId,
      sectionId: body.sectionId,
      status: (body.status as StudentStatus) ?? StudentStatus.ACTIVE,
    },
  });
  return NextResponse.json(student);
}
