// Conteúdo do app. Cada bloco indica a base científica ou a fonte oficial.

export type Gatilho = {
  id: string;
  titulo: string;
  descricao: string;
  atividades: string[]; // ids de atividades sugeridas depois da respiração
};

// Situações de maior risco descritas no GamblingLess (Dowling e colegas)
// e no modelo de prevenção de recaída de Marlatt.
export const gatilhos: Gatilho[] = [
  {
    id: "vontade",
    titulo: "Bateu a vontade de apostar",
    descricao: "Do nada, por um anúncio, um jogo na TV ou o celular na mão.",
    atividades: ["adiar", "surfar", "distrair"],
  },
  {
    id: "dinheiro",
    titulo: "Preciso de dinheiro agora",
    descricao: "Conta vencendo, cobrança, aperto no fim do mês.",
    atividades: ["armadilha-dinheiro", "proximo-passo-divida", "calculadora"],
  },
  {
    id: "recuperar",
    titulo: "Quero recuperar o que perdi",
    descricao: "A sensação de que mais uma aposta resolve.",
    atividades: ["armadilha-recuperar", "calculadora", "adiar"],
  },
  {
    id: "emocao",
    titulo: "Estou mal, sozinho ou estressado",
    descricao: "Tristeza, raiva, tédio, briga, cansaço.",
    atividades: ["ligar", "distrair", "surfar"],
  },
  {
    id: "social",
    titulo: "Amigos ou jogo de futebol",
    descricao: "Todo mundo apostando, grupo, bolão, final de campeonato.",
    atividades: ["frase-pronta", "site-clandestino", "armadilha-entendo", "adiar"],
  },
];

export type Atividade = {
  id: string;
  titulo: string;
  minutos: number;
  tipo: "timer" | "texto" | "cartas" | "lista" | "calculadora" | "ligar" | "divida" | "escala";
  intro: string;
  passos?: string[];
  cartas?: { pensamento: string; resposta: string }[];
  campo?: string; // pergunta para anotação
  base: string;
};

export const atividades: Record<string, Atividade> = {
  adiar: {
    id: "adiar",
    titulo: "Adiar por 15 minutos",
    minutos: 15,
    tipo: "timer",
    intro:
      "Você não precisa decidir nada agora. Só combine com você mesmo de esperar 15 minutos. A vontade costuma subir, chegar num pico e baixar.",
    passos: [
      "Saia do lugar onde você está, nem que seja para outro cômodo.",
      "Deixe o celular longe da mão por alguns minutos, se der.",
      "Beba um copo de água devagar.",
    ],
    base: "Adiar e distrair foi a atividade mais bem avaliada no GamblingLess: Curb Your Urge (Hawker e colegas, 2021).",
  },
  surfar: {
    id: "surfar",
    titulo: "Surfar a vontade",
    minutos: 3,
    tipo: "escala",
    intro:
      "Vontade é como onda: sobe, quebra e passa. Em vez de lutar contra ela, observe onde ela aparece no corpo.",
    passos: [
      "Onde você sente a vontade? Peito, mãos, estômago, cabeça?",
      "Dê uma nota para ela agora, de 0 a 10.",
      "Respire devagar e só observe, sem fazer nada com ela.",
      "Depois de alguns minutos, dê outra nota.",
    ],
    base: "Técnica de atenção plena usada no GamblingLess e em programas de prevenção de recaída.",
  },
  distrair: {
    id: "distrair",
    titulo: "Dez minutos para outra coisa",
    minutos: 10,
    tipo: "lista",
    intro: "Escolha uma coisa e faça agora. O objetivo é atravessar os próximos minutos.",
    passos: [
      "Tomar um banho",
      "Dar uma volta no quarteirão",
      "Mandar mensagem para alguém",
      "Arrumar uma gaveta",
      "Ouvir uma música inteira com atenção",
      "Fazer algo com as mãos: lavar a louça, cozinhar",
      "Jogar um jogo que não envolva dinheiro",
    ],
    base: "Distração com atividades concretas, componente de TCC para jogo (Cochrane, Cowlishaw e colegas, 2012).",
  },
  ligar: {
    id: "ligar",
    titulo: "Falar com alguém agora",
    minutos: 5,
    tipo: "ligar",
    intro:
      "Você não precisa contar tudo. Pode só dizer que não está num dia bom e quer conversar um pouco.",
    base: "Apoio social reduz recaída (estudo com Jogadores Anônimos, PubMed 17674163) e o apoio humano triplica o efeito de programas online (Sagoe e colegas, 2021).",
  },
  "armadilha-dinheiro": {
    id: "armadilha-dinheiro",
    titulo: "Apostar para pagar dívida",
    minutos: 2,
    tipo: "cartas",
    intro: "Leia cada pensamento e vire a carta para ver outra forma de olhar.",
    cartas: [
      {
        pensamento: "Se eu ganhar uma, pago tudo.",
        resposta:
          "Foi esse mesmo pensamento que criou parte da dívida. A casa de aposta é feita para ganhar no longo prazo. Cada aposta aumenta a chance de a dívida crescer.",
      },
      {
        pensamento: "Não tenho outra saída.",
        resposta:
          "Existem saídas que não dependem de sorte: renegociar, pedir prazo, a Lei do Superendividamento no Procon ou na Defensoria. O seu plano de dívidas mostra o próximo passo.",
      },
      {
        pensamento: "É só um valor pequeno.",
        resposta:
          "Valores pequenos repetidos viram muito. Veja na calculadora quanto as apostas custaram no mês.",
      },
    ],
    base: "Pressão financeira é o gatilho mais citado de recaída (Hodgins e El-Guebaly, 2004; Dowling e colegas, 2021).",
  },
  "armadilha-recuperar": {
    id: "armadilha-recuperar",
    titulo: "Correr atrás do prejuízo",
    minutos: 2,
    tipo: "cartas",
    intro: "Leia cada pensamento e vire a carta.",
    cartas: [
      {
        pensamento: "Já perdi tanto, agora preciso recuperar.",
        resposta:
          "O dinheiro perdido não volta com mais aposta. Cada rodada é independente da anterior. Parar agora é o que protege o que você ainda tem.",
      },
      {
        pensamento: "Quase ganhei, a próxima vem.",
        resposta:
          "O quase acerto acende no cérebro a mesma área da vitória, mas é perda. As máquinas e jogos usam isso para fazer você continuar.",
      },
      {
        pensamento: "Estou numa maré de azar, vai virar.",
        resposta:
          "Não existe maré. O resultado não lembra o que aconteceu antes. Essa sensação é uma armadilha conhecida, não um sinal.",
      },
    ],
    base: "Quase acerto ativa o circuito de recompensa (Chase e Clark, 2010). Correção de distorções é o núcleo da TCC.",
  },
  "armadilha-entendo": {
    id: "armadilha-entendo",
    titulo: "Eu entendo do jogo",
    minutos: 2,
    tipo: "cartas",
    intro: "Leia cada pensamento e vire a carta.",
    cartas: [
      {
        pensamento: "Eu acompanho futebol, sei quem vai ganhar.",
        resposta:
          "Saber muito de futebol não muda as odds, que já são calculadas para a casa ganhar. Quem mais entende de futebol também perde.",
      },
      {
        pensamento: "Bola na trave quer dizer que estou perto.",
        resposta:
          "Em jogo de habilidade, quase acertar indica aprendizado. Em aposta, não indica nada. O cérebro confunde as duas coisas.",
      },
    ],
    base: "Ilusão de controle e quase acerto (Chase e Clark, 2010).",
  },
  "site-clandestino": {
    id: "site-clandestino",
    titulo: "O site clandestino",
    minutos: 2,
    tipo: "cartas",
    intro: "Desde a proibição, todo site de aposta que continua no ar é ilegal. Leia cada pensamento e vire a carta.",
    cartas: [
      {
        pensamento: "É só achar um site que ainda funciona.",
        resposta: "Site que segue no ar depois da proibição é clandestino. Lá não tem limite de gasto, não tem autoexclusão e não tem a quem reclamar.",
      },
      {
        pensamento: "Se eu ganhar, eu saco e paro.",
        resposta: "No site clandestino nem o saque é garantido. Se a conta for travada ou o site sumir, o dinheiro some junto, e não existe órgão para cobrar.",
      },
      {
        pensamento: "Ganhei um bônus, não estou arriscando nada.",
        resposta: "Bônus é isca. Costuma vir com regras que prendem o dinheiro até você apostar muito mais do que recebeu.",
      },
      {
        pensamento: "Todo mundo do grupo está jogando nesse site.",
        resposta: "Divulgar aposta está proibido, e quem manda o link costuma ganhar comissão quando você perde. Sair do grupo protege você.",
      },
    ],
    base: "Correção de pensamentos, núcleo da TCC. Cenário depois da MP 1.394, de setembro de 2026, que proibiu as apostas de quota fixa no Brasil.",
  },
  "frase-pronta": {
    id: "frase-pronta",
    titulo: "Frases para recusar",
    minutos: 2,
    tipo: "lista",
    intro: "Escolha uma frase e deixe pronta. Não precisa explicar mais nada.",
    passos: [
      "Tô fora dessa, mas vejo o jogo com vocês.",
      "Esse mês tô segurando a grana.",
      "Parei com isso, tá me fazendo bem.",
      "Topo o churrasco, a aposta não.",
    ],
    base: "Treino de habilidades sociais e recusa, componente da TCC.",
  },
  calculadora: {
    id: "calculadora",
    titulo: "Quanto as apostas custaram",
    minutos: 2,
    tipo: "calculadora",
    intro: "Ver o número com calma, longe da tela de aposta, ajuda a decidir com a cabeça fria.",
    base: "A calculadora de gasto foi a atividade mais escolhida em situações de pressão financeira no GamblingLess: In-The-Moment (Austrália, 2025).",
  },
  "proximo-passo-divida": {
    id: "proximo-passo-divida",
    titulo: "O próximo passo das dívidas",
    minutos: 2,
    tipo: "divida",
    intro: "Em vez de buscar dinheiro rápido, olhe o próximo passo concreto do seu plano.",
    base: "Quem enfrentou a dívida teve resposta duas vezes melhor ao tratamento em 3 anos (Carlbring e colegas, 2012).",
  },
  balanca: {
    id: "balanca",
    titulo: "Balança da decisão",
    minutos: 4,
    tipo: "texto",
    intro: "Sem julgamento: o que a aposta te dá e o que ela te tira? Escreva com suas palavras.",
    campo: "O que eu ganho apostando, e o que eu perco?",
    base: "Balança de decisão da entrevista motivacional, uma das atividades mais bem avaliadas no Help on Demand (Brazeau e colegas, 2026).",
  },
  gatilhos: {
    id: "gatilhos",
    titulo: "Conhecer meus gatilhos",
    minutos: 3,
    tipo: "texto",
    intro: "Pense nas últimas vezes que apostou. Onde estava, que horas eram, como se sentia?",
    campo: "Minhas situações de risco são...",
    base: "Recaídas acontecem mais à noite, sozinho e pensando em dinheiro (Hodgins e El-Guebaly, 2004).",
  },
  "plano-recaida": {
    id: "plano-recaida",
    titulo: "Meu plano para o momento difícil",
    minutos: 4,
    tipo: "texto",
    intro: "Escreva no formato: quando acontecer tal coisa, eu vou fazer tal coisa.",
    campo: "Quando eu sentir vontade à noite, eu vou...",
    base: "Plano de prevenção de recaída, componente central da TCC (Marlatt; Cochrane 2012).",
  },
  "ja-mudei": {
    id: "ja-mudei",
    titulo: "Algo que eu já mudei na vida",
    minutos: 3,
    tipo: "texto",
    intro: "Lembre de uma vez em que você mudou um hábito ou passou por algo difícil. O que te ajudou?",
    campo: "Uma vez eu consegui...",
    base: "A atividade mais feita no Help on Demand. Fortalece a confiança em mudar (autoeficácia).",
  },
};

export const atividadesLivres = [
  "balanca",
  "gatilhos",
  "plano-recaida",
  "ja-mudei",
  "calculadora",
  "surfar",
  "adiar",
  "armadilha-recuperar",
  "armadilha-dinheiro",
  "armadilha-entendo",
  "site-clandestino",
  "frase-pronta",
];

// Contatos oficiais e rede de apoio
export type Contato = {
  nome: string;
  oQue: string;
  como: string;
  acao?: { rotulo: string; href: string };
  urgente?: boolean;
};

export const contatos: Contato[] = [
  {
    nome: "CVV",
    oQue: "Apoio emocional e prevenção do suicídio, gratuito, 24 horas.",
    como: "Ligue 188 ou converse pelo site cvv.org.br",
    acao: { rotulo: "Ligar 188", href: "tel:188" },
    urgente: true,
  },
  {
    nome: "SAMU",
    oQue: "Emergência médica, inclusive crise de saúde mental.",
    como: "Ligue 192",
    acao: { rotulo: "Ligar 192", href: "tel:192" },
    urgente: true,
  },
  {
    nome: "Teleatendimento do SUS para jogo",
    oQue: "Atendimento gratuito para quem aposta e para familiares, com ciclo de até 10 sessões.",
    como: "No app Meu SUS Digital, entre em Miniapps e escolha Problemas com jogos.",
  },
  {
    nome: "CAPS",
    oQue: "Centro de Atenção Psicossocial, atendimento presencial do SUS na sua cidade.",
    como: "Procure a Unidade Básica de Saúde mais perto de casa e peça encaminhamento, ou vá direto ao CAPS.",
  },
  {
    nome: "Jogadores Anônimos",
    oQue: "Grupos de ajuda mútua, gratuitos, com quem já passou por isso. Tem reunião online todos os dias, e na primeira você pode só ouvir.",
    como: "Busque por Jogadores Anônimos reunião online, ou Jogadores Anônimos e a sua cidade.",
  },
  {
    nome: "Jog-Anon",
    oQue: "O grupo paralelo dos Jogadores Anônimos para familiares e amigos de quem aposta.",
    como: "Busque por Jog-Anon e a sua cidade, ou pergunte numa reunião dos Jogadores Anônimos.",
  },
  {
    nome: "Ligue 180",
    oQue: "Central de atendimento à mulher em situação de violência.",
    como: "Ligue 180, gratuito, 24 horas.",
    acao: { rotulo: "Ligar 180", href: "tel:180" },
  },
  {
    nome: "Procon ou Defensoria Pública",
    oQue: "Renegociação de todas as dívidas de uma vez pela Lei do Superendividamento, preservando o mínimo para viver.",
    como: "Procure o Procon do seu estado ou a Defensoria Pública e diga que quer o atendimento de superendividamento.",
  },
  {
    nome: "Registrato, do Banco Central",
    oQue: "Mostra de graça todas as dívidas com bancos e financeiras no seu CPF.",
    como: "Acesse pelo site do Banco Central com a conta gov.br.",
    acao: {
      rotulo: "Abrir Registrato",
      href: "https://www.bcb.gov.br/cidadaniafinanceira/registrato",
    },
  },
];

// Sinais precoces de dano (Li e colegas, 2017) e sinais relatados por familiares
export const sinaisPrecoces = [
  "Cortou gastos com comida, contas ou remédio sem explicar",
  "Vendeu ou penhorou objetos",
  "Pede dinheiro emprestado com frequência",
  "Faltou ao trabalho ou à escola",
  "Está dormindo mal ou fica acordado até tarde no celular",
  "Esconde o celular, o extrato ou muda de assunto quando fala de dinheiro",
  "Muda de humor depois de jogos de futebol ou à noite",
  "Mentiu sobre para onde foi o dinheiro",
];

// Roteiro de conversa (TCC para familiares, Magnusson e colegas, 2015)
export const roteiroConversa = [
  {
    titulo: "Escolha a hora certa",
    texto:
      "Converse num momento calmo, sem pressa, longe de discussão sobre dinheiro e longe de jogo na TV.",
  },
  {
    titulo: "Peça licença para falar",
    texto: "Começar com 'Posso te falar uma coisa que está me preocupando?' diminui a defesa da pessoa.",
  },
  {
    titulo: "Fale do que você viu e sentiu",
    texto:
      "Use frases com 'eu': 'Eu fiquei preocupada quando a conta de luz atrasou'. Evite 'você é viciado' ou 'você não tem vergonha'.",
  },
  {
    titulo: "Ouça mais do que fala",
    texto:
      "Pergunte como a pessoa está. Vergonha é o sentimento mais comum de quem aposta, e ela trava a busca por ajuda.",
  },
  {
    titulo: "Ofereça um próximo passo pequeno",
    texto:
      "Em vez de exigir que pare hoje, proponha algo possível: conhecer o NonBet, uma consulta pelo Meu SUS Digital, uma reunião dos Jogadores Anônimos.",
  },
  {
    titulo: "Se não der certo, tudo bem",
    texto:
      "Mudança costuma levar tempo e mais de uma conversa. Você pode tentar de novo outro dia.",
  },
];

export const dinheiroFamilia = [
  "Evite dar dinheiro vivo ou fazer Pix direto. Se quiser ajudar, pague a conta direto ao credor.",
  "Não quite dívida de aposta sem um plano junto, porque o alívio pode virar dinheiro para apostar de novo.",
  "Combine o que você pode e o que não pode fazer, e cumpra o combinado.",
  "Proteja o dinheiro da casa: contas básicas primeiro, em nome de quem não aposta, se precisar.",
];

export const cuidarDeSi = [
  "Você não causou o problema e não consegue resolvê-lo sozinho.",
  "Raiva, cansaço e tristeza são reações comuns de quem convive com isso.",
  "O SUS atende familiares no mesmo teleatendimento do Meu SUS Digital.",
  "Grupos para familiares, como os ligados aos Jogadores Anônimos, ajudam a não carregar isso sozinho.",
];

// Histórias de exemplo. São fictícias e estão marcadas assim no app.
export const historias = [
  {
    nome: "Marta, 38",
    texto:
      "Comecei no tigrinho para fechar o mês. Quando vi, tinha atrasado o aluguel. O que me ajudou foi colocar as dívidas no papel e contar para minha irmã.",
  },
  {
    nome: "Diego, 24",
    texto:
      "Eu achava que entendia de futebol. Apagar os aplicativos não bastou, eu baixava de novo. Dar a senha para meu pai e ir nas reuniões dos Jogadores Anônimos foi o que segurou.",
  },
  {
    nome: "Seu Antônio, 61",
    texto:
      "A vontade vinha toda noite. Fui anotando aqui e percebi que era quando ficava sozinho. Hoje ligo para meu neto nessa hora.",
  },
];

// Fases da jornada (sequência real, por isso numeradas)
export const fases = [
  {
    id: "folego",
    titulo: "Primeiro fôlego",
    descricao: "Oito dias registrando como você está ou respirando com o app.",
    base: "No e-Estesia, cerca de 8 dias de uso foi o ponto a partir do qual as recaídas praticamente pararam.",
  },
  {
    id: "gatilhos",
    titulo: "Conhecer os gatilhos",
    descricao: "Mapear seus momentos de risco e montar o plano para eles.",
    base: "Prevenção de recaída, núcleo da TCC.",
  },
  {
    id: "dividas",
    titulo: "Dívidas no papel",
    descricao: "Listar o que deve e escolher a ordem de ataque.",
    base: "Pressão financeira é o principal gatilho de recaída.",
  },
  {
    id: "primeira",
    titulo: "Primeira vitória no bolso",
    descricao: "Quitar a primeira dívida ou guardar a primeira parte da reserva.",
    base: "Poupar é fator de proteção (Who Bets Online, 2026).",
  },
  {
    id: "mes",
    titulo: "Um mês de recomeço",
    descricao: "Trinta dias de acompanhamento. Depois vêm os marcos de 3, 6 e 12 meses.",
    base: "A recaída é o ponto fraco de todos os tratamentos. O acompanhamento longo é a lacuna apontada pela Cochrane.",
  },
];

// Comparação com a população (feedback normativo, Neighbors e colegas, 2015)
export const dadosPopulacao = {
  naoApostam: 82.4, // LENAD III: 17,6% apostaram no último ano
  fonte: "LENAD III, Unifesp, 2026",
};

// Perguntas da conversa inicial. Não é diagnóstico.
export const perguntasIniciais = [
  "No último mês, você usou dinheiro de contas ou de comida para apostar?",
  "Você tentou parar ou diminuir e não conseguiu?",
  "Você voltou a apostar para tentar recuperar o que perdeu?",
  "Você escondeu de alguém quanto apostou?",
  "Apostar te deixou ansioso, culpado ou com o sono ruim?",
];
