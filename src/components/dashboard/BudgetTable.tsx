import { useMemo, useState } from "react";
import { cronograma } from "@/lib/cronograma";
import { fmtBRL } from "@/lib/format";

type SortKey = "realizado" | "estimado" | "desc";

export function BudgetTable() {
  const [sort, setSort] = useState<SortKey>("realizado");

  const rows = useMemo(() => {
    const arr = [...cronograma.items];
    if (sort === "realizado") arr.sort((a, b) => b.valor_realizado - a.valor_realizado);
    if (sort === "estimado") arr.sort((a, b) => b.valor_estimado - a.valor_estimado);
    if (sort === "desc") arr.sort((a, b) => a.desc.localeCompare(b.desc));
    return arr;
  }, [sort]);

  return (
    <div className="skeu-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-2xl">Orçamento detalhado</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {cronograma.items.length} itens · fornecedores e valores
          </p>
        </div>
        <div className="flex gap-1 text-[11px] uppercase tracking-wider">
          {(["realizado", "estimado", "desc"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setSort(k)}
              className={
                "px-3 py-1.5 rounded transition-colors " +
                (sort === k
                  ? "bg-primary/15 text-foreground border border-primary/40"
                  : "text-muted-foreground hover:text-foreground border border-transparent")
              }
            >
              {k === "desc" ? "A-Z" : k === "realizado" ? "Realizado" : "Estimado"}
            </button>
          ))}
        </div>
      </div>

      <div className="skeu-inset overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card/95 backdrop-blur z-10">
              <tr className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                <th className="text-left font-medium py-2.5 px-3 w-8">#</th>
                <th className="text-left font-medium py-2.5 px-3">Descrição</th>
                <th className="text-left font-medium py-2.5 px-3">Fornecedor</th>
                <th className="text-right font-medium py-2.5 px-3">Estimado</th>
                <th className="text-right font-medium py-2.5 px-3">Realizado</th>
                <th className="text-right font-medium py-2.5 px-3 w-32">Δ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((it) => {
                const delta = it.valor_realizado - it.valor_estimado;
                const pctDelta = it.valor_estimado ? delta / it.valor_estimado : 0;
                const overBudget = delta > 0 && it.valor_estimado > 0;
                return (
                  <tr key={it.id} className="border-t border-border/40 hover:bg-white/[0.02]">
                    <td className="py-2 px-3 text-muted-foreground text-xs">{it.id}</td>
                    <td className="py-2 px-3 text-foreground/90">{it.desc}</td>
                    <td className="py-2 px-3 text-muted-foreground text-xs">
                      {it.forn_exe || it.forn_est || "—"}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">
                      {fmtBRL(it.valor_estimado)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-foreground">
                      {fmtBRL(it.valor_realizado)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-xs">
                      {it.valor_estimado === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span className={overBudget ? "text-[hsl(38_95%_55%)]" : "text-[hsl(142_70%_45%)]"}>
                          {overBudget ? "+" : ""}
                          {(pctDelta * 100).toFixed(0)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
