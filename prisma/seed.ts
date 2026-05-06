import { Role, StudentStatus, TeacherStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { institutionDefaults } from "../src/constants/institution";

/**
 * Campos alineados con `prisma/schema.prisma`:
 * Teacher: userId, firstName, lastName, fullName, dni?, status, assignedGradeId?, assignedSectionId?
 * Student: code, firstName, lastName, fullName, dni?, gradeId, sectionId, status
 */
async function main() {
  const adminPassword = await bcrypt.hash("Admin123*", 10);
  const teacherPassword = await bcrypt.hash("123456", 10);

  await prisma.gradeRecord.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.generatedSession.deleteMany();
  await prisma.learningSession.deleteMany();
  await prisma.course.deleteMany();
  await prisma.report.deleteMany();
  await prisma.agentLog.deleteMany();
  await prisma.student.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.academicPeriod.deleteMany();
  await prisma.section.deleteMany();
  await prisma.grade.deleteMany();

  const grade1 = await prisma.grade.create({ data: { name: "1ro Primaria" } });
  const grade2 = await prisma.grade.create({ data: { name: "2do Primaria" } });

  const section1A = await prisma.section.create({ data: { name: "A", gradeId: grade1.id } });
  const section2A = await prisma.section.create({ data: { name: "A", gradeId: grade2.id } });

  await prisma.user.create({
    data: {
      email: "admin@virgendelcarmen.edu.pe",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const teacherUser1 = await prisma.user.create({
    data: {
      email: "docente1@virgendelcarmen.edu.pe",
      password: teacherPassword,
      role: Role.TEACHER,
    },
  });

  await prisma.teacher.create({
    data: {
      userId: teacherUser1.id,
      firstName: "Rosa",
      lastName: "Quispe Huamán",
      fullName: "Rosa Quispe Huamán",
      dni: "40123456",
      status: TeacherStatus.ACTIVE,
      assignedGradeId: grade1.id,
      assignedSectionId: section1A.id,
    },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      email: "docente2@virgendelcarmen.edu.pe",
      password: teacherPassword,
      role: Role.TEACHER,
    },
  });

  await prisma.teacher.create({
    data: {
      userId: teacherUser2.id,
      firstName: "Carlos",
      lastName: "Huanca Salazar",
      fullName: "Carlos Huanca Salazar",
      dni: "40234567",
      status: TeacherStatus.ACTIVE,
      assignedGradeId: grade2.id,
      assignedSectionId: section2A.id,
    },
  });

  await prisma.student.create({
    data: {
      code: "STD-001",
      firstName: "Juan",
      lastName: "Pérez Huamán",
      fullName: "Juan Pérez Huamán",
      dni: "72345678",
      gradeId: grade1.id,
      sectionId: section1A.id,
      status: StudentStatus.ACTIVE,
    },
  });

  await prisma.student.create({
    data: {
      code: "STD-002",
      firstName: "María",
      lastName: "Quispe Rojas",
      fullName: "María Quispe Rojas",
      dni: "73456789",
      gradeId: grade2.id,
      sectionId: section2A.id,
      status: StudentStatus.ACTIVE,
    },
  });

  await prisma.systemConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      institutionName: institutionDefaults.shortName,
      address: "Huayucachi",
      district: institutionDefaults.district,
      province: institutionDefaults.province,
      region: institutionDefaults.region,
      academicYear: institutionDefaults.academicYear,
      directorName: null,
      logoUrl: institutionDefaults.logoPath,
    },
    update: {
      institutionName: institutionDefaults.shortName,
      district: institutionDefaults.district,
      province: institutionDefaults.province,
      region: institutionDefaults.region,
      academicYear: institutionDefaults.academicYear,
      logoUrl: institutionDefaults.logoPath,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
