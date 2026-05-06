import { Card } from "@/components/ui";

export function ForbiddenSection() {
  return (
    <Card className="border-danger/25 bg-danger/5 p-6 text-center text-foreground/90">
      <p className="text-lg font-semibold text-primary">Acceso restringido</p>
      <p className="mt-2 text-sm">No tienes permisos para acceder a esta sección.</p>
    </Card>
  );
}
