"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button, Card, useToast } from "@/components/ui";
import { IaSessionForm } from "@/components/forms/IaSessionForm";

export default function IaSesionesPage() {
  const { toast } = useToast();
  const router = useRouter();

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-primary">Sesiones de Aprendizaje con Inteligencia Artificial</h2>
          <p className="mt-1 text-sm text-foreground/70">
            Genere propuestas pedagógicas estructuradas y revíselas antes de aplicarlas en el aula.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="accent"
            className="cursor-pointer"
            onClick={() => {
              toast("Abriendo sesiones manuales…", "info");
              router.push("/sesiones");
            }}
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Nueva sesión (manual) / listado
          </Button>
        </div>
      </div>
      <Card className="border-accent/25 bg-cream/30">
        <p className="text-sm text-foreground/80">
          <strong>Nueva sesión con IA:</strong> complete el formulario a la izquierda y pulse <em>Generar sesión</em>. Luego puede editar,
          guardar en el sistema, exportar a PDF o copiar el contenido.
        </p>
      </Card>
      <IaSessionForm />
    </section>
  );
}
