import autoTable from "jspdf-autotable";
import { jsPDF } from "jspdf";
import type { SystemConfig } from "@prisma/client";
import { institutionDefaults } from "@/constants/institution";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) return [11, 31, 58];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Carga el logo desde `/insignia.png` en el navegador (solo cliente). */
export async function fetchInstitutionalLogoDataUrl(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(institutionDefaults.logoPath, { cache: "force-cache" });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!);
    return `data:image/png;base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

export type BuildAcademicPdfOptions = {
  config: SystemConfig | null;
  title: string;
  subtitle?: string;
  teacherName?: string;
  gradeSection?: string;
  columns: { header: string; dataKey: string }[];
  rows: Record<string, string | number>[];
  /** Base64 data URL (image/png). Si existe, se muestra en el encabezado. */
  logoDataUrl?: string | null;
};

export function buildAcademicPdf(opts: BuildAcademicPdfOptions) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const cfg = opts.config;
  const primary = cfg?.primaryColor ?? "#0B1F3A";
  const [r, g, b] = hexToRgb(primary);

  const institutionLine =
    cfg?.institutionName?.trim() ||
    `${institutionDefaults.shortName} — ${institutionDefaults.location}`;

  const headerH = opts.logoDataUrl ? 32 : 28;
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, 210, headerH, "F");

  let textLeft = 14;
  if (opts.logoDataUrl) {
    try {
      doc.addImage(opts.logoDataUrl, "PNG", 14, 6, 18, 18);
      textLeft = 36;
    } catch {
      textLeft = 14;
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(institutionLine, textLeft, 11);
  doc.setFontSize(12);
  doc.text(opts.title, textLeft, 19);
  doc.setFontSize(9);
  const emitted = `Fecha de emisión: ${new Date().toLocaleString("es-PE")}`;
  doc.text(emitted, textLeft, 26);

  doc.setTextColor(30, 30, 30);
  let y = headerH + 8;
  doc.setFontSize(9);
  if (opts.teacherName) {
    doc.text(`Usuario / docente: ${opts.teacherName}`, 14, y);
    y += 5;
  }
  if (opts.gradeSection) {
    doc.text(`Grado y sección: ${opts.gradeSection}`, 14, y);
    y += 5;
  }
  if (opts.subtitle) {
    doc.text(opts.subtitle, 14, y);
    y += 5;
  }

  autoTable(doc, {
    startY: y + 2,
    head: [opts.columns.map((c) => c.header)],
    body: opts.rows.map((row) => opts.columns.map((c) => String(row[c.dataKey] ?? ""))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 76, 129] },
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 40;
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.text("______________________________", 14, Math.min(finalY + 16, 270));
  doc.text("Firma del docente", 14, Math.min(finalY + 22, 276));

  const pageCount = doc.getNumberOfPages();
  doc.setTextColor(90, 90, 90);
  doc.setFontSize(7);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(institutionDefaults.pdfFooterLine1, 14, 287);
    doc.text(institutionDefaults.pdfFooterLine2, 14, 291);
    doc.text(`Página ${i} de ${pageCount}`, 196, 291, { align: "right" });
  }

  return doc;
}

/** Construye PDF con logo (async en cliente). */
export async function buildAcademicPdfWithLogo(opts: Omit<BuildAcademicPdfOptions, "logoDataUrl">) {
  const logo = await fetchInstitutionalLogoDataUrl();
  return buildAcademicPdf({ ...opts, logoDataUrl: logo });
}
