// Motor de voz do app: lê textos em voz alta com a voz do próprio aparelho.
// Cuida dos problemas comuns da Web Speech API:
// - escolhe uma voz em português (sem isso, o Chrome às vezes lê com sotaque inglês);
// - divide textos longos em frases (o Chrome corta falas com mais de ~15 segundos);
// - só existe uma fala por vez no app inteiro;
// - fala é disparada dentro do toque (exigência do iPhone).

export type OpcoesFala = {
  velocidade?: number;
  vozURI?: string;
  aoLimite?: (indiceNoTexto: number) => void;
  aoFim?: (interrompida: boolean) => void;
};

let vozesCache: SpeechSynthesisVoice[] = [];
let geracao = 0;
let fimAtual: ((interrompida: boolean) => void) | null = null;
const ouvintes = new Set<() => void>();

export function vozSuportada() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function atualizarVozes() {
  if (!vozSuportada()) return;
  vozesCache = window.speechSynthesis.getVoices();
  ouvintes.forEach((f) => f());
}

// As vozes chegam depois do carregamento da página em alguns navegadores
if (vozSuportada()) {
  atualizarVozes();
  window.speechSynthesis.addEventListener?.("voiceschanged", atualizarVozes);
}

export function aoMudarVozes(f: () => void) {
  ouvintes.add(f);
  return () => {
    ouvintes.delete(f);
  };
}

export function vozesPortugues(): SpeechSynthesisVoice[] {
  if (!vozesCache.length && vozSuportada()) vozesCache = window.speechSynthesis.getVoices();
  const pt = vozesCache.filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith("pt"));
  // Português do Brasil primeiro, depois as vozes locais (funcionam sem internet)
  return pt.sort((a, b) => {
    const br = (v: SpeechSynthesisVoice) => (v.lang.toLowerCase().replace("_", "-") === "pt-br" ? 0 : 1);
    return br(a) - br(b) || Number(b.localService) - Number(a.localService);
  });
}

export function escolherVoz(uri?: string): SpeechSynthesisVoice | undefined {
  const pt = vozesPortugues();
  return (uri && pt.find((v) => v.voiceURI === uri)) || pt[0];
}

// Quebra o texto em pedaços curtos, guardando onde cada um começa no texto original
export function partirEmFrases(texto: string, max = 180): { t: string; ini: number }[] {
  const partes: { t: string; ini: number }[] = [];
  const re = /[^.!?;:\n]+[.!?;:]*|\n+/g;
  let m: RegExpExecArray | null;
  let atual = "";
  let iniAtual = 0;
  const fechar = () => {
    if (atual.trim()) partes.push({ t: atual, ini: iniAtual });
    atual = "";
  };
  while ((m = re.exec(texto))) {
    const pedaco = m[0];
    if (!atual) iniAtual = m.index;
    if ((atual + pedaco).length > max && atual) {
      fechar();
      iniAtual = m.index;
    }
    // Frase sozinha muito longa: corta por vírgula ou espaço
    if (pedaco.length > max) {
      let resto = pedaco;
      let base = m.index;
      while (resto.length > max) {
        let corte = resto.lastIndexOf(",", max);
        if (corte < max / 2) corte = resto.lastIndexOf(" ", max);
        if (corte <= 0) corte = max;
        partes.push({ t: resto.slice(0, corte + 1), ini: base });
        base += corte + 1;
        resto = resto.slice(corte + 1);
      }
      atual = resto;
      iniAtual = base;
      continue;
    }
    atual += pedaco;
  }
  fechar();
  return partes;
}

export function pararFala() {
  if (!vozSuportada()) return;
  geracao++;
  const f = fimAtual;
  fimAtual = null;
  window.speechSynthesis.cancel();
  f?.(true);
}

export function pausarFala() {
  if (vozSuportada()) window.speechSynthesis.pause();
}

export function continuarFala() {
  if (vozSuportada()) window.speechSynthesis.resume();
}

// Fala o texto. Precisa ser chamada direto do toque/clique da pessoa.
export function falar(texto: string, op: OpcoesFala = {}): boolean {
  if (!vozSuportada() || !texto.trim()) return false;
  const s = window.speechSynthesis;
  // Encerra qualquer outra leitura do app
  const anterior = fimAtual;
  fimAtual = null;
  if (s.speaking || s.pending) s.cancel();
  anterior?.(true);

  const minha = ++geracao;
  fimAtual = op.aoFim ?? null;
  const voz = escolherVoz(op.vozURI);
  const frases = partirEmFrases(texto);

  const terminar = (interrompida: boolean) => {
    if (minha !== geracao) return;
    const f = fimAtual;
    fimAtual = null;
    f?.(interrompida);
  };

  const dizer = (i: number) => {
    if (minha !== geracao) return;
    if (i >= frases.length) return terminar(false);
    const { t, ini } = frases[i];
    const u = new SpeechSynthesisUtterance(t);
    u.lang = voz?.lang ?? "pt-BR";
    if (voz) u.voice = voz;
    u.rate = op.velocidade ?? 1;
    u.onstart = () => minha === geracao && op.aoLimite?.(ini);
    u.onboundary = (ev) => minha === geracao && op.aoLimite?.(ini + ev.charIndex);
    u.onend = () => dizer(i + 1);
    u.onerror = (ev) => {
      // "interrupted" e "canceled" acontecem quando outra fala começa: não é erro de verdade
      if (ev.error === "interrupted" || ev.error === "canceled") return;
      dizer(i + 1);
    };
    s.speak(u);
  };

  // O Chrome às vezes fica "pausado" depois de um cancel
  if (s.paused) s.resume();
  dizer(0);
  return true;
}
