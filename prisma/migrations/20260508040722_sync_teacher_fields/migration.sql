/*
  Warnings:

  - You are about to drop the column `score` on the `GradeRecord` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,courseId]` on the table `GradeRecord` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `note1` to the `GradeRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `note2` to the `GradeRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `note3` to the `GradeRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TeacherStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StudentStatus" ADD VALUE 'TRANSFERRED';
ALTER TYPE "StudentStatus" ADD VALUE 'WITHDRAWN';

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "justification" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "GradeRecord" DROP COLUMN "score",
ADD COLUMN     "note1" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "note2" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "note3" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "LearningSession" ADD COLUMN     "duration" TEXT NOT NULL DEFAULT '90 minutos',
ADD COLUMN     "generatedByIa" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "section" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "address" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "dni" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "guardian" TEXT,
ADD COLUMN     "guardianPhone" TEXT,
ADD COLUMN     "lastName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "assignedGradeId" TEXT,
ADD COLUMN     "assignedSectionId" TEXT,
ADD COLUMN     "dni" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "status" "TeacherStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "institutionName" TEXT NOT NULL DEFAULT 'I.E. Virgen del Carmen',
    "modularCode" TEXT,
    "address" TEXT,
    "district" TEXT,
    "province" TEXT,
    "region" TEXT,
    "academicYear" TEXT,
    "directorName" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT DEFAULT '#0B1F3A',
    "secondaryColor" TEXT DEFAULT '#0F4C81',
    "accentColor" TEXT DEFAULT '#F2B705',
    "periodsJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "meta" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GradeRecord_studentId_courseId_key" ON "GradeRecord"("studentId", "courseId");

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_assignedGradeId_fkey" FOREIGN KEY ("assignedGradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_assignedSectionId_fkey" FOREIGN KEY ("assignedSectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
