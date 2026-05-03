import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const adminPassword = await bcrypt.hash("Admin123*", 10);
  const demoPassword = await bcrypt.hash("123456", 10);

  await prisma.generatedSession.deleteMany();
  await prisma.learningSession.deleteMany();
  await prisma.gradeRecord.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.section.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.academicPeriod.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const grade1 = await prisma.grade.upsert({
    where: { name: "1ro Primaria" },
    update: {},
    create: { name: "1ro Primaria" },
  });
  const grade2 = await prisma.grade.upsert({
    where: { name: "2do Primaria" },
    update: {},
    create: { name: "2do Primaria" },
  });

  const sectionA = await prisma.section.upsert({
    where: { gradeId_name: { gradeId: grade1.id, name: "A" } },
    update: {},
    create: { name: "A", gradeId: grade1.id },
  });
  const sectionB = await prisma.section.upsert({
    where: { gradeId_name: { gradeId: grade2.id, name: "B" } },
    update: {},
    create: { name: "B", gradeId: grade2.id },
  });

  const period = await prisma.academicPeriod.upsert({
    where: { name: "2026-I" },
    update: {},
    create: {
      name: "2026-I",
      startDate: new Date("2026-03-10"),
      endDate: new Date("2026-07-20"),
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@virgendelcarmen.edu.pe" },
    update: {},
    create: {
      email: "admin@virgendelcarmen.edu.pe",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@aula.com" },
    update: {},
    create: {
      email: "admin@aula.com",
      password: demoPassword,
      role: Role.ADMIN,
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: "docente@virgendelcarmen.edu.pe" },
    update: {},
    create: {
      email: "docente@virgendelcarmen.edu.pe",
      password: demoPassword,
      role: Role.TEACHER,
      teacher: { create: { fullName: "Docente Demo" } },
    },
    include: { teacher: true },
  });
  await prisma.user.upsert({
    where: { email: "docente1@aula.com" },
    update: {},
    create: {
      email: "docente1@aula.com",
      password: demoPassword,
      role: Role.TEACHER,
      teacher: { create: { fullName: "Rosa Quispe Huamán" } },
    },
  });
  await prisma.user.upsert({
    where: { email: "docente2@aula.com" },
    update: {},
    create: {
      email: "docente2@aula.com",
      password: demoPassword,
      role: Role.TEACHER,
      teacher: { create: { fullName: "Carlos Huanca Salazar" } },
    },
  });

  if (!teacherUser.teacher) return;

  const mathCourse = await prisma.course.upsert({
    where: {
      name_sectionId_periodId: {
        name: "Matemática",
        sectionId: sectionA.id,
        periodId: period.id,
      },
    },
    update: {},
    create: {
      name: "Matemática",
      gradeId: grade1.id,
      sectionId: sectionA.id,
      teacherId: teacherUser.teacher.id,
      periodId: period.id,
    },
  });
  const communicationCourse = await prisma.course.upsert({
    where: {
      name_sectionId_periodId: {
        name: "Comunicación",
        sectionId: sectionB.id,
        periodId: period.id,
      },
    },
    update: {},
    create: {
      name: "Comunicación",
      gradeId: grade2.id,
      sectionId: sectionB.id,
      teacherId: teacherUser.teacher.id,
      periodId: period.id,
    },
  });

  const student1 = await prisma.student.upsert({
    where: { code: "STD-001" },
    update: {},
    create: {
      fullName: "Juan Perez Huaman",
      code: "STD-001",
      gradeId: grade1.id,
      sectionId: sectionA.id,
    },
  });
  const student2 = await prisma.student.upsert({
    where: { code: "STD-002" },
    update: {},
    create: {
      fullName: "Maria Quispe Rojas",
      code: "STD-002",
      gradeId: grade1.id,
      sectionId: sectionA.id,
    },
  });
  const student3 = await prisma.student.upsert({
    where: { code: "STD-003" },
    update: {},
    create: {
      fullName: "Luis Salazar Huanca",
      code: "STD-003",
      gradeId: grade2.id,
      sectionId: sectionB.id,
    },
  });

  await prisma.gradeRecord.createMany({
    data: [
      {
        score: 14.0,
        area: "Matemática",
        studentId: student1.id,
        courseId: mathCourse.id,
        teacherId: teacherUser.teacher.id,
      },
      {
        score: 16.5,
        area: "Matemática",
        studentId: student2.id,
        courseId: mathCourse.id,
        teacherId: teacherUser.teacher.id,
      },
      {
        score: 10.5,
        area: "Comunicación",
        studentId: student3.id,
        courseId: communicationCourse.id,
        teacherId: teacherUser.teacher.id,
      },
    ],
  });

  await prisma.attendance.createMany({
    data: [
      {
        date: new Date("2026-04-25"),
        status: "PRESENT",
        studentId: student1.id,
        sectionId: sectionA.id,
        teacherId: teacherUser.teacher.id,
      },
      {
        date: new Date("2026-04-25"),
        status: "LATE",
        studentId: student2.id,
        sectionId: sectionA.id,
        teacherId: teacherUser.teacher.id,
      },
      {
        date: new Date("2026-04-25"),
        status: "JUSTIFIED",
        studentId: student3.id,
        sectionId: sectionB.id,
        teacherId: teacherUser.teacher.id,
      },
    ],
  });

  await prisma.learningSession.createMany({
    data: [
      {
        title: "Números naturales hasta 100",
        grade: "1ro",
        area: "Matemática",
        competence: "Resuelve problemas de cantidad",
        capacity: "Usa estrategias de cálculo",
        performance: "Representa números naturales",
        learningPurpose: "Comprender y aplicar noción de cantidad",
        learningEvidence: "Fichas resueltas en clase",
        startActivity: "Motivación con situaciones cotidianas",
        development: "Trabajo guiado y ejercicios colaborativos",
        closure: "Socialización y retroalimentación",
        resources: "Pizarra, fichas, material base diez",
        evaluation: "Lista de cotejo",
        date: new Date("2026-04-26"),
        teacherId: teacherUser.teacher.id,
      },
    ],
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
