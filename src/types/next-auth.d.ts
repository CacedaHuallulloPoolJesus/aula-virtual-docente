import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      teacherId?: string;
      assignedGradeId?: string;
      assignedSectionId?: string;
      assignedGradeName?: string;
      assignedSectionName?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    teacherId?: string;
    assignedGradeId?: string;
    assignedSectionId?: string;
    assignedGradeName?: string;
    assignedSectionName?: string;
  }
}
