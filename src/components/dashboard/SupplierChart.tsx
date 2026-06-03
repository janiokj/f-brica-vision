import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { cronograma } from "@/lib/cronograma";
import { fmtBRL } from "@/lib/format";

export function SupplierChart() {
  const data = useMemo(() => {
    const map = new Map<string, { name: string; realizado: number; estimado: number }>();
    cronograma.items.forEach((it) => {
      const key = (it.forn_exe || it.forn_est || "Não definido").toString().trim();
      const cur = map.get(key) || { name: key, realizado: 0, estimado: 0 };
      cur.realizado += it.valor_realizado || 0;
      cur.estimado += it.valor_estimado || 0;
      map.set(key, cur);
    });
    return Array.from(map.values())
      .sort((a, b) => b.realizado - a.realizado)
      .slice(0, 10);
  }, []);

  return (
    <div className="skeu-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl">Top fornecedores</h3>
          <p className="text-xs text-muted-foreground mt-1">Valor realizado por fornecedor</p>
        </div>
      </div>
      <div className="skeu-inset p-3" style={{ height: 360 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => fmtBRL(v).replace("R$", "").trim()}
              tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
              stroke="hsl(0 0% 25%)"
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "hsl(0 0% 80%)", fontSize: 11 }}
              width={150}
              stroke="hsl(0 0% 25%)"
            />
            <Tooltip
              cursor={{ fill: "hsl(0 0% 100% / 0.04)" }}
              contentStyle={{
                background: "hsl(0 0% 10%)",
                border: "1px solid hsl(0 0% 22%)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number) => fmtBRL(v)}
            />
            <Bar dataKey="realizado" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === 0 ? "hsl(0 100% 50%)" : i < 3 ? "hsl(0 80% 45%)" : "hsl(0 0% 40%)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
