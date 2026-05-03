import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const sessions = await prisma.learningSession.findMany({
    orderBy: { date: "desc" },
    take: 100,
  });
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;
  if (!session.user.teacherId) {
    return NextResponse.json({ message: "El usuario no tiene perfil docente" }, { status: 400 });
  }
  const body = await req.json();
  const newSession = await prisma.learningSession.create({
    data: {
      ...body,
      date: new Date(body.date),
      teacherId: session.user.teacherId,
    },
  });
  return NextResponse.json(newSession);
}
