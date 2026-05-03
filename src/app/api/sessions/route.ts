import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const where = session.user.role === Role.ADMIN ? {} : { teacherId: session.user.teacherId! };

  const sessions = await prisma.learningSession.findMany({
    where,
    orderBy: { date: "desc" },
    take: 200,
  });
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const body = await req.json();
  const teacherId =
    session.user.role === Role.ADMIN ? (body.teacherId as string | undefined) ?? null : session.user.teacherId;
  if (!teacherId) {
    return NextResponse.json(
      { message: session.user.role === Role.ADMIN ? "Indique docente (teacherId)" : "Solo docentes crean sesiones manuales" },
      { status: 400 },
    );
  }

  const newSession = await prisma.learningSession.create({
    data: {
      title: body.title,
      grade: body.grade,
      section: body.section ?? "",
      area: body.area,
      competence: body.competence,
      capacity: body.capacity,
      performance: body.performance,
      learningPurpose: body.learningPurpose ?? body.purpose ?? "",
      learningEvidence: body.learningEvidence ?? body.evidence ?? "",
      startActivity: body.startActivity ?? body.start ?? "",
      development: body.development,
      closure: body.closure,
      resources: body.resources,
      evaluation: body.evaluation,
      date: new Date(body.date),
      duration: body.duration ?? "90 minutos",
      generatedByIa: Boolean(body.generatedByIa),
      teacherId,
    },
  });
  return NextResponse.json(newSession);
}
