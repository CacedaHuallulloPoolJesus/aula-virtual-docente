import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
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
  const hashed = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: hashed,
      role: body.role as Role,
      teacher:
        body.role === Role.TEACHER
          ? {
              create: { fullName: body.fullName ?? body.email },
            }
          : undefined,
    },
  });

  return NextResponse.json(user);
}
