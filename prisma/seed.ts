import { Role, StudentStatus, TeacherStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const adminPassword = await bcrypt.hash("Admin123*", 10);
  const demoPassword = await bcrypt.hash("123456", 10);

  await prisma.report.deleteMany();
  await prisma.agentLog.deleteMany();
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

  await prisma.systemConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      institutionName: "Institución Educativa Virgen del Carmen",
      modularCode: "1234567",
      address: "Huayucachi",
      district: "Huancayo",
      province: "Huancayo",
      region: "Junín",
      academicYear: "2026",
      directorName: "Director(a) I.E. Virgen del Carmen",
      logoUrl: "/insignia.png",
      primaryColor: "#0B1F3A",
      secondaryColor: "#0F4C81",
      accentColor: "#F2B705",
      periodsJson: JSON.stringify(["I Bimestre", "II Bimestre", "III Bimestre", "IV Bimestre"]),
    },
  });

  const grade1 = await prisma.grade.create({ data: { name: "1ro Primaria" } });
  const grade2 = await prisma.grade.create({ data: { name: "2do Primaria" } });

  const sectionA = await prisma.section.create({ data: { name: "A", gradeId: grade1.id } });
  const sectionB = await prisma.section.create({ data: { name: "B", gradeId: grade2.id } });

  const period = await prisma.academicPeriod.create({
    data: {
      name: "2026-I",
      startDate: new Date("2026-03-10"),
      endDate: new Date("2026-07-20"),
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@virgendelcarmen.edu.pe",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@aula.com",
      password: demoPassword,
      role: Role.ADMIN,
    },
  });

  const t1User = await prisma.user.create({
    data: {
      email: "docente1@aula.com",
      password: demoPassword,
      role: Role.TEACHER,
      teacher: {
        create: {
          firstName: "Rosa",
          lastName: "Quispe Huamán",
          fullName: "Rosa Quispe Huamán",
          dni: "40123456",
          status: TeacherStatus.ACTIVE,
          assignedGradeId: grade1.id,
          assignedSectionId: sectionA.id,
        },
      },
    },
    include: { teacher: true },
  });

  const t2User = await prisma.user.create({
    data: {
      email: "docente2@aula.com",
      password: demoPassword,
      role: Role.TEACHER,
      teacher: {
        create: {
          firstName: "Carlos",
          lastName: "Huanca Salazar",
          fullName: "Carlos Huanca Salazar",
          dni: "40234567",
          status: TeacherStatus.ACTIVE,
          assignedGradeId: grade2.id,
          assignedSectionId: sectionB.id,
        },
      },
    },
    include: { teacher: true },
  });

  const teacher1 = t1User.teacher!;
  const teacher2 = t2User.teacher!;

  const mathCourse = await prisma.course.create({
    data: {
      name: "Matemática",
      gradeId: grade1.id,
      sectionId: sectionA.id,
      teacherId: teacher1.id,
      periodId: period.id,
    },
  });
  const communicationCourse = await prisma.course.create({
    data: {
      name: "Comunicación",
      gradeId: grade2.id,
      sectionId: sectionB.id,
      teacherId: teacher2.id,
      periodId: period.id,
    },
  });

  const student1 = await prisma.student.create({
    data: {
      code: "STD-001",
      firstName: "Juan",
      lastName: "Pérez Huamán",
      fullName: "Juan Pérez Huamán",
      dni: "72345678",
      birthDate: new Date("2017-05-12"),
      guardian: "Elena Huamán",
      guardianPhone: "987654321",
      address: "Huayucachi Centro",
      gradeId: grade1.id,
      sectionId: sectionA.id,
      status: StudentStatus.ACTIVE,
    },
  });
  const student2 = await prisma.student.create({
    data: {
      code: "STD-002",
      firstName: "María",
      lastName: "Quispe Rojas",
      fullName: "María Quispe Rojas",
      dni: "73456789",
      birthDate: new Date("2017-10-01"),
      guardian: "Luis Quispe",
      guardianPhone: "945612378",
      address: "Anexo Pucará",
      gradeId: grade1.id,
      sectionId: sectionA.id,
      status: StudentStatus.ACTIVE,
    },
  });
  const student3 = await prisma.student.create({
    data: {
      code: "STD-003",
      firstName: "Luis",
      lastName: "Salazar Huanca",
      fullName: "Luis Salazar Huanca",
      dni: "74567891",
      birthDate: new Date("2016-08-22"),
      guardian: "Ana Huanca",
      guardianPhone: "956789123",
      address: "Huancayo",
      gradeId: grade2.id,
      sectionId: sectionB.id,
      status: StudentStatus.ACTIVE,
    },
  });

  await prisma.gradeRecord.createMany({
    data: [
      {
        note1: 14,
        note2: 15,
        note3: 16,
        area: "Matemática",
        studentId: student1.id,
        courseId: mathCourse.id,
        teacherId: teacher1.id,
      },
      {
        note1: 18,
        note2: 17,
        note3: 19,
        area: "Matemática",
        studentId: student2.id,
        courseId: mathCourse.id,
        teacherId: teacher1.id,
      },
      {
        note1: 10,
        note2: 11,
        note3: 9,
        area: "Comunicación",
        studentId: student3.id,
        courseId: communicationCourse.id,
        teacherId: teacher2.id,
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
        teacherId: teacher1.id,
      },
      {
        date: new Date("2026-04-25"),
        status: "LATE",
        studentId: student2.id,
        sectionId: sectionA.id,
        teacherId: teacher1.id,
      },
      {
        date: new Date("2026-04-25"),
        status: "JUSTIFIED",
        justification: "Cita médica",
        studentId: student3.id,
        sectionId: sectionB.id,
        teacherId: teacher2.id,
      },
    ],
  });

  await prisma.learningSession.create({
    data: {
      title: "Números naturales hasta 100",
      grade: "1ro Primaria",
      section: "A",
      area: "Matemática",
      competence: "Resuelve problemas de cantidad",
      capacity: "Usa estrategias de cálculo",
      performance: "Representa números naturales",
      learningPurpose: "Resolver situaciones de conteo y comparación",
      learningEvidence: "Ficha de trabajo resuelta",
      startActivity: "Saberes previos con material concreto",
      development: "Trabajo guiado con resolución de problemas",
      closure: "Socialización de estrategias",
      resources: "Base diez, pizarra, fichas",
      evaluation: "Lista de cotejo",
      date: new Date("2026-04-26"),
      duration: "90 minutos",
      generatedByIa: false,
      teacherId: teacher1.id,
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
