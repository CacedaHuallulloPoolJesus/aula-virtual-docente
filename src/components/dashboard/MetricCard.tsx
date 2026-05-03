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
        <p className="text-sm font-medium">{title}</p>
        <Icon size={18} />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </Card>
  );
}
