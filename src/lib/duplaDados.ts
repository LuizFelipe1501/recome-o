// Trilha da dupla: missões que só contam quando quem aposta e quem apoia confirmam.
// Base: apoio humano é o que mais aumenta o efeito de programas pela internet
// (Sagoe e colegas, 2021; GamblingLess, 2021) e o CRAFT dá à família um papel ativo
// na mudança (Makarchuk e colegas, 2002; Hodgins e colegas, 2007).

export type MissaoDupla = {
  id: string;
  titulo: string;
  descricao: string;
  apostador: string; // o que quem aposta faz
  familiar: string; // o que quem apoia faz
  porque: string;
  pontos: number; // por pessoa, já em dobro
  // missão da trilha individual que fica feita junto, para cada papel
  vincula?: { apostador?: string; familiar?: string };
};

export const missoesDupla: MissaoDupla[] = [
  {
    id: "conversa",
    titulo: "Quinze minutos de verdade",
    descricao: "Uma conversa calma sobre por que vale a pena mudar.",
    apostador: "Contar o que a aposta já te custou e o que você quer de volta.",
    familiar: "Só escutar. Sem cobrar, sem dar sermão. No fim, dizer uma coisa boa que você vê na pessoa.",
    porque: "Falar dos próprios motivos aumenta o compromisso com a mudança, e escutar sem julgar é a primeira habilidade do CRAFT.",
    pontos: 80,
    vincula: { apostador: "contar-padrinho", familiar: "f-roteiro" },
  },
  {
    id: "celular",
    titulo: "Celular limpo a quatro mãos",
    descricao: "Tirar as apostas do celular, juntos.",
    apostador: "Apagar aplicativos, sites salvos e sair dos grupos de palpite.",
    familiar: "Conferir junto e ajudar a colocar um bloqueador de sites de aposta.",
    porque: "Tirar o acesso é uma das estratégias que quem parou mais cita como útil (Rodda e colegas, 2018). Com alguém do lado, fica mais difícil voltar atrás.",
    pontos: 80,
    vincula: { apostador: "apagar-apps" },
  },
  {
    id: "dinheiro",
    titulo: "Combinado do dinheiro",
    descricao: "Decidir juntos as regras do dinheiro nas primeiras semanas.",
    apostador: "Propor um limite de Pix, tirar o cartão do celular e dizer o que precisa para o mês.",
    familiar: "Combinar o que você pode e o que não vai fazer, como pagar dívida de aposta sem plano.",
    porque: "Limitar o acesso ao dinheiro é uma das ações mais bem avaliadas por quem conseguiu parar, e combinados claros evitam brigas na hora quente.",
    pontos: 100,
    vincula: { apostador: "dinheiro-guardado", familiar: "f-sem-resgate" },
  },
  {
    id: "registrato",
    titulo: "Registrato lado a lado",
    descricao: "Ver juntos todas as dívidas no CPF, no site do Banco Central.",
    apostador: "Entrar no Registrato com o gov.br e cadastrar no Desenrola o que faltava.",
    familiar: "Sentar do lado e apoiar. A decisão de como pagar é da pessoa.",
    porque: "Olhar o tamanho real das dívidas junto, sem acusação, transforma segredo em plano.",
    pontos: 80,
    vincula: { apostador: "registrato", familiar: "f-registrato" },
  },
  {
    id: "hora-h",
    titulo: "Plano da hora H",
    descricao: "Combinar o que fazer quando a vontade apertar.",
    apostador: "Escolher uma palavra-código para mandar quando a vontade vier.",
    familiar: "Combinar como responder: uma ligação, uma volta, ou só ficar junto até passar.",
    porque: "Planos no formato se-então dobram a chance de cumprir o que se decidiu (Gollwitzer e Sheeran, 2006). Com o outro sabendo, o plano vira ação.",
    pontos: 80,
  },
  {
    id: "programa",
    titulo: "Um programa sem aposta",
    descricao: "Fazer algo bom juntos, sem aposta nenhuma.",
    apostador: "Escolher o programa: um jogo na TV sem bet, um passeio, uma comida.",
    familiar: "Topar e aproveitar. Elogiar o momento no fim.",
    porque: "Trocar a aposta por atividades que dão prazer reduz recaída, e no CRAFT a família ajuda a deixar a vida sem aposta mais atraente.",
    pontos: 80,
    vincula: { apostador: "programa-sem-aposta", familiar: "f-programa" },
  },
  {
    id: "ajuda",
    titulo: "Primeira porta da ajuda",
    descricao: "Dar o primeiro passo no SUS, no CAPS ou nos Jogadores Anônimos, juntos.",
    apostador: "Marcar o atendimento ou escolher a reunião.",
    familiar: "Ir junto ou ficar disponível no dia. Também vale buscar apoio para você.",
    porque: "A terapia cognitivo-comportamental reduz aposta e prejuízo (Cochrane, 2012). No CRAFT, cerca de dois terços das pessoas entraram em tratamento com o apoio da família.",
    pontos: 120,
    vincula: { apostador: "ajuda-profissional", familiar: "f-convite" },
  },
  {
    id: "mes",
    titulo: "Comemorar um mês",
    descricao: "Celebrar 30 dias de caminhada, sem gastar dinheiro com isso.",
    apostador: "Contar o que mudou neste mês.",
    familiar: "Contar o que você percebeu de diferente.",
    porque: "Reconhecer o progresso reforça o comportamento sem aposta, que é o motor do CRAFT.",
    pontos: 120,
  },
];

export const niveisDupla = [
  { nome: "Começando juntos", minimo: 0 },
  { nome: "Parceria", minimo: 2 },
  { nome: "Time", minimo: 4 },
  { nome: "Dupla imbatível", minimo: 7 },
];
