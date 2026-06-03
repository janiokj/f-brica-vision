import data from "@/data/cronograma.json";

export type Task = {
  name: string;
  resp: string | null;
  prog: number;
  start: string;
  end: string;
};

export type Item = {
  id: number;
  desc: string;
  forn_est: string | null;
  forn_exe: string | null;
  qtd: string | number | null;
  valor_estimado: number;
  valor_orcado: number;
  valor_realizado: number;
};

export type Cronograma = {
  tasks: Task[];
  items: Item[];
  totals: { estimado: number; orcado: number; realizado: number };
  projectStart: string;
  projectEnd: string;
};

export const cronograma = data as Cronograma;

export const projectStatus = (today = new Date()) => {
  const start = new Date(cronograma.projectStart);
  const end = new Date(cronograma.projectEnd);
  const total = end.getTime() - start.getTime();
  const elapsed = Math.min(Math.max(today.getTime() - start.getTime(), 0), total);
  return { pctTime: elapsed / total, start, end };
};

export const physicalProgress = () => {
  const tasks = cronograma.tasks;
  const avg = tasks.reduce((s, t) => s + (t.prog || 0), 0) / tasks.length;
  return avg;
};

export const taskStatus = (t: Task, today = new Date()) => {
  const start = new Date(t.start);
  const end = new Date(t.end);
  if (t.prog >= 1) return "concluida" as const;
  if (today > end) return "atrasada" as const;
  if (today >= start) return "em_andamento" as const;
  return "planejada" as const;
};

export const statusLabel: Record<string, string> = {
  concluida: "Concluída",
  em_andamento: "Em andamento",
  atrasada: "Atrasada",
  planejada: "Planejada",
};
