import { cn } from "@repo/ui";

interface StatBlockProps {
  label: string;
  value: number;
  unit?: string | null;
  change?: number;
  changeType?: "absolute" | "percentage";
  className?: string;
}

export default function StatBlock({
  label,
  value,
  unit,
  className,
}: StatBlockProps) {
  return (
    <div className={cn("flex flex-col space-y-2 px-3 py-6", className)}>
      <span className="text-content-muted">{label}</span>
      <div className="flex flex-row items-baseline space-x-2">
        <span className="text-2xl font-semibold">
          {value.toLocaleString("en", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
        {unit && (
          <span className="ml-1 text-sm font-normal text-content-muted">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
