import type { Divida, Estado, ResumoCompartilhado } from "./tipos";
import { fases } from "./conteudo";
import { missoes, missaoFeita, placar } from "./missoes";

export const hoje = () => {
  const d = new Date();
  const fuso = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - fuso).toISOString().slice(0, 10);
};

export const reais = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const diasEntre = (inicioIso: string) =>
  Math.max(1, Math.floor((Date.now() - new Date(inicioIso).getTime()) / 86400000) + 1);

export function diasSemApostarNoMes(e: Estado) {
  const mes = hoje().slice(0, 7);
  const doMes = e.checkins.filter((c) => c.data.startsWith(mes));
  return doMes.filter((c) => !c.apostou).length;
}

export function diasAtivos(e: Estado) {
  const datas = new Set<string>();
  e.checkins.forEach((c) => datas.add(c.data));
  e.crises.forEach((c) => datas.add(c.data.slice(0, 10)));
  Object.values(e.atividadesFeitas).forEach((l) => l.forEach((d) => datas.add(d.slice(0, 10))));
  return datas.size;
}

export function restante(d: Divida) {
  return Math.max(0, d.valorTotal - d.pago);
}

const pesoCategoria: Record<Divida["categoria"], number> = {
  risco: 0,
  sobrevivencia: 1,
  cara: 2,
  outra: 3,
};

// Ordem de ataque: primeiro o que ameaça a pessoa ou a casa,
// depois a estratégia escolhida (menor saldo ou maior juro).
export function ordenarDividas(dividas: Divida[], estrategia: Estado["estrategia"]) {
  return [...dividas]
    .filter((d) => restante(d) > 0)
    .sort((a, b) => {
      const pa = pesoCategoria[a.categoria];
      const pb = pesoCategoria[b.categoria];
      if (pa !== pb) return pa - pb;
      if (estrategia === "juros") return b.juroMes - a.juroMes;
      return restante(a) - restante(b);
    });
}

export function progressoDividas(dividas: Divida[]) {
  const total = dividas.reduce((s, d) => s + d.valorTotal, 0);
  const pago = dividas.reduce((s, d) => s + Math.min(d.pago, d.valorTotal), 0);
  return total ? Math.round((pago / total) * 100) : 0;
}

export function comprometimentoRenda(e: Estado) {
  const parcelas = e.dividas.filter((d) => restante(d) > 0).reduce((s, d) => s + d.parcela, 0);
  if (!e.perfil.rendaMensal) return null;
  return Math.round((parcelas / e.perfil.rendaMensal) * 100);
}

export function statusFases(e: Estado) {
  const fezAtividade = (id: string) => (e.atividadesFeitas[id]?.length ?? 0) > 0;
  const quitouAlguma = e.dividas.some((d) => d.valorTotal > 0 && restante(d) === 0);
  const ativos = diasAtivos(e);
  const concluidas: Record<string, boolean> = {
    folego: ativos >= 8,
    gatilhos: fezAtividade("gatilhos") && fezAtividade("plano-recaida"),
    dividas: e.dividas.length > 0,
    primeira: quitouAlguma || e.reserva.guardado > 0,
    mes: diasEntre(e.perfil.inicio) >= 30 && ativos >= 15,
  };
  const progresso: Record<string, number> = {
    folego: Math.min(1, ativos / 8),
    gatilhos: (Number(fezAtividade("gatilhos")) + Number(fezAtividade("plano-recaida"))) / 2,
    dividas: e.dividas.length > 0 ? 1 : 0,
    primeira: concluidas.primeira ? 1 : progressoDividas(e.dividas) / 100,
    mes: Math.min(1, diasEntre(e.perfil.inicio) / 30),
  };
  const atual = fases.find((f) => !concluidas[f.id]) ?? fases[fases.length - 1];
  return { concluidas, progresso, atual };
}

export function resumoParaFamilia(e: Estado): ResumoCompartilhado {
  const c = e.familia.compartilhar;
  const ultimo = [...e.checkins].sort((a, b) => b.data.localeCompare(a.data))[0];
  const p = placar(e);
  const feitas = missoes.filter((m) => missaoFeita(e, m));
  return {
    nome: e.perfil.nome || "Seu familiar",
    diasNoRecomeco: diasEntre(e.perfil.inicio),
    diasSemApostarNoMes: c.progresso ? diasSemApostarNoMes(e) : undefined,
    faseAtual: c.progresso ? statusFases(e).atual.titulo : undefined,
    humorRecente: c.humor ? ultimo?.humor : undefined,
    dividasQuitadasPct: c.dividas ? progressoDividas(e.dividas) : undefined,
    pontos: c.progresso ? p.total : undefined,
    nivel: c.progresso ? p.nivel.nome : undefined,
    ultimaMissao: c.progresso ? feitas[feitas.length - 1]?.titulo : undefined,
    atualizado: new Date().toISOString(),
  };
}

export const novoId = () => Math.random().toString(36).slice(2, 10);
