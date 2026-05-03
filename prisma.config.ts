import { config } from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

config({
  path: path.join(process.cwd(), ".env"),
  override: true,
  quiet: true,
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? "",
  },
});
