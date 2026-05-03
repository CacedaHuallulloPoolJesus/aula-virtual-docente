"use client";

import { Button, Card } from "@/components/ui";
import { areas, periods } from "@/constants/academic";
import type { Student } from "@/types/student";

export type GradeRow = {
  student: Student;
  values: { note1: number; note2: number; note3: number };
  promedio: number;
  nivel: string;
  riesgo: boolean;
};

type Props = {
  area: string;
  setArea: (v: string) => void;
  period: string;
  setPeriod: (v: string) => void;
  rows: GradeRow[];
  onChangeNote: (studentId: string, key: "note1" | "note2" | "note3", value: number) => void;
  onSave: () => void;
  onClearDraft: () => void;
};

export function GradesForm({ area, setArea, period, setPeriod, rows, onChangeNote, onSave, onClearDraft }: Props) {
  return (
    <>
      <Card className="grid gap-3 border-amber-100 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Área curricular</span>
          <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900">
            {areas.map((item) => (
              <option key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Periodo</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900">
            {periods.map((item) => (
              <option key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </Card>
      <Card className="overflow-auto border-amber-100">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">
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
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.student.id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-3 py-2">{row.student.code}</td>
                <td className="px-3 py-2 text-slate-900">
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
                      className="w-20 rounded border border-slate-200 p-1.5 text-slate-900"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 font-semibold text-slate-900">{row.promedio.toFixed(1)}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      row.nivel === "AD"
                        ? "bg-blue-100 text-blue-700"
                        : row.nivel === "A"
                          ? "bg-emerald-100 text-emerald-700"
                          : row.nivel === "B"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {row.nivel}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {row.riesgo ? (
                    <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700">Riesgo académico</span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">Sin riesgo</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="warning" onClick={onSave}>
            Guardar notas
          </Button>
          <Button variant="secondary" onClick={() => alert("Promedios calculados automáticamente.")}>
            Calcular promedios
          </Button>
          <Button variant="secondary" onClick={() => alert("Exportación preparada para PDF/Excel.")}>
            Exportar reporte
          </Button>
          <Button variant="secondary" onClick={onClearDraft}>
            Limpiar
          </Button>
        </div>
      </Card>
    </>
  );
}
