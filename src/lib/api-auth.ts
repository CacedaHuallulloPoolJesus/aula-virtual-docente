import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { error: NextResponse.json({ message: "No autorizado" }, { status: 401 }) };
  }
  return { session };
}

export async function requireAdmin() {
  const auth = await requireSession();
  if ("error" in auth) return auth;
  if (auth.session.user.role !== Role.ADMIN) {
    return { error: NextResponse.json({ message: "Solo administrador" }, { status: 403 }) };
  }
  return auth;
}

export async function requireTeacherProfile() {
  const auth = await requireSession();
  if ("error" in auth) return auth;
  if (!auth.session.user.teacherId) {
    return { error: NextResponse.json({ message: "Perfil docente requerido" }, { status: 400 }) };
  }
  return auth;
}
