"use client";

import { Button, Card } from "@/components/ui";
import { areas } from "@/constants/academic";
import type { GradeRow } from "@/types/grades";

type Props = {
  area: string;
  setArea: (v: string) => void;
  periodId: string;
  setPeriodId: (v: string) => void;
  periodOptions: { id: string; name: string }[];
  rows: GradeRow[];
  onChangeNote: (studentId: string, key: "note1" | "note2" | "note3", value: number) => void;
  onSave: () => void;
  onClearDraft: () => void;
  onExportPdf?: () => void;
  onExportExcel?: () => void;
  onViewDetail?: (studentId: string) => void;
  onRecalculate?: () => void;
};

export function GradesForm({
  area,
  setArea,
  periodId,
  setPeriodId,
  periodOptions,
  rows,
  onChangeNote,
  onSave,
  onClearDraft,
  onExportPdf,
  onExportExcel,
  onViewDetail,
  onRecalculate,
}: Props) {
  return (
    <>
      <Card className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-primary/80">Área curricular</span>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full rounded-lg border border-secondary/25 bg-white p-2.5 text-foreground"
          >
            {areas.map((item) => (
              <option key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-primary/80">Período / bimestre</span>
          <select
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value)}
            className="w-full rounded-lg border border-secondary/25 bg-white p-2.5 text-foreground"
          >
            {periodOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </Card>
      <Card className="overflow-auto">
        <table className="min-w-full text-left text-sm text-foreground/90">
          <thead className="border-b border-secondary/30 bg-secondary text-sm font-semibold text-white">
            <tr>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Estudiante</th>
              <th className="px-3 py-2">Área</th>
              <th className="px-3 py-2">Nota 1</th>
              <th className="px-3 py-2">Nota 2</th>
              <th className="px-3 py-2">Nota 3</th>
              <th className="px-3 py-2">Promedio</th>
              <th className="px-3 py-2">Nivel</th>
              <th className="px-3 py-2">Riesgo</th>
              {onViewDetail ? <th className="px-3 py-2">Acciones</th> : null}
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-primary/[0.03]">
            {rows.map((row) => (
              <tr key={row.student.id} className="border-b border-secondary/10 transition-colors hover:bg-cream/50">
                <td className="px-3 py-2">{row.student.code}</td>
                <td className="px-3 py-2 text-foreground">
                  {row.student.firstName} {row.student.lastName}
                </td>
                <td className="px-3 py-2">{area}</td>
                {(["note1", "note2", "note3"] as const).map((field) => (
                  <td key={field} className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={row.values[field]}
                      onChange={(e) => onChangeNote(row.student.id, field, Number(e.target.value))}
                      className="w-20 rounded border border-secondary/20 p-1.5 text-foreground"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 font-semibold text-foreground">{row.promedio.toFixed(1)}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      row.nivel === "AD"
                        ? "bg-primary/12 text-primary ring-1 ring-primary/20"
                        : row.nivel === "A"
                          ? "bg-secondary/12 text-secondary ring-1 ring-secondary/25"
                          : row.nivel === "B"
                            ? "bg-accent/35 text-primary ring-1 ring-accent/45"
                            : "bg-danger/12 text-danger ring-1 ring-danger/25"
                    }`}
                  >
                    {row.nivel}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {row.riesgo ? (
                    <span className="rounded-full bg-danger/12 px-2 py-1 text-xs font-medium text-danger ring-1 ring-danger/25">
                      Riesgo académico
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200/80">
                      Sin riesgo
                    </span>
                  )}
                </td>
                {onViewDetail ? (
                  <td className="px-3 py-2">
                    <Button type="button" variant="secondary" className="cursor-pointer px-2 py-1 text-xs" onClick={() => onViewDetail(row.student.id)}>
                      Ver detalle
                    </Button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="primary" className="cursor-pointer" type="button" onClick={onSave}>
            Guardar notas
          </Button>
          {onRecalculate ? (
            <Button variant="secondary" className="cursor-pointer" type="button" onClick={onRecalculate}>
              Calcular promedio
            </Button>
          ) : null}
          <Button variant="secondary" className="cursor-pointer" type="button" onClick={onClearDraft}>
            Limpiar borrador
          </Button>
          {onExportPdf ? (
            <Button variant="secondary" className="cursor-pointer" type="button" onClick={onExportPdf}>
              Exportar PDF
            </Button>
          ) : null}
          {onExportExcel ? (
            <Button variant="secondary" className="cursor-pointer" type="button" onClick={onExportExcel}>
              Exportar Excel
            </Button>
          ) : null}
        </div>
      </Card>
    </>
  );
}
