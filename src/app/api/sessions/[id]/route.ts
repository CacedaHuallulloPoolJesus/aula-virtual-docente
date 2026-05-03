import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const { id } = await ctx.params;
  const body = await req.json();

  const existing = await prisma.learningSession.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

  if (session.user.role !== Role.ADMIN && existing.teacherId !== session.user.teacherId) {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  const updated = await prisma.learningSession.update({
    where: { id },
    data: {
      title: body.title ?? existing.title,
      grade: body.grade ?? existing.grade,
      section: body.section ?? existing.section,
      area: body.area ?? existing.area,
      competence: body.competence ?? existing.competence,
      capacity: body.capacity ?? existing.capacity,
      performance: body.performance ?? existing.performance,
      learningPurpose: body.learningPurpose ?? body.purpose ?? existing.learningPurpose,
      learningEvidence: body.learningEvidence ?? body.evidence ?? existing.learningEvidence,
      startActivity: body.startActivity ?? body.start ?? existing.startActivity,
      development: body.development ?? existing.development,
      closure: body.closure ?? existing.closure,
      resources: body.resources ?? existing.resources,
      evaluation: body.evaluation ?? existing.evaluation,
      date: body.date ? new Date(body.date) : existing.date,
      duration: body.duration ?? existing.duration,
      generatedByIa: body.generatedByIa ?? existing.generatedByIa,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const { id } = await ctx.params;

  const existing = await prisma.learningSession.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

  if (session.user.role !== Role.ADMIN && existing.teacherId !== session.user.teacherId) {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  await prisma.learningSession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
