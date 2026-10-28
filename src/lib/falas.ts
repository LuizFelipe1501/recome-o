import type { Humor } from "@/components/Mascote";
import type { Estado } from "./tipos";
import { diasEntre, hoje } from "./calculos";
import { estaDesmaiado } from "./missoes";

// O que o Caramelo diz na tela Hoje. Muda com o momento da pessoa, a hora, o dia da
// semana e as datas que costumam pesar (fim de semana de jogo, dia de pagamento).
// Tom de amigo: acolhe, comemora o esforço, nunca cobra nem envergonha.

export type FalaCaramelo = { texto: string; humor: Humor };

function dataISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Escolhe sempre a mesma frase no mesmo dia, para não virar sorteio
function doDia<T>(lista: T[], sal = 0): T {
  let h = sal;
  for (const c of hoje()) h = (h * 31 + c.charCodeAt(0)) % 9973;
  return lista[h % lista.length];
}

// Dias seguidos com check-in, contando de hoje (ou de ontem, se hoje ainda não teve)
export function sequencia(e: Estado, agora = new Date()) {
  const datas = new Set(e.checkins.map((c) => c.data));
  const d = new Date(agora);
  if (!datas.has(dataISO(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (datas.has(dataISO(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

// Maior sequência já feita
export function melhorSequencia(e: Estado) {
  const datas = [...new Set(e.checkins.map((c) => c.data))].sort();
  let melhor = 0;
  let atual = 0;
  let anterior: string | null = null;
  for (const d of datas) {
    if (anterior) {
      const ant = new Date(`${anterior}T12:00:00`);
      ant.setDate(ant.getDate() + 1);
      atual = dataISO(ant) === d ? atual + 1 : 1;
    } else atual = 1;
    melhor = Math.max(melhor, atual);
    anterior = d;
  }
  return melhor;
}

const marcos: Record<number, FalaCaramelo> = {
  1: { texto: "Primeiro dia juntos! Eu tô muito feliz que você chegou até aqui.", humor: "animado" },
  3: { texto: "Três dias de caminhada. Os primeiros são os mais difíceis, e você está atravessando.", humor: "feliz" },
  7: { texto: "Uma semana inteira! Olha o que você construiu. Meu rabo não para de abanar.", humor: "emocionado" },
  14: { texto: "Duas semanas! A vontade costuma ficar mais fraca a partir daqui. Você está treinando o cérebro.", humor: "animado" },
  21: { texto: "Três semanas. Tem gente que nem acreditava que dava. Você acreditou.", humor: "emocionado" },
  30: { texto: "Um mês de NonBet! Eu guardei cada dia na memória. Obrigado por me deixar caminhar com você.", humor: "emocionado" },
  60: { texto: "Dois meses. Isso já é um jeito novo de viver, não é sorte.", humor: "apaixonado" },
  90: { texto: "Noventa dias. Lembra do primeiro dia? Olha onde você está agora.", humor: "emocionado" },
};

const manha = [
  "Bom dia! Hoje é um dia só. A gente resolve ele junto.",
  "Bom dia! Acordei pensando em você. Bora começar leve?",
  "Bom dia! Um café, um check-in e o dia já começa do seu lado.",
];
const tarde = [
  "Boa tarde! Passando para lembrar que eu tô torcendo por você.",
  "Boa tarde! Se o dia está pesado, um minuto de check-in já alivia.",
  "Boa tarde! Que tal contar como está indo? Eu gosto de saber.",
];
const noite = [
  "Boa noite! A noite costuma trazer vontade. Eu fico aqui de guarda com você.",
  "Boa noite! Antes de deitar, conta como foi o dia?",
  "Boa noite! Celular na mão de noite é hora de risco. Que tal fazer o check-in e descansar?",
];
const madrugada = [
  "Acordado a essa hora? Se a cabeça não desliga, respira comigo um pouco.",
  "Madrugada é quando a vontade fala mais alto. Eu tô aqui. O botão Estou com vontade também.",
];

const fimDeSemana = [
  "Fim de semana de jogo? Dá para torcer sem apostar. O jogo fica até mais gostoso.",
  "Sábado e domingo costumam apertar. Já tem um plano bom para hoje?",
];
const diaDePagamento = [
  "Dia de dinheiro entrando? Antes de tudo, separa as contas e a casinha. Depois o resto.",
  "Salário caiu? Primeiro as contas, depois a casinha do Caramelo. Eu te ajudo a lembrar.",
];

const depoisDeVontadeAlta = [
  "Ontem a vontade veio forte e você contou para mim. Isso já é coragem.",
  "Ontem foi puxado. Hoje começa do zero de cansaço, não do zero de conquista.",
];
const depoisDeDeslize = [
  "Ontem escorregou. Tudo bem, eu não fui embora. Seu XP também não.",
  "Um dia ruim não apaga os bons. Eu ainda tô aqui, abanando o rabo para você.",
  "Voltar depois de um deslize é a parte mais corajosa. E você voltou.",
];
const voltouDepoisDeSumir = [
  "Você voltou! Eu fiquei com saudade. Nada se perdeu, tá tudo aqui.",
  "Que bom te ver de novo. Não precisa explicar nada, só seguir.",
];

const checkinBom = [
  "Check-in feito! Que orgulho. Que tal uma missão agora?",
  "Mais um dia contado. Eu tô aqui pulando de alegria.",
  "Feito! Cada check-in deixa o caminho um pouco mais firme.",
  "Anotado! Você está cuidando de você, e isso é bonito de ver.",
];
const checkinApostou = [
  "Hoje teve aposta. Obrigado por contar a verdade. Eu não vou a lugar nenhum.",
  "Hoje teve aposta. Isso dói, eu sei. Amanhã a gente tenta de novo, junto.",
];
const checkinVontade = [
  "Vontade alta hoje. Se apertar, o botão Estou com vontade está logo ali. Eu vou junto.",
  "A vontade está forte, mas ela passa. Fica comigo nos próximos 15 minutos.",
];
const checkinTriste = [
  "Dia difícil, né? Não precisa ser forte o tempo todo. Eu fico aqui do seu lado.",
  "Você não está bem hoje e tudo bem dizer isso. Quer ver uma atividade para acalmar?",
];

export function falaDoCaramelo(e: Estado, agora = new Date()): FalaCaramelo {
  const nome = e.perfil.nome ? `, ${e.perfil.nome}` : "";
  const checkinHoje = e.checkins.find((c) => c.data === hoje());

  if (estaDesmaiado(e, agora)) {
    return { texto: "O Caramelo desmaiou de saudade! Faz o check-in de hoje para acordar ele. Seu XP continua todo aqui.", humor: "desmaiado" };
  }

  if (checkinHoje) {
    if (checkinHoje.apostou) return { texto: doDia(checkinApostou), humor: "triste" };
    if (checkinHoje.vontade >= 7) return { texto: doDia(checkinVontade), humor: "preocupado" };
    if (checkinHoje.humor > 0 && checkinHoje.humor <= 2) return { texto: doDia(checkinTriste), humor: "apaixonado" };
    const seq = sequencia(e, agora);
    if (seq >= 3) return { texto: `${seq} dias seguidos de check-in! ${doDia(checkinBom)}`, humor: "animado" };
    return { texto: doDia(checkinBom), humor: "feliz" };
  }

  // Ainda sem check-in hoje
  const dia = diasEntre(e.perfil.inicio);
  if (marcos[dia]) return marcos[dia];

  const ontemD = new Date(agora);
  ontemD.setDate(ontemD.getDate() - 1);
  const ontem = e.checkins.find((c) => c.data === dataISO(ontemD));
  if (ontem?.apostou) return { texto: doDia(depoisDeDeslize), humor: "apaixonado" };
  if (ontem && ontem.vontade >= 7) return { texto: doDia(depoisDeVontadeAlta), humor: "emocionado" };

  const ultima = [...e.checkins].sort((a, b) => b.data.localeCompare(a.data))[0];
  if (ultima) {
    const dias = (new Date(`${hoje()}T12:00:00`).getTime() - new Date(`${ultima.data}T12:00:00`).getTime()) / 86400000;
    if (dias >= 4) return { texto: doDia(voltouDepoisDeSumir), humor: "emocionado" };
  }

  const dm = agora.getDate();
  if ([5, 6, 20, 30].includes(dm)) return { texto: doDia(diaDePagamento), humor: "pensativo" };
  const ds = agora.getDay();
  if (ds === 0 || ds === 6) return { texto: doDia(fimDeSemana), humor: "piscadinha" };

  const h = agora.getHours();
  if (h < 5) return { texto: doDia(madrugada), humor: "preocupado" };
  const lista = h < 12 ? manha : h < 18 ? tarde : noite;
  const texto = doDia(lista);
  return { texto: nome ? texto.replace(/^(Bom dia|Boa tarde|Boa noite)!/, `$1${nome}!`) : texto, humor: h >= 18 ? "normal" : "feliz" };
}

// Respostas quando a pessoa faz carinho no Caramelo. Seguem uma ordem fixa.
export const reacoesCarinho: FalaCaramelo[] = [
  { texto: "Hehe, que carinho bom!", humor: "apaixonado" },
  { texto: "Eu gosto muito de você, sabia?", humor: "emocionado" },
  { texto: "Mais um! Mais um!", humor: "animado" },
  { texto: "Obrigado por cuidar de mim. Eu cuido de você também.", humor: "apaixonado" },
  { texto: "Você é a melhor dupla que eu podia ter.", humor: "piscadinha" },
  { texto: "Tô abanando tanto o rabo que vou sair voando!", humor: "feliz" },
];
