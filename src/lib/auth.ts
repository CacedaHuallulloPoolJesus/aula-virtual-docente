import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credenciales institucionales",
      credentials: {
        email: { label: "Correo institucional", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { teacher: true },
        });

        if (!user) {
          return null;
        }

        const validPassword = await bcrypt.compare(credentials.password, user.password);
        if (!validPassword) {
          return null;
        }

        const displayName = user.teacher
          ? `${user.teacher.firstName} ${user.teacher.lastName}`.trim() || user.teacher.fullName
          : user.email;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          teacherId: user.teacher?.id,
          name: displayName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const u = await prisma.user.findUnique({
          where: { id: user.id as string },
          include: { teacher: { include: { assignedGrade: true, assignedSection: true } } },
        });
        if (u) {
          token.id = u.id;
          token.role = u.role;
          token.teacherId = u.teacher?.id;
          token.assignedGradeId = u.teacher?.assignedGradeId ?? "";
          token.assignedSectionId = u.teacher?.assignedSectionId ?? "";
          token.assignedGradeName = u.teacher?.assignedGrade?.name ?? "";
          token.assignedSectionName = u.teacher?.assignedSection?.name ?? "";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.teacherId = token.teacherId as string | undefined;
        session.user.assignedGradeId = (token.assignedGradeId as string) || undefined;
        session.user.assignedSectionId = (token.assignedSectionId as string) || undefined;
        session.user.assignedGradeName = (token.assignedGradeName as string) || undefined;
        session.user.assignedSectionName = (token.assignedSectionName as string) || undefined;
      }
      return session;
    },
  },
};
