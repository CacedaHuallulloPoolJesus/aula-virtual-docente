import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui";

export function MetricCard({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-primary/80">{title}</p>
        <Icon size={18} className="text-secondary" />
      </div>
      <p className="mt-2 text-2xl font-bold text-primary">{value}</p>
    </Card>
  );
}
