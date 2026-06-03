import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { cronograma, taskStatus } from "@/lib/cronograma";
import { monthKey, monthLabel } from "@/lib/format";

const MS_DAY = 1000 * 60 * 60 * 24;

export function ProgressCurve({ today = new Date() }: { today?: Date }) {
  const data = useMemo(() => {
    const start = new Date(cronograma.projectStart);
    const end = new Date(cronograma.projectEnd);

    // Build monthly buckets
    const months: string[] = [];
    const d = new Date(start.getFullYear(), start.getMonth(), 1);
    while (d <= end) {
      months.push(monthKey(d));
      d.setMonth(d.getMonth() + 1);
    }

    return months.map((mk) => {
      const [y, m] = mk.split("-").map(Number);
      const monthEnd = new Date(y, m, 0); // last day of month
      // Planned: sum of (overlap days / total days) per task up to monthEnd
      let planned = 0;
      cronograma.tasks.forEach((t) => {
        const ts = new Date(t.start).getTime();
        const te = new Date(t.end).getTime();
        const total = Math.max(te - ts, MS_DAY);
        const done = Math.min(Math.max(monthEnd.getTime() - ts, 0), total);
        planned += done / total;
      });
      planned /= cronograma.tasks.length;

      // Real: only count up to current month
      let real: number | null = null;
      if (monthEnd <= today) {
        real = cronograma.tasks.reduce((s, t) => s + (t.prog || 0), 0) / cronograma.tasks.length;
        // Approximate historical real by clamping with planned curve up to today
        const tFactor = Math.min(1, monthEnd.getTime() / today.getTime());
        real = real * tFactor;
      }

      return {
        month: monthLabel(mk),
        planejado: +(planned * 100).toFixed(1),
        realizado: real === null ? null : +(real * 100).toFixed(1),
      };
    });
  }, [today]);

  return (
    <div className="skeu-card p-5">
      <div className="mb-4">
        <h3 className="text-2xl">Curva de avanço</h3>
        <p className="text-xs text-muted-foreground mt-1">Planejado vs. realizado (% físico acumulado)</p>
      </div>
      <div className="skeu-inset p-3" style={{ height: 320 }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="plan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0 0% 70%)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(0 0% 70%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="real" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0 100% 50%)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(0 100% 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" />
            <XAxis dataKey="month" tick={{ fill: "hsl(0 0% 55%)", fontSize: 10 }} stroke="hsl(0 0% 25%)" />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
              stroke="hsl(0 0% 25%)"
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(0 0% 10%)",
                border: "1px solid hsl(0 0% 22%)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number | null) => (v === null ? "—" : `${v}%`)}
            />
            <Area
              type="monotone"
              dataKey="planejado"
              stroke="hsl(0 0% 75%)"
              strokeWidth={2}
              fill="url(#plan)"
              strokeDasharray="4 4"
            />
            <Area
              type="monotone"
              dataKey="realizado"
              stroke="hsl(0 100% 55%)"
              strokeWidth={2.5}
              fill="url(#real)"
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
