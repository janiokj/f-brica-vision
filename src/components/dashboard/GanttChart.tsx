import { useMemo, useState } from "react";
import { cronograma, taskStatus, statusLabel, type Task } from "@/lib/cronograma";
import { fmtDate, fmtPct } from "@/lib/format";

const MS_DAY = 1000 * 60 * 60 * 24;

const statusColors: Record<string, string> = {
  concluida: "hsl(142 70% 45%)",
  em_andamento: "hsl(0 100% 50%)",
  atrasada: "hsl(38 95% 55%)",
  planejada: "hsl(0 0% 45%)",
};

function monthMarkers(start: Date, end: Date) {
  const out: { date: Date; label: string }[] = [];
  const d = new Date(start.getFullYear(), start.getMonth(), 1);
  while (d <= end) {
    out.push({
      date: new Date(d),
      label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase() +
        " " + String(d.getFullYear()).slice(2),
    });
    d.setMonth(d.getMonth() + 1);
  }
  return out;
}

export function GanttChart({ today = new Date() }: { today?: Date }) {
  const [hover, setHover] = useState<Task | null>(null);
  const start = useMemo(() => new Date(cronograma.projectStart), []);
  const end = useMemo(() => new Date(cronograma.projectEnd), []);
  const totalDays = (end.getTime() - start.getTime()) / MS_DAY;
  const months = monthMarkers(start, end);

  const todayLeft = ((today.getTime() - start.getTime()) / MS_DAY / totalDays) * 100;

  const rowH = 28;
  const labelW = 280;

  return (
    <div className="skeu-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl">Cronograma físico</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {fmtDate(cronograma.projectStart)} → {fmtDate(cronograma.projectEnd)} ·{" "}
            {cronograma.tasks.length} etapas
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-wider">
          {Object.entries(statusLabel).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ background: statusColors[k] }}
              />
              <span className="text-muted-foreground">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto skeu-inset p-3">
        <div style={{ minWidth: 900 }}>
          {/* Month header */}
          <div className="flex border-b border-border/60 pb-2 mb-2" style={{ paddingLeft: labelW }}>
            <div className="relative flex-1 h-5">
              {months.map((m, i) => {
                const left = ((m.date.getTime() - start.getTime()) / MS_DAY / totalDays) * 100;
                return (
                  <div
                    key={i}
                    className="absolute top-0 text-[10px] text-muted-foreground font-medium"
                    style={{ left: `${left}%` }}
                  >
                    <div className="border-l border-border/40 pl-1 h-5">{m.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rows */}
          <div className="relative">
            {/* today line */}
            {todayLeft >= 0 && todayLeft <= 100 && (
              <div
                className="absolute top-0 bottom-0 w-px z-10 pointer-events-none"
                style={{
                  left: `calc(${labelW}px + ${todayLeft}%)`,
                  background: "hsl(0 100% 50% / 0.7)",
                  boxShadow: "0 0 8px hsl(0 100% 50% / 0.6)",
                  transform: `translateX(-${todayLeft}%)`,
                }}
              >
                <div className="absolute -top-1 -translate-x-1/2 text-[9px] uppercase tracking-wider font-bold text-primary bg-background px-1 rounded">
                  Hoje
                </div>
              </div>
            )}

            {cronograma.tasks.map((t, idx) => {
              const tStart = new Date(t.start);
              const tEnd = new Date(t.end);
              const leftPct =
                ((tStart.getTime() - start.getTime()) / MS_DAY / totalDays) * 100;
              const widthPct =
                ((tEnd.getTime() - tStart.getTime()) / MS_DAY / totalDays) * 100;
              const status = taskStatus(t, today);
              return (
                <div
                  key={idx}
                  className="flex items-center hover:bg-white/[0.02] transition-colors"
                  style={{ height: rowH }}
                  onMouseEnter={() => setHover(t)}
                  onMouseLeave={() => setHover(null)}
                >
                  <div
                    className="text-[11px] truncate pr-3 text-foreground/85"
                    style={{ width: labelW }}
                    title={t.name}
                  >
                    <span className="text-muted-foreground mr-1.5">{String(idx + 1).padStart(2, "0")}</span>
                    {t.name}
                  </div>
                  <div className="relative flex-1 h-full">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-4 gantt-bar overflow-hidden"
                      style={{
                        left: `${leftPct}%`,
                        width: `max(${widthPct}%, 6px)`,
                        borderColor: statusColors[status],
                      }}
                    >
                      <div
                        className="h-full gantt-bar-progress"
                        style={{
                          width: `${(t.prog || 0) * 100}%`,
                          background: `linear-gradient(180deg, ${statusColors[status]}, hsl(0 0% 15%))`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {hover && (
        <div className="mt-3 text-xs text-muted-foreground flex flex-wrap gap-4">
          <span className="text-foreground font-medium">{hover.name}</span>
          <span>Responsável: <span className="text-foreground">{hover.resp || "—"}</span></span>
          <span>{fmtDate(hover.start)} → {fmtDate(hover.end)}</span>
          <span>Progresso: <span className="text-foreground">{fmtPct(hover.prog || 0)}</span></span>
        </div>
      )}
    </div>
  );
}
