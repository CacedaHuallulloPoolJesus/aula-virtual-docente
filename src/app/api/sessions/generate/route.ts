import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { generateLearningSession } from "@/lib/ai-session-generator";

export async function POST(req: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;
  if (!session.user.teacherId) {
    return NextResponse.json({ message: "El usuario no tiene perfil docente" }, { status: 400 });
  }

  const body = await req.json();
  const generated = await generateLearningSession(body);

  await prisma.generatedSession.create({
    data: {
      grade: body.grade,
      area: body.area,
      topic: body.topic,
      competence: body.competence,
      duration: body.duration,
      purpose: body.purpose,
      content: generated,
      teacherId: session.user.teacherId,
    },
  });

  return NextResponse.json(generated);
}
