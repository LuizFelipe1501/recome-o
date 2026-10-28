import type { Estado } from "./tipos";
import { melhorSequencia } from "./falas";

// Medalhas por esforço, sempre previsíveis: a pessoa sabe o que fazer para ganhar cada uma.
// Não valem XP (para não contar em dobro com as missões) e nunca são tiradas.

export type Medalha = {
  id: string;
  titulo: string;
  como: string; // o que fazer para ganhar
  desenho: string[]; // 7x7 em pixel
  cor: string;
  ganhou: (e: Estado) => boolean;
};

const D = {
  estrela: ["...X...", "..XXX..", "XXXXXXX", ".XXXXX.", "..XXX..", ".XX.XX.", "XX...XX"],
  chama: ["...X...", "..XX...", "..XXX..", ".XXXXX.", ".XX.XX.", "XX...XX", ".XXXXX."],
  coroa: ["X..X..X", "XX.X.XX", "XXXXXXX", "XXXXXXX", "XXXXXXX", ".......", "XXXXXXX"],
  escudo: ["XXXXXXX", "XXXXXXX", "XX.X.XX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."],
  caixa: [".......", "XXXXXXX", "X..X..X", "XXXXXXX", "X.....X", "X.....X", "XXXXXXX"],
  papel: [".XXXXX.", ".X...X.", ".XXXXX.", ".X...X.", ".XXXXX.", ".X...X.", ".XXXXX."],
  espada: ["......X", ".....XX", "....XX.", "X..XX..", ".XXX...", ".XX....", "X.X...."],
  casa: ["...X...", "..XXX..", ".XXXXX.", "XXXXXXX", ".X...X.", ".X.X.X.", ".X.X.X."],
  aperto: [".......", "XX...XX", "XXX.XXX", ".XXXXX.", "..XXX..", "...X...", "......."],
  olho: [".......", "..XXX..", ".X...X.", "X..X..X", ".X...X.", "..XXX..", "......."],
  coracao: [".......", ".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."],
  calendario: ["X.....X", "XXXXXXX", "X.....X", "X.X.X.X", "X.....X", "X.X.X.X", "XXXXXXX"],
  relogio: ["..XXX..", ".X...X.", "X..X..X", "X..XX.X", "X.....X", ".X...X.", "..XXX.."],
};

export const medalhas: Medalha[] = [
  { id: "primeiro-checkin", titulo: "Primeiro check-in", como: "Faça o primeiro check-in", desenho: D.estrela, cor: "var(--sol)", ganhou: (e) => e.checkins.length >= 1 },
  { id: "sinceridade", titulo: "Sinceridade", como: "Conte no check-in quando tiver aposta", desenho: D.olho, cor: "var(--ceu)", ganhou: (e) => e.checkins.some((c) => c.apostou) },
  { id: "tres-seguidos", titulo: "Três seguidos", como: "Faça check-in 3 dias seguidos", desenho: D.chama, cor: "var(--coral-claro)", ganhou: (e) => melhorSequencia(e) >= 3 },
  { id: "semana-inteira", titulo: "Semana inteira", como: "Faça check-in 7 dias seguidos", desenho: D.calendario, cor: "var(--menta-claro)", ganhou: (e) => melhorSequencia(e) >= 7 },
  { id: "vontade-vencida", titulo: "Vontade vencida", como: "Atravesse uma vontade com o botão Estou com vontade", desenho: D.escudo, cor: "var(--ceu)", ganhou: (e) => e.crises.some((c) => c.resultado === "passou" || c.resultado === "diminuiu") },
  { id: "ferramentas", titulo: "Caixa cheia", como: "Faça 3 atividades diferentes", desenho: D.caixa, cor: "var(--sol-claro)", ganhou: (e) => Object.values(e.atividadesFeitas).filter((l) => l.length > 0).length >= 3 },
  { id: "dividas-no-papel", titulo: "Tudo no papel", como: "Anote uma dívida no Desenrola", desenho: D.papel, cor: "var(--sol-claro)", ganhou: (e) => e.dividas.length >= 1 },
  { id: "primeiro-golpe", titulo: "Primeiro golpe", como: "Registre um pagamento de dívida", desenho: D.espada, cor: "var(--coral-claro)", ganhou: (e) => e.pagamentos.length >= 1 },
  { id: "casinha", titulo: "Casinha de pé", como: "Guarde dinheiro na reserva", desenho: D.casa, cor: "var(--menta-claro)", ganhou: (e) => e.reserva.depositos.length >= 1 },
  { id: "combinado", titulo: "Palavra dada", como: "Faça o seu combinado", desenho: D.aperto, cor: "var(--ceu)", ganhou: (e) => e.trava.ativa || Boolean(e.trava.inicio) },
  { id: "carinho", titulo: "Melhores amigos", como: "Faça carinho no Caramelo", desenho: D.coracao, cor: "var(--coral-claro)", ganhou: (e) => (e.carinhos ?? 0) >= 1 },
  { id: "rotina-nova", titulo: "Rotina nova", como: "Cumpra 7 vezes a sua agenda da hora de risco", desenho: D.relogio, cor: "var(--menta-claro)", ganhou: (e) => Object.values(e.rotina?.feitos ?? {}).reduce((s, l) => s + l.length, 0) >= 7 },
  { id: "um-mes", titulo: "Um mês firme", como: "Chegue a 20 check-ins", desenho: D.coroa, cor: "var(--sol)", ganhou: (e) => e.checkins.length >= 20 },
];

export function medalhasGanhas(e: Estado) {
  return medalhas.filter((m) => m.ganhou(e));
}
