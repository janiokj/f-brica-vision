import { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  hint,
  accent = false,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className="skeu-card p-5 flex flex-col gap-2 min-h-[120px]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
          {label}
        </span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div
        className={
          "font-display text-4xl leading-none " +
          (accent ? "text-gradient-red" : "text-foreground")
        }
      >
        {value}
      </div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
