import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSession } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const config = await prisma.systemConfig.findUnique({ where: { id: "default" } });
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const body = await req.json();

  const config = await prisma.systemConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      institutionName: body.institutionName ?? "I.E. Virgen del Carmen",
      modularCode: body.modularCode ?? null,
      address: body.address ?? null,
      district: body.district ?? null,
      province: body.province ?? null,
      region: body.region ?? null,
      academicYear: body.academicYear ?? null,
      directorName: body.directorName ?? null,
      logoUrl: body.logoUrl ?? null,
      primaryColor: body.primaryColor ?? null,
      secondaryColor: body.secondaryColor ?? null,
      accentColor: body.accentColor ?? null,
      periodsJson: body.periodsJson ?? null,
    },
    update: {
      institutionName: body.institutionName,
      modularCode: body.modularCode,
      address: body.address,
      district: body.district,
      province: body.province,
      region: body.region,
      academicYear: body.academicYear,
      directorName: body.directorName,
      logoUrl: body.logoUrl,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      accentColor: body.accentColor,
      periodsJson: body.periodsJson,
    },
  });

  return NextResponse.json(config);
}
