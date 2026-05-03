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
