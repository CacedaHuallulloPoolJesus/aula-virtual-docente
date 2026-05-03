import autoTable from "jspdf-autotable";
import { jsPDF } from "jspdf";
import type { SystemConfig } from "@prisma/client";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) return [11, 31, 58];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function buildAcademicPdf(opts: {
  config: SystemConfig | null;
  title: string;
  subtitle?: string;
  teacherName?: string;
  gradeSection?: string;
  columns: { header: string; dataKey: string }[];
  rows: Record<string, string | number>[];
}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const cfg = opts.config;
  const primary = cfg?.primaryColor ?? "#0B1F3A";
  const [r, g, b] = hexToRgb(primary);

  doc.setFillColor(r, g, b);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(cfg?.institutionName ?? "Institución educativa", 14, 12);
  doc.setFontSize(11);
  doc.text(opts.title, 14, 22);

  doc.setTextColor(30, 30, 30);
  let y = 34;
  doc.setFontSize(9);
  doc.text(`Generado: ${new Date().toLocaleString("es-PE")}`, 14, y);
  y += 5;
  if (opts.teacherName) {
    doc.text(`Docente: ${opts.teacherName}`, 14, y);
    y += 5;
  }
  if (opts.gradeSection) {
    doc.text(`Grado / Sección: ${opts.gradeSection}`, 14, y);
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

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? y + 40;
  doc.setFontSize(8);
  doc.text("______________________________", 14, finalY + 16);
  doc.text("Firma del docente", 14, finalY + 22);
  doc.setTextColor(100, 100, 100);
  doc.text("Documento generado desde Aula Virtual Docente — uso académico.", 14, 285);

  return doc;
}
