import fs from "fs";
import path from "path";

/** Solo en rutas API / servidor: lee `public/insignia.png` para incrustar en PDF. */
export function getInstitutionalLogoDataUrlFromDisk(): string | null {
  try {
    const filePath = path.join(process.cwd(), "public", "insignia.png");
    if (!fs.existsSync(filePath)) return null;
    return `data:image/png;base64,${fs.readFileSync(filePath).toString("base64")}`;
  } catch {
    return null;
  }
}
