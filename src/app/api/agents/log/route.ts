import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { agentName?: string; input?: string; output?: string; userId?: string | null };
    if (!body.agentName || typeof body.input !== "string" || typeof body.output !== "string") {
      return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
    }
    await prisma.agentLog.create({
      data: {
        agentName: String(body.agentName).slice(0, 200),
        input: body.input.slice(0, 50_000),
        output: body.output.slice(0, 50_000),
        userId: body.userId != null ? String(body.userId).slice(0, 200) : null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
