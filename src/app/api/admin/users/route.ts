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
  const hashed = await bcrypt.hash(String(body.password ?? "123456"), 10);
  const fullName = String(body.fullName ?? body.email ?? "Docente").trim();
  const parts = fullName.split(/\s+/);
  const firstName = String(body.firstName ?? parts[0] ?? "Docente").trim();
  const lastName = String(body.lastName ?? (parts.slice(1).join(" ") || "Nuevo")).trim();
  const user = await prisma.user.create({
    data: {
      email: String(body.email).toLowerCase().trim(),
      password: hashed,
      role: body.role as Role,
      teacher:
        body.role === Role.TEACHER
          ? {
              create: {
                firstName,
                lastName,
                fullName: `${firstName} ${lastName}`.trim() || fullName,
                dni: body.dni ? String(body.dni) : null,
              },
            }
          : undefined,
    },
  });

  return NextResponse.json(user);
}
