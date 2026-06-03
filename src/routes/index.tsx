import { createFileRoute } from "@tanstack/react-router";
import { cronograma, physicalProgress, projectStatus, taskStatus } from "@/lib/cronograma";
import { fmtBRL, fmtPct, fmtDate } from "@/lib/format";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { GanttChart } from "@/components/dashboard/GanttChart";
import { TaskTable } from "@/components/dashboard/TaskTable";
import { SupplierChart } from "@/components/dashboard/SupplierChart";
import { ProgressCurve } from "@/components/dashboard/ProgressCurve";
import { BudgetTable } from "@/components/dashboard/BudgetTable";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel Executivo · Ampliação Parque Fabril" },
      {
        name: "description",
        content:
          "Dashboard executivo do projeto de ampliação do parque fabril: cronograma, orçamento, fornecedores e avanço físico.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const today = new Date();
  const phys = physicalProgress();
  const { pctTime, start, end } = projectStatus(today);
  const totals = cronograma.totals;
  const orcExec = totals.realizado / (totals.estimado || 1);
  const counts = cronograma.tasks.reduce<Record<string, number>>((acc, t) => {
    const s = taskStatus(t, today);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const atrasadas = counts.atrasada || 0;
  const concluidas = counts.concluida || 0;
  const emAndamento = counts.em_andamento || 0;

  const spi = phys / Math.max(pctTime, 0.0001); // schedule performance proxy
  const spiTone =
    spi >= 0.98 ? "text-[hsl(142_70%_45%)]" : spi >= 0.85 ? "text-[hsl(38_95%_55%)]" : "text-primary";

  return (
    <main className="min-h-screen pb-16">
      {/* Header */}
      <header className="border-b border-border/60 bg-gradient-to-b from-card/60 to-transparent backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-[1500px] mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 skeu-card flex items-center justify-center">
              <span className="text-primary font-display text-2xl leading-none">P</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Painel Executivo · Conselho Diretor
              </p>
              <h1 className="text-2xl md:text-3xl leading-none mt-1">
                Ampliação do <span className="text-gradient-red">Parque Fabril</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider">Horizonte</div>
              <div className="text-foreground font-medium">
                {fmtDate(cronograma.projectStart)} → {fmtDate(cronograma.projectEnd)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider">Atualizado</div>
              <div className="text-foreground font-medium">
                {today.toLocaleDateString("pt-BR")}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1500px] mx-auto px-6 py-6 space-y-6">
        {/* KPIs */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Avanço físico"
            accent
            value={fmtPct(phys)}
            hint={
              <span>
                Linha do tempo: <span className="text-foreground">{fmtPct(pctTime)}</span> ·{" "}
                <span className={spiTone}>SPI {spi.toFixed(2)}</span>
              </span>
            }
          />
          <KpiCard
            label="Orçamento realizado"
            value={fmtBRL(totals.realizado)}
            hint={
              <span>
                {fmtPct(orcExec)} do estimado{" "}
                <span className="text-foreground">({fmtBRL(totals.estimado)})</span>
              </span>
            }
          />
          <KpiCard
            label="Etapas em andamento"
            value={emAndamento}
            hint={
              <span>
                <span className="text-[hsl(142_70%_45%)]">{concluidas} concluídas</span> ·{" "}
                <span className="text-[hsl(38_95%_55%)]">{atrasadas} atrasadas</span>
              </span>
            }
          />
          <KpiCard
            label="Comprometido"
            value={fmtBRL(totals.orcado)}
            hint="Total contratado com fornecedores"
          />
        </section>

        {/* Gantt */}
        <section>
          <GanttChart today={today} />
        </section>

        {/* Curve + Suppliers */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ProgressCurve today={today} />
          <SupplierChart />
        </section>

        {/* Tasks */}
        <section>
          <TaskTable />
        </section>

        {/* Budget */}
        <section>
          <BudgetTable />
        </section>

        <footer className="pt-8 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Gestão de engenharia industrial · Relatório gerencial
        </footer>
      </div>
    </main>
  );
}
