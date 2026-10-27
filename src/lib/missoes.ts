import type { Estado } from "./tipos";
import { diasAtivos, diasEntre, restante } from "./calculos";

// Trilha de missões. Os pontos são sempre previsíveis e ligados ao esforço:
// nada de sorteio, prêmio aleatório ou "quase ganhou", que imitam a aposta.
export type Missao = {
  id: string;
  titulo: string;
  descricao: string;
  pontos: number;
  area: "folego" | "protecao" | "dinheiro" | "conexao";
  compartilhavel?: boolean; // feita com o padrinho vale o dobro
  automatica?: (e: Estado) => boolean;
};

export const missoes: Missao[] = [
  {
    id: "primeiro-checkin",
    titulo: "Primeiro check-in",
    descricao: "Contar para o app como foi o seu dia.",
    pontos: 20,
    area: "folego",
    automatica: (e) => e.checkins.length > 0,
  },
  {
    id: "contar-padrinho",
    titulo: "Escolher seu padrinho ou madrinha",
    descricao: "Contar para alguém de confiança que você está nessa caminhada e convidar para acompanhar.",
    pontos: 50,
    area: "conexao",
    compartilhavel: true,
  },
  {
    id: "apagar-apps",
    titulo: "Limpar o celular",
    descricao: "Apagar aplicativos, sites salvos e grupos de palpites. Com o padrinho conferindo, vale o dobro.",
    pontos: 40,
    area: "protecao",
    compartilhavel: true,
  },
  {
    id: "gatilhos",
    titulo: "Mapear seus gatilhos",
    descricao: "Fazer a atividade Conhecer meus gatilhos.",
    pontos: 30,
    area: "protecao",
    automatica: (e) => (e.atividadesFeitas.gatilhos?.length ?? 0) > 0,
  },
  {
    id: "plano",
    titulo: "Plano para o momento difícil",
    descricao: "Escrever o que você vai fazer quando a vontade apertar.",
    pontos: 30,
    area: "protecao",
    automatica: (e) => (e.atividadesFeitas["plano-recaida"]?.length ?? 0) > 0,
  },
  {
    id: "dividas-papel",
    titulo: "Dívidas no papel",
    descricao: "Listar o que você deve no painel Desenrola.",
    pontos: 40,
    area: "dinheiro",
    automatica: (e) => e.dividas.length > 0,
  },
  {
    id: "registrato",
    titulo: "Puxar o Registrato",
    descricao: "Ver no site do Banco Central todas as dívidas do seu CPF. Melhor ainda sentado ao lado do padrinho.",
    pontos: 40,
    area: "dinheiro",
    compartilhavel: true,
  },
  {
    id: "folego-8",
    titulo: "Oito dias de fôlego",
    descricao: "Oito dias usando o app: check-in, respiração ou atividades.",
    pontos: 80,
    area: "folego",
    automatica: (e) => diasAtivos(e) >= 8,
  },
  {
    id: "primeiro-pagamento",
    titulo: "Primeira missão de pagamento",
    descricao: "Registrar um pagamento de qualquer valor.",
    pontos: 50,
    area: "dinheiro",
    automatica: (e) => e.pagamentos.length > 0,
  },
  {
    id: "programa-sem-aposta",
    titulo: "Um programa sem aposta",
    descricao: "Ver um jogo, passear ou cozinhar junto, sem nenhuma aposta envolvida.",
    pontos: 40,
    area: "conexao",
    compartilhavel: true,
  },
  {
    id: "combinado",
    titulo: "Fazer o seu combinado",
    descricao: "Um compromisso com prazo e com alguém sabendo.",
    pontos: 40,
    area: "protecao",
    automatica: (e) => e.trava.ativa,
  },
  {
    id: "poupanca-50",
    titulo: "Primeiros R$ 50 guardados",
    descricao: "Começar o desafio de poupança.",
    pontos: 50,
    area: "dinheiro",
    automatica: (e) => e.reserva.guardado >= 50,
  },
  {
    id: "ajuda-profissional",
    titulo: "Primeiro passo no SUS ou nos JA",
    descricao: "Marcar o teleatendimento do Meu SUS Digital ou ir a uma reunião dos Jogadores Anônimos.",
    pontos: 60,
    area: "conexao",
    compartilhavel: true,
  },
  {
    id: "divida-quitada",
    titulo: "Primeira dívida quitada",
    descricao: "Zerar uma dívida inteira no painel.",
    pontos: 100,
    area: "dinheiro",
    automatica: (e) => e.dividas.some((d) => d.valorTotal > 0 && restante(d) === 0),
  },
  {
    id: "mes",
    titulo: "Um mês de recomeço",
    descricao: "Trinta dias de caminhada. Depois vêm os marcos de 3, 6 e 12 meses.",
    pontos: 120,
    area: "folego",
    automatica: (e) => diasEntre(e.perfil.inicio) >= 30 && diasAtivos(e) >= 15,
  },
];

export const corArea: Record<Missao["area"], string> = {
  folego: "var(--menta)",
  protecao: "var(--mare)",
  dinheiro: "var(--sol)",
  conexao: "var(--coral)",
};

export const nomeArea: Record<Missao["area"], string> = {
  folego: "Fôlego",
  protecao: "Proteção",
  dinheiro: "Dinheiro",
  conexao: "Conexão",
};

export function missaoFeita(e: Estado, m: Missao) {
  if (e.missoes[m.id]) return e.missoes[m.id];
  if (m.automatica?.(e)) return { data: "", comPadrinho: false };
  return null;
}

export function pontosDaMissao(e: Estado, m: Missao) {
  const f = missaoFeita(e, m);
  if (!f) return 0;
  return f.comPadrinho ? m.pontos * 2 : m.pontos;
}

// Pontos de hábitos que se repetem
export const pontosHabito = {
  checkin: 10,
  atividade: 10,
  vontadeAtravessada: 15,
  pagamento: 25,
  deposito: 15,
};

export function placar(e: Estado) {
  const habitos =
    e.checkins.length * pontosHabito.checkin +
    Object.values(e.atividadesFeitas).reduce((s, l) => s + l.length, 0) * pontosHabito.atividade +
    e.crises.filter((c) => c.resultado === "passou" || c.resultado === "diminuiu").length * pontosHabito.vontadeAtravessada +
    e.pagamentos.length * pontosHabito.pagamento +
    e.reserva.depositos.length * pontosHabito.deposito;
  const deMissoes = missoes.reduce((s, m) => s + pontosDaMissao(e, m), 0);
  const total = habitos + deMissoes;
  const nivel = niveis.filter((n) => total >= n.minimo).pop() ?? niveis[0];
  const proximo = niveis.find((n) => n.minimo > total);
  return {
    total,
    habitos,
    deMissoes,
    nivel,
    proximo,
    faltam: proximo ? proximo.minimo - total : 0,
    feitas: missoes.filter((m) => missaoFeita(e, m)).length,
    comPadrinho: Object.values(e.missoes).filter((m) => m.comPadrinho).length,
  };
}

export const niveis = [
  { nome: "Primeiro passo", minimo: 0 },
  { nome: "Pé firme", minimo: 150 },
  { nome: "Rumo certo", minimo: 400 },
  { nome: "Virada", minimo: 800 },
  { nome: "Recomeço de verdade", minimo: 1400 },
];

export function proximaMissao(e: Estado) {
  return missoes.find((m) => !missaoFeita(e, m));
}
