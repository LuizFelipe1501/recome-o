export type Papel = "apostador" | "familiar";
export type Meta = "parar" | "reduzir" | "decidindo";

export type Checkin = {
  data: string; // AAAA-MM-DD
  humor: number; // 1 a 5
  vontade: number; // 0 a 10
  estresse: number; // 0 a 10
  sono: number; // 1 a 5
  confianca: number; // 0 a 10
  apostou: boolean;
  valor: number;
};

export type Crise = {
  data: string; // ISO
  gatilho: string;
  resultado?: "passou" | "diminuiu" | "apostei";
};

export type CategoriaDivida = "sobrevivencia" | "cara" | "risco" | "outra";

export type Divida = {
  id: string;
  credor: string;
  tipo: string;
  categoria: CategoriaDivida;
  valorTotal: number;
  pago: number;
  juroMes: number; // % ao mês
  parcela: number;
};

export type DinheiroExtra = {
  id: string;
  origem: string;
  valor: number;
  destino: string;
  data: string;
};

export type Pagamento = { id: string; dividaId: string; valor: number; data: string };
export type MissaoFeita = { data: string; comPadrinho: boolean };

export type Trava = {
  ativa: boolean;
  inicio?: string;
  dias?: number;
  pessoaConfianca?: string;
  motivo?: string;
  pedidoSaida?: string; // ISO de quando pediu para desfazer
};

// Agenda da hora de risco: um momento em que a vontade costuma aparecer
// e a atividade que a pessoa escolheu fazer no lugar da aposta.
export type PlanoRotina = {
  id: string;
  momento: string;
  dias: number[]; // 0 = domingo ... 6 = sábado
  hora: string; // HH:MM
  atividade: string;
};

export type Estado = {
  versao: 1;
  perfil: {
    nome: string;
    papel: Papel;
    meta: Meta;
    horarioCheckin: string;
    inicio: string;
    rendaMensal: number;
    perdaMensal: number;
    autoteste: number[];
    onboardingFeito: boolean;
  };
  checkins: Checkin[];
  crises: Crise[];
  dividas: Divida[];
  estrategia: "menor" | "juros";
  reserva: { meta: number; guardado: number; objetivo: string; porMes: number; depositos: { valor: number; data: string }[] };
  pagamentos: Pagamento[];
  missoes: Record<string, MissaoFeita>;
  dinheiroExtra: DinheiroExtra[];
  trava: Trava;
  atividadesFeitas: Record<string, string[]>;
  favoritas: string[];
  anotacoes: Record<string, string>;
  familia: {
    compartilhar: { progresso: boolean; humor: boolean; dividas: boolean };
    sinais: string[];
    meuCheckin: { data: string; como: number }[];
    acoes: { data: string; tipo: string }[];
  };
  prefs: {
    fonte: "normal" | "grande";
    contraste: "normal" | "alto";
    movimento: "normal" | "reduzido";
    lembrete: boolean;
    daltonismo: "nenhum" | "vermelho-verde" | "azul-amarelo";
    legendas: boolean;
    leitorTela: boolean; // mostra o botão "Ler a tela" em todas as telas
    velocidadeVoz: number; // 0.7 a 1.4
    voz: string; // voiceURI escolhida; vazio usa a primeira voz em português
  };
  rotina: { planos: PlanoRotina[]; feitos: Record<string, string[]> }; // feitos por data AAAA-MM-DD
  carinhos: number; // vezes que a pessoa fez carinho no Caramelo
  medalhasVistas: string[];
};

export const estadoInicial = (papel: Papel = "apostador", nome = ""): Estado => ({
  versao: 1,
  perfil: {
    nome,
    papel,
    meta: "decidindo",
    horarioCheckin: "21:00",
    inicio: new Date().toISOString(),
    rendaMensal: 0,
    perdaMensal: 0,
    autoteste: [],
    onboardingFeito: false,
  },
  checkins: [],
  crises: [],
  dividas: [],
  estrategia: "menor",
  reserva: { meta: 300, guardado: 0, objetivo: "Reserva para o próximo aperto", porMes: 50, depositos: [] },
  pagamentos: [],
  missoes: {},
  dinheiroExtra: [],
  trava: { ativa: false },
  atividadesFeitas: {},
  favoritas: [],
  anotacoes: {},
  familia: {
    compartilhar: { progresso: true, humor: false, dividas: false },
    sinais: [],
    meuCheckin: [],
    acoes: [],
  },
  prefs: { fonte: "normal", contraste: "normal", movimento: "normal", lembrete: false, daltonismo: "nenhum", legendas: true, leitorTela: false, velocidadeVoz: 1, voz: "" },
  rotina: { planos: [], feitos: {} },
  carinhos: 0,
  medalhasVistas: [],
});

export type ResumoCompartilhado = {
  nome: string;
  diasNoRecomeco: number;
  diasSemApostarNoMes?: number;
  faseAtual?: string;
  humorRecente?: number;
  dividasQuitadasPct?: number;
  pontos?: number;
  nivel?: string;
  ultimaMissao?: string;
  atualizado: string;
};
