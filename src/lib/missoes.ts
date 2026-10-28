import type { Estado, Papel } from "./tipos";
import { diasAtivos, diasEntre, hoje, restante } from "./calculos";
import { missoesDupla } from "./duplaDados";

// Duas trilhas, uma para quem aposta e outra para quem apoia.
// A ordem segue o que os estudos mostram que rende mais cedo: primeiro fechar o acesso
// (dinheiro e aplicativos), depois o plano para a hora da vontade, depois dívidas e vida nova.
// Os pontos são fixos e ligados ao esforço. Nada de sorteio, prêmio surpresa ou "quase ganhou".

export type Missao = {
  id: string;
  titulo: string;
  descricao: string;
  passos: string[];
  porque: string;
  pontos: number;
  fase: string;
  compartilhavel?: boolean; // feita com o padrinho (ou com quem aposta) vale o dobro
  automatica?: (e: Estado) => boolean;
  link?: { href: string; rotulo: string };
};

export type Fase = { id: string; titulo: string; subtitulo: string; cor: string; corTexto: string };

// ---------------------------------------------------------------- quem aposta

export const fasesApostador: Fase[] = [
  { id: "portas", titulo: "Fechar as portas", subtitulo: "Tirar a aposta do alcance da mão", cor: "var(--mare)", corTexto: "#fff" },
  { id: "plano", titulo: "Plano para a hora H", subtitulo: "Saber o que fazer quando a vontade vem", cor: "var(--sol)", corTexto: "var(--ardosia)" },
  { id: "dinheiro", titulo: "Dinheiro de volta", subtitulo: "Dívidas no papel e a primeira reserva", cor: "var(--menta)", corTexto: "#fff" },
  { id: "vida", titulo: "Vida que vale", subtitulo: "Ocupar o espaço que a aposta deixou", cor: "var(--coral)", corTexto: "#fff" },
];

const trilhaApostador: Missao[] = [
  {
    id: "primeiro-checkin",
    fase: "portas",
    titulo: "Primeiro check-in",
    descricao: "Contar como foi o seu dia. Leva um minuto.",
    passos: ["Responda humor, vontade e se apostou hoje.", "Repita todo dia no horário que você escolheu."],
    porque: "Anotar a própria aposta todo dia já reduz o quanto se aposta, mesmo sem outra ajuda (Hodgins e colegas, 2009).",
    pontos: 20,
    automatica: (e) => e.checkins.length > 0,
    link: { href: "/app", rotulo: "Fazer check-in" },
  },
  {
    id: "apagar-apps",
    fase: "portas",
    titulo: "Limpar o celular",
    descricao: "Apagar aplicativos, sites salvos e sair dos grupos de palpite.",
    passos: [
      "Apague os aplicativos de aposta e os favoritos do navegador.",
      "Saia dos grupos de palpite e deixe de seguir perfis que divulgam aposta.",
      "Peça para o padrinho conferir com você.",
    ],
    porque: "Afastar os gatilhos e o acesso é uma das estratégias que quem se recuperou mais cita como útil (Rodda e colegas, 2018).",
    pontos: 40,
    compartilhavel: true,
  },
  {
    id: "autoexclusao",
    fase: "portas",
    titulo: "Pedir autoexclusão",
    descricao: "Pedir às casas de aposta que bloqueiem a sua conta.",
    passos: [
      "Entre na área de jogo responsável de cada casa em que você tem conta e peça a autoexclusão pelo maior prazo.",
      "Instale um bloqueador de sites de aposta no celular.",
      "Veja se o seu banco tem opção de bloquear pagamentos para apostas.",
    ],
    porque: "A autoexclusão está ligada a menos aposta e menos prejuízo, e funciona melhor quando cobre todos os sites ao mesmo tempo (Gainsbury, 2014).",
    pontos: 50,
    compartilhavel: true,
  },
  {
    id: "dinheiro-guardado",
    fase: "portas",
    titulo: "Dinheiro com trava",
    descricao: "Deixar menos dinheiro solto na mão nas primeiras semanas.",
    passos: [
      "Tire o cartão de crédito do celular e da carteira digital.",
      "Baixe o limite do Pix, principalmente à noite.",
      "Se fizer sentido, combine com alguém de confiança para cuidar do salário por um tempo.",
    ],
    porque: "Limitar o acesso ao dinheiro é uma das ações mais usadas e mais bem avaliadas por quem conseguiu parar (Rodda e colegas, 2018).",
    pontos: 50,
    compartilhavel: true,
  },
  {
    id: "contar-padrinho",
    fase: "portas",
    titulo: "Escolher seu padrinho",
    descricao: "Contar para alguém de confiança e convidar para acompanhar.",
    passos: ["Escolha uma pessoa que te apoie sem julgar.", "Mostre a aba Família e gere o código de convite."],
    porque: "Ter alguém que apoia e lembra uma vez por semana levou a 77% de recuperados ou melhores em 2 anos, contra 61% sem esse apoio (GamblingLess, 2021).",
    pontos: 50,
    compartilhavel: true,
    link: { href: "/app/familia", rotulo: "Abrir Família" },
  },
  {
    id: "gatilhos",
    fase: "plano",
    titulo: "Mapear seus gatilhos",
    descricao: "Descobrir em que hora, lugar e humor a vontade aparece.",
    passos: ["Faça a atividade Conhecer meus gatilhos.", "Escolha o gatilho mais forte para trabalhar primeiro."],
    porque: "Identificar situações de risco é o primeiro passo da prevenção de recaída (Marlatt e Gordon, 1985).",
    pontos: 30,
    automatica: (e) => (e.atividadesFeitas.gatilhos?.length ?? 0) > 0,
  },
  {
    id: "se-entao",
    fase: "plano",
    titulo: "Frase Se... então",
    descricao: "Decidir antes o que fazer na hora em que a vontade bater.",
    passos: [
      "Complete: Se eu sentir vontade de apostar depois do jogo, então eu vou...",
      "Escreva uma para cada gatilho forte.",
      "Leia em voz alta uma vez por dia nesta semana.",
    ],
    porque: "Planos no formato se-então dobram a chance de cumprir o que se decidiu, com efeito médio a grande em 94 estudos (Gollwitzer e Sheeran, 2006).",
    pontos: 40,
    automatica: (e) => (e.atividadesFeitas["plano-recaida"]?.length ?? 0) > 0,
  },
  {
    id: "atravessar-vontade",
    fase: "plano",
    titulo: "Atravessar uma vontade",
    descricao: "Usar o botão Estou com vontade e deixar a onda passar.",
    passos: ["Quando a vontade vier, aperte o botão.", "Respire até o céu abrir e faça a atividade sugerida."],
    porque: "A vontade sobe, chega no pico e desce em poucos minutos. Observar sem obedecer enfraquece o hábito (Bowen e Marlatt, 2009).",
    pontos: 40,
    automatica: (e) => e.crises.some((c) => c.resultado === "passou" || c.resultado === "diminuiu"),
    link: { href: "/app/crise", rotulo: "Praticar agora" },
  },
  {
    id: "armadilhas",
    fase: "plano",
    titulo: "Desarmar as armadilhas",
    descricao: "Conhecer os pensamentos que fazem a aposta parecer boa ideia.",
    passos: ["Faça a atividade sobre recuperar o que perdeu.", "Escolha a frase-resposta que mais combina com você."],
    porque: "Corrigir crenças erradas sobre sorte e controle é o centro da terapia cognitiva, a abordagem com mais evidência para o jogo (Cowlishaw e colegas, Cochrane, 2012).",
    pontos: 30,
    automatica: (e) => (e.atividadesFeitas["armadilha-recuperar"]?.length ?? 0) + (e.atividadesFeitas["armadilha-dinheiro"]?.length ?? 0) > 0,
  },
  {
    id: "combinado",
    fase: "plano",
    titulo: "Fazer o seu combinado",
    descricao: "Um compromisso com prazo e com alguém sabendo.",
    passos: ["Escolha 30, 90 ou 180 dias.", "Escreva o motivo e quem vai saber."],
    porque: "Compromissos públicos e com prazo são mais cumpridos do que decisões só na cabeça.",
    pontos: 40,
    automatica: (e) => e.trava.ativa,
    link: { href: "/app/combinado", rotulo: "Fazer combinado" },
  },
  {
    id: "dividas-papel",
    fase: "dinheiro",
    titulo: "Dívidas no papel",
    descricao: "Listar tudo o que você deve no Desenrola.",
    passos: ["Cadastre cada dívida com valor, parcela e juros.", "Veja a ordem sugerida para pagar."],
    porque: "Dívida é um dos gatilhos de recaída mais fortes. Enxergar o tamanho real tira a ilusão de que só uma aposta resolve.",
    pontos: 40,
    automatica: (e) => e.dividas.length > 0,
    link: { href: "/app/dividas", rotulo: "Abrir Desenrola" },
  },
  {
    id: "registrato",
    fase: "dinheiro",
    titulo: "Puxar o Registrato",
    descricao: "Ver no site do Banco Central todas as dívidas no seu CPF.",
    passos: ["Entre no Registrato com a sua conta gov.br.", "Compare com a sua lista e acrescente o que faltou."],
    porque: "Muita gente descobre dívidas esquecidas. Fazer junto com o padrinho tira o peso de olhar sozinho.",
    pontos: 40,
    compartilhavel: true,
  },
  {
    id: "primeiro-pagamento",
    fase: "dinheiro",
    titulo: "Primeiro pagamento",
    descricao: "Registrar um pagamento de qualquer valor.",
    passos: ["Pague a dívida que está no topo da lista.", "Registre no Desenrola e veja a barra baixar."],
    porque: "Começar pela vitória pequena mantém a motivação para continuar pagando.",
    pontos: 50,
    automatica: (e) => e.pagamentos.length > 0,
    link: { href: "/app/dividas", rotulo: "Registrar" },
  },
  {
    id: "poupanca-50",
    fase: "dinheiro",
    titulo: "Primeiros R$ 50 guardados",
    descricao: "Começar a reserva para o próximo aperto.",
    passos: ["Guarde qualquer valor no desafio de poupança.", "Siga até completar R$ 50."],
    porque: "Uma reserva pequena evita que um imprevisto vire desculpa para tentar a sorte.",
    pontos: 50,
    automatica: (e) => e.reserva.guardado >= 50,
    link: { href: "/app/dividas", rotulo: "Guardar" },
  },
  {
    id: "programa-sem-aposta",
    fase: "vida",
    titulo: "Um programa sem aposta",
    descricao: "Ver um jogo, passear ou cozinhar junto, sem aposta nenhuma.",
    passos: ["Marque um programa com alguém.", "Se for ver futebol, combine antes que é sem aposta."],
    porque: "Trocar a aposta por atividades que dão prazer reduz recaída, e o tempo livre vazio é um gatilho comum (Rodda e colegas, 2018).",
    pontos: 40,
    compartilhavel: true,
  },
  {
    id: "ajuda-profissional",
    fase: "vida",
    titulo: "Primeiro passo no SUS ou nos JA",
    descricao: "Marcar atendimento no Meu SUS Digital, no CAPS ou ir a uma reunião dos Jogadores Anônimos.",
    passos: ["Veja os contatos na aba Apoio.", "Chame o padrinho para ir junto."],
    porque: "A terapia cognitivo-comportamental reduz aposta e prejuízo no curto prazo (Cochrane, 2012). Grupos de ajuda mútua somam apoio contínuo.",
    pontos: 60,
    compartilhavel: true,
    link: { href: "/app/apoio", rotulo: "Ver contatos" },
  },
  {
    id: "folego-8",
    fase: "vida",
    titulo: "Oito dias de fôlego",
    descricao: "Oito dias usando o app, não precisa ser seguido.",
    passos: ["Check-in, respiração ou atividade contam."],
    porque: "Programas pela internet funcionam mais em quem usa com frequência nas primeiras semanas.",
    pontos: 80,
    automatica: (e) => diasAtivos(e) >= 8,
  },
  {
    id: "divida-quitada",
    fase: "vida",
    titulo: "Primeira dívida quitada",
    descricao: "Zerar uma dívida inteira.",
    passos: ["Continue pagando na ordem do Desenrola."],
    porque: "Cada dívida zerada libera dinheiro para a próxima. É o efeito bola de neve.",
    pontos: 100,
    automatica: (e) => e.dividas.some((d) => d.valorTotal > 0 && restante(d) === 0),
  },
  {
    id: "mes",
    fase: "vida",
    titulo: "Um mês de recomeço",
    descricao: "Trinta dias de caminhada, com pelo menos 15 dias de uso.",
    passos: ["Depois vêm os marcos de 3, 6 e 12 meses."],
    porque: "Os primeiros meses concentram a maior parte das recaídas. Passar por eles com apoio muda o rumo.",
    pontos: 120,
    automatica: (e) => diasEntre(e.perfil.inicio) >= 30 && diasAtivos(e) >= 15,
  },
];

// ---------------------------------------------------------------- quem apoia
// Baseada no CRAFT (Treino de Reforço Comunitário e Familiar), adaptado para o jogo
// por Makarchuk, Hodgins e Peden (2002) e testado com familiares por Hodgins e colegas (2007),
// e no Método dos 5 Passos de Copello e Orford.

export const fasesFamiliar: Fase[] = [
  { id: "entender", titulo: "Entender", subtitulo: "O que está acontecendo e como afeta você", cor: "var(--mare)", corTexto: "#fff" },
  { id: "proteger", titulo: "Proteger a casa", subtitulo: "Dinheiro da família em lugar seguro", cor: "var(--sol)", corTexto: "var(--ardosia)" },
  { id: "conversar", titulo: "Conversar sem brigar", subtitulo: "Falar de um jeito que a pessoa escute", cor: "var(--menta)", corTexto: "#fff" },
  { id: "cuidar", titulo: "Cuidar de você", subtitulo: "Você também precisa de fôlego", cor: "var(--coral)", corTexto: "#fff" },
  { id: "convidar", titulo: "Abrir a porta da ajuda", subtitulo: "Convidar para tratamento na hora certa", cor: "var(--mare-escura)", corTexto: "#fff" },
];

const trilhaFamiliar: Missao[] = [
  {
    id: "f-checkin",
    fase: "entender",
    titulo: "Seu primeiro check-in",
    descricao: "Dizer como você está hoje.",
    passos: ["Escolha uma carinha na tela Hoje.", "Volte amanhã. Seu humor também importa."],
    porque: "Familiares de quem aposta têm mais ansiedade e depressão. O CRAFT cuida primeiro de quem apoia (Hodgins e colegas, 2007).",
    pontos: 20,
    automatica: (e) => e.familia.meuCheckin.length > 0,
    link: { href: "/app", rotulo: "Fazer check-in" },
  },
  {
    id: "f-sinais",
    fase: "entender",
    titulo: "Reconhecer os sinais",
    descricao: "Marcar o que você tem visto em casa.",
    passos: ["Toque nos sinais que você reconhece.", "Três ou mais juntos pedem uma conversa."],
    porque: "A aposta online é fácil de esconder. Quanto antes a família percebe, menor costuma ser o estrago.",
    pontos: 30,
    automatica: (e) => e.familia.sinais.length > 0,
    link: { href: "/app", rotulo: "Ver sinais" },
  },
  {
    id: "f-mapa",
    fase: "entender",
    titulo: "Mapa da aposta",
    descricao: "Anotar quando e em que situações a pessoa costuma apostar.",
    passos: [
      "Pense nos dias e horários em que a aposta aparece: jogo na TV, dia do pagamento, depois de briga.",
      "Anote o que vem antes e o que vem depois.",
    ],
    porque: "O CRAFT começa entendendo o padrão da aposta para saber quando agir e quando esperar (Makarchuk e colegas, 2002).",
    pontos: 40,
  },
  {
    id: "f-contas",
    fase: "proteger",
    titulo: "Separar as contas da casa",
    descricao: "Garantir que aluguel, luz e comida não dependam de quem aposta.",
    passos: [
      "Liste as contas básicas e quem paga cada uma.",
      "Se precisar, coloque as contas essenciais em nome de quem não aposta.",
      "Guarde cartões e senhas que estavam compartilhados.",
    ],
    porque: "Problemas financeiros são o dano mais comum relatado por familiares (Dowling e colegas, 2014). Proteger o básico vem primeiro.",
    pontos: 50,
  },
  {
    id: "f-sem-resgate",
    fase: "proteger",
    titulo: "Combinar o que você não vai pagar",
    descricao: "Decidir com calma que não vai quitar dívida de aposta sem um plano.",
    passos: [
      "Escreva o que você pode e o que não pode fazer.",
      "Se for ajudar, pague direto ao credor, nunca em dinheiro vivo ou Pix.",
    ],
    porque: "No CRAFT, deixar a pessoa sentir as consequências naturais da aposta, sem castigo e sem resgate, aumenta a chance de ela buscar ajuda (Makarchuk e colegas, 2002).",
    pontos: 50,
  },
  {
    id: "f-registrato",
    fase: "proteger",
    titulo: "Registrato lado a lado",
    descricao: "Sentar junto enquanto a pessoa puxa as dívidas no site do Banco Central.",
    passos: ["Combine um horário calmo.", "Só olhe e apoie. A decisão de pagar é dela."],
    porque: "Olhar o tamanho real das dívidas junto, sem acusação, transforma segredo em plano.",
    pontos: 40,
    compartilhavel: true,
  },
  {
    id: "f-roteiro",
    fase: "conversar",
    titulo: "Ler o roteiro de conversa",
    descricao: "Conhecer os passos para começar sem briga.",
    passos: ["Abra Conversar e leia o roteiro.", "Escolha a frase com que você vai começar."],
    porque: "Comunicação positiva, com frases em primeira pessoa e sem rótulo, é uma das habilidades centrais do CRAFT e do Método dos 5 Passos (Copello e Orford).",
    pontos: 30,
    link: { href: "/app/conversa", rotulo: "Abrir roteiro" },
  },
  {
    id: "f-elogio",
    fase: "conversar",
    titulo: "Reconhecer um dia sem aposta",
    descricao: "Dizer em voz alta que percebeu o esforço.",
    passos: ["Escolha um dia bom.", "Fale do que você viu, sem tom de cobrança: Gostei de ver o jogo com você hoje."],
    porque: "Reforçar o comportamento sem aposta, em vez de só reagir à aposta, é o motor do CRAFT.",
    pontos: 40,
    automatica: (e) => e.familia.acoes.some((a) => a.tipo === "elogio"),
  },
  {
    id: "f-programa",
    fase: "conversar",
    titulo: "Um programa sem aposta juntos",
    descricao: "Fazer algo bom juntos, sem aposta envolvida.",
    passos: ["Proponha um passeio, uma comida, um jogo assistido sem aposta.", "Conte no app quando fizerem."],
    porque: "Atividades prazerosas sem aposta competem com ela. No CRAFT, a família ajuda a deixar a vida sem aposta mais atraente.",
    pontos: 40,
    compartilhavel: true,
  },
  {
    id: "f-autocuidado",
    fase: "cuidar",
    titulo: "Uma hora só sua",
    descricao: "Reservar uma hora nesta semana para algo que te faz bem.",
    passos: ["Escolha a atividade e o dia.", "Registre no app quando fizer."],
    porque: "Programas para familiares melhoram a saúde emocional de quem apoia, mesmo quando a pessoa ainda não buscou ajuda (Magnusson e colegas, 2019).",
    pontos: 40,
    automatica: (e) => e.familia.acoes.some((a) => a.tipo === "eu"),
  },
  {
    id: "f-rede",
    fase: "cuidar",
    titulo: "Contar para alguém",
    descricao: "Falar com uma pessoa de confiança, um grupo ou o CAPS.",
    passos: ["Escolha uma pessoa ou serviço da aba Apoio.", "Você não precisa carregar isso sozinho."],
    porque: "O isolamento piora a sobrecarga. Ter apoio próprio está entre os cinco passos de Copello e Orford.",
    pontos: 50,
    link: { href: "/app/apoio", rotulo: "Ver apoio" },
  },
  {
    id: "f-semana",
    fase: "cuidar",
    titulo: "Uma semana de cuidado",
    descricao: "Fazer check-in em 5 dias diferentes.",
    passos: ["Volte todo dia, nem que seja por um minuto."],
    porque: "Acompanhar o próprio humor ajuda a perceber quando é hora de pedir ajuda para si.",
    pontos: 60,
    automatica: (e) => new Set(e.familia.meuCheckin.map((c) => c.data)).size >= 5,
  },
  {
    id: "f-convite",
    fase: "convidar",
    titulo: "Convidar para ajuda",
    descricao: "Sugerir o Recomeço, o SUS ou os JA numa hora boa.",
    passos: [
      "Espere uma janela: depois de uma perda, de uma conversa sincera ou quando a pessoa reclamar da aposta.",
      "Ofereça uma opção concreta e se ofereça para ir junto.",
    ],
    porque: "Em estudos com outras dependências, o CRAFT levou cerca de dois terços das pessoas a entrar em tratamento, mais do que confrontos ou grupos tradicionais (Meyers e colegas).",
    pontos: 60,
  },
  {
    id: "f-padrinho",
    fase: "convidar",
    titulo: "Virar padrinho no app",
    descricao: "Usar o código de convite para acompanhar o progresso.",
    passos: ["Peça para a pessoa gerar o código na aba Família dela.", "Digite o código na tela Hoje."],
    porque: "Apoio humano é o que mais aumenta o efeito de programas de recuperação pela internet (Sagoe e colegas, 2021).",
    pontos: 60,
    compartilhavel: true,
  },
];

// ---------------------------------------------------------------- comum

export function trilhaDe(papel: Papel) {
  return papel === "familiar" ? trilhaFamiliar : trilhaApostador;
}
export function fasesDe(papel: Papel) {
  return papel === "familiar" ? fasesFamiliar : fasesApostador;
}

// Mantido para quem importa a lista direto
export const missoes = trilhaApostador;

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
  acaoFamiliar: 10,
};

// Ações rápidas do dia para quem apoia (cada uma vale pontos uma vez por dia)
export const acoesFamiliar = [
  { tipo: "elogio", titulo: "Reconheci um esforço", texto: "Falei de algo bom que a pessoa fez", cor: "var(--menta)" },
  { tipo: "calma", titulo: "Conversei sem brigar", texto: "Falei em primeira pessoa, sem rótulo", cor: "var(--mare)" },
  { tipo: "limite", titulo: "Mantive um combinado", texto: "Não paguei o que combinei não pagar", cor: "var(--sol)" },
  { tipo: "eu", titulo: "Fiz algo por mim", texto: "Um tempo meu, sem culpa", cor: "var(--coral)" },
];

export function placar(e: Estado) {
  const trilha = trilhaDe(e.perfil.papel);
  const familiar = e.perfil.papel === "familiar";
  const habitos = familiar
    ? e.familia.meuCheckin.length * pontosHabito.checkin + e.familia.acoes.length * pontosHabito.acaoFamiliar
    : e.checkins.length * pontosHabito.checkin +
      Object.values(e.atividadesFeitas).reduce((s, l) => s + l.length, 0) * pontosHabito.atividade +
      e.crises.filter((c) => c.resultado === "passou" || c.resultado === "diminuiu").length * pontosHabito.vontadeAtravessada +
      e.pagamentos.length * pontosHabito.pagamento +
      e.reserva.depositos.length * pontosHabito.deposito;
  // Missões da dupla que não têm par na trilha individual contam aqui (já em dobro).
  // As que têm par marcam a missão individual como feita em dupla.
  const papel = e.perfil.papel;
  const duplaSemPar = missoesDupla.filter((m) => !m.vincula?.[papel] && e.missoes[`dupla-${m.id}`]);
  const deMissoes = trilha.reduce((s, m) => s + pontosDaMissao(e, m), 0) + duplaSemPar.reduce((s, m) => s + m.pontos, 0);
  const total = habitos + deMissoes;
  const lista = familiar ? niveisFamiliar : niveis;
  const nivel = lista.filter((n) => total >= n.minimo).pop() ?? lista[0];
  const indice = lista.indexOf(nivel);
  const proximo = lista.find((n) => n.minimo > total);
  return {
    total,
    habitos,
    deMissoes,
    nivel,
    numeroNivel: indice + 1,
    proximo,
    faltam: proximo ? proximo.minimo - total : 0,
    pctNivel: proximo ? ((total - nivel.minimo) / (proximo.minimo - nivel.minimo)) * 100 : 100,
    feitas: trilha.filter((m) => missaoFeita(e, m)).length,
    totalMissoes: trilha.length,
    comPadrinho: Object.entries(e.missoes).filter(([k, m]) => m.comPadrinho && !k.startsWith("dupla-")).length + duplaSemPar.length,
  };
}

export const niveis = [
  { nome: "Primeiro passo", minimo: 0 },
  { nome: "Pé firme", minimo: 150 },
  { nome: "Rumo certo", minimo: 400 },
  { nome: "Virada", minimo: 800 },
  { nome: "Recomeço de verdade", minimo: 1400 },
];

export const niveisFamiliar = [
  { nome: "Chegando junto", minimo: 0 },
  { nome: "Do lado", minimo: 120 },
  { nome: "Porto seguro", minimo: 320 },
  { nome: "Rede de apoio", minimo: 600 },
  { nome: "Padrinho de verdade", minimo: 900 },
];

export function proximaMissao(e: Estado) {
  return trilhaDe(e.perfil.papel).find((m) => !missaoFeita(e, m));
}

// Semana: dias com algum uso nos últimos 7 dias (meta de 5)
export function diasNaSemana(e: Estado) {
  const datas = new Set<string>();
  const limite = new Date();
  limite.setDate(limite.getDate() - 6);
  const min = limite.toISOString().slice(0, 10);
  const add = (d: string) => d && d.slice(0, 10) >= min && datas.add(d.slice(0, 10));
  e.checkins.forEach((c) => add(c.data));
  e.familia.meuCheckin.forEach((c) => add(c.data));
  e.familia.acoes.forEach((a) => add(a.data));
  e.crises.forEach((c) => add(c.data));
  Object.values(e.atividadesFeitas).forEach((l) => l.forEach(add));
  return datas.size;
}

// Dinheiro que deixou de ir para a aposta: dias registrados sem apostar x perda média por dia
export function dinheiroPoupado(e: Estado) {
  const porDia = (e.perfil.perdaMensal || 0) / 30;
  const dias = e.checkins.filter((c) => !c.apostou).length;
  return Math.round(porDia * dias);
}

export function feitaHoje(e: Estado, tipo: string) {
  return e.familia.acoes.some((a) => a.tipo === tipo && a.data === hoje());
}

// O Caramelo desmaia de saudade quando a missão do dia ficou para trás:
// sem check-in hoje e já passou do horário combinado, ou ontem também ficou sem.
// É só uma brincadeira visual: ninguém perde XP nem nível por isso.
export function estaDesmaiado(e: Estado, agora = new Date()) {
  const familiar = e.perfil.papel === "familiar";
  const datas = new Set(familiar ? e.familia.meuCheckin.map((c) => c.data) : e.checkins.map((c) => c.data));
  if (datas.size === 0 || datas.has(hoje())) return false;
  const ontem = new Date(agora);
  ontem.setDate(ontem.getDate() - 1);
  const dataOntem = `${ontem.getFullYear()}-${String(ontem.getMonth() + 1).padStart(2, "0")}-${String(ontem.getDate()).padStart(2, "0")}`;
  const [h, m] = (e.perfil.horarioCheckin || "21:00").split(":").map(Number);
  const passouDaHora = agora.getHours() * 60 + agora.getMinutes() >= h * 60 + (m || 0);
  return passouDaHora || !datas.has(dataOntem);
}
