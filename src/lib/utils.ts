export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatScore(score: number) {
  return score.toFixed(1);
}

export function getAttendanceBadge(status: "PRESENTE" | "TARDE" | "FALTA" | "JUSTIFICADO") {
  const map = {
    PRESENTE: "bg-emerald-100 text-emerald-700",
    TARDE: "bg-amber-100 text-amber-700",
    FALTA: "bg-rose-100 text-rose-700",
    JUSTIFICADO: "bg-indigo-100 text-indigo-700",
  };
  return map[status];
}
