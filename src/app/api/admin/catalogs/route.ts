import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function POST(req: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;
  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
  }

  const body = await req.json();
  if (body.type === "grade") {
    return NextResponse.json(await prisma.grade.create({ data: { name: body.name } }));
  }
  if (body.type === "section") {
    return NextResponse.json(await prisma.section.create({ data: { name: body.name, gradeId: body.gradeId } }));
  }
  if (body.type === "period") {
    return NextResponse.json(
      await prisma.academicPeriod.create({
        data: {
          name: body.name,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          isActive: Boolean(body.isActive),
        },
      }),
    );
  }
  if (body.type === "course") {
    return NextResponse.json(
      await prisma.course.create({
        data: {
          name: body.name,
          gradeId: body.gradeId,
          sectionId: body.sectionId,
          periodId: body.periodId,
          teacherId: body.teacherId,
        },
      }),
    );
  }
  return NextResponse.json({ message: "Tipo no soportado" }, { status: 400 });
}
