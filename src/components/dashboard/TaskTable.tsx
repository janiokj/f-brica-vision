import { useMemo, useState } from "react";
import { cronograma, taskStatus, statusLabel } from "@/lib/cronograma";
import { fmtDate, fmtPct } from "@/lib/format";

const dotColors: Record<string, string> = {
  concluida: "bg-[hsl(142_70%_45%)]",
  em_andamento: "bg-primary",
  atrasada: "bg-[hsl(38_95%_55%)]",
  planejada: "bg-muted-foreground/50",
};

export function TaskTable() {
  const [filter, setFilter] = useState<string>("all");
  const tasks = useMemo(() => {
    return cronograma.tasks
      .map((t, i) => ({ ...t, idx: i, status: taskStatus(t) }))
      .filter((t) => filter === "all" || t.status === filter);
  }, [filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: cronograma.tasks.length };
    cronograma.tasks.forEach((t) => {
      const s = taskStatus(t);
      c[s] = (c[s] || 0) + 1;
    });
    return c;
  }, []);

  return (
    <div className="skeu-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="text-2xl">Etapas da obra</h3>
        <div className="flex gap-1 text-[11px] uppercase tracking-wider">
          {["all", "em_andamento", "atrasada", "concluida", "planejada"].map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={
                "px-3 py-1.5 rounded transition-colors " +
                (filter === k
                  ? "bg-primary/15 text-foreground border border-primary/40"
                  : "text-muted-foreground hover:text-foreground border border-transparent")
              }
            >
              {k === "all" ? "Todas" : statusLabel[k]} · {counts[k] || 0}
            </button>
          ))}
        </div>
      </div>

      <div className="skeu-inset overflow-hidden">
        <div className="max-h-[460px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card/95 backdrop-blur z-10">
              <tr className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                <th className="text-left font-medium py-2.5 px-3 w-8">#</th>
                <th className="text-left font-medium py-2.5 px-3">Etapa</th>
                <th className="text-left font-medium py-2.5 px-3">Responsável</th>
                <th className="text-left font-medium py-2.5 px-3">Período</th>
                <th className="text-left font-medium py-2.5 px-3 w-40">Progresso</th>
                <th className="text-left font-medium py-2.5 px-3 w-32">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.idx} className="border-t border-border/40 hover:bg-white/[0.02]">
                  <td className="py-2 px-3 text-muted-foreground text-xs">{t.idx + 1}</td>
                  <td className="py-2 px-3 text-foreground/90">{t.name}</td>
                  <td className="py-2 px-3 text-muted-foreground">{t.resp || "—"}</td>
                  <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap">
                    {fmtDate(t.start)} → {fmtDate(t.end)}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${(t.prog || 0) * 100}%`,
                            background:
                              t.status === "atrasada"
                                ? "hsl(38 95% 55%)"
                                : t.status === "concluida"
                                ? "hsl(142 70% 45%)"
                                : "linear-gradient(90deg, hsl(0 90% 55%), hsl(0 100% 45%))",
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                        {fmtPct(t.prog || 0)}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <span className="flex items-center gap-1.5 text-xs">
                      <span className={"w-2 h-2 rounded-full " + dotColors[t.status]} />
                      {statusLabel[t.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
