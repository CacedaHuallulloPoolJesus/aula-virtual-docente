import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const adminPassword = await bcrypt.hash("Admin123*", 10);
  const demoPassword = await bcrypt.hash("123456", 10);

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
      email: "admin@aula.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const teacherUser1 = await prisma.user.create({
    data: {
      email: "docente1@aula.com",
      password: demoPassword,
      role: "TEACHER",
    },
  });

  await prisma.teacher.create({
    data: {
      userId: teacherUser1.id,
      firstName: "Rosa",
      lastName: "Quispe Huamán",
      fullName: "Rosa Quispe Huamán",
      dni: "40123456",
      status: "ACTIVE",
      assignedGradeId: grade1.id,
      assignedSectionId: section1A.id,
    },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      email: "docente2@aula.com",
      password: demoPassword,
      role: "TEACHER",
    },
  });

  await prisma.teacher.create({
    data: {
      userId: teacherUser2.id,
      firstName: "Carlos",
      lastName: "Huanca Salazar",
      fullName: "Carlos Huanca Salazar",
      dni: "40234567",
      status: "ACTIVE",
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
      status: "ACTIVE",
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
      status: "ACTIVE",
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
