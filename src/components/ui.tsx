"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useEstado } from "@/lib/estado";

// Lê um texto em voz alta com a voz do próprio aparelho.
// Com a legenda ligada (padrão), mostra o texto e destaca a palavra que está sendo falada.
export function Ouvir({ texto, rotulo = "Ouvir" }: { texto: string; rotulo?: string }) {
  const { estado } = useEstado();
  const [falando, setFalando] = useState(false);
  const [disponivel, setDisponivel] = useState(false);
  const [posicao, setPosicao] = useState(-1);
  const legendas = estado?.prefs.legendas ?? true;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisponivel(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!disponivel) return null;

  const alternar = () => {
    const s = window.speechSynthesis;
    if (falando) {
      s.cancel();
      setFalando(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "pt-BR";
    u.rate = 0.95;
    u.onboundary = (ev) => setPosicao(ev.charIndex);
    u.onend = () => {
      setFalando(false);
      setPosicao(-1);
    };
    s.cancel();
    setPosicao(0);
    s.speak(u);
    setFalando(true);
  };

  // Divide em palavras guardando onde cada uma começa, para achar a palavra falada
  const palavras: { p: string; ini: number }[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) palavras.push({ p: m[0], ini: m.index });
  const atual = palavras.findLastIndex((w) => w.ini <= posicao);

  return (
    <div>
      <button
        type="button"
        onClick={alternar}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-mare-escura hover:bg-ceu"
        aria-pressed={falando}
      >
        <IconeSom />
        {falando ? "Parar" : rotulo}
      </button>
      {falando && legendas && (
        <p className="surgir mt-2 rounded-xl border-[3px] border-ardosia bg-white p-3 text-base leading-relaxed" aria-hidden="true">
          <span className="pixel mb-1 block text-[0.6rem] text-ardosia-suave">LEGENDA</span>
          {palavras.map((w, i) => (
            <span key={i} className={i === atual ? "legenda-palavra" : undefined}>
              {w.p}{" "}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

// ------------------------------------------------------------ ditado por voz

type Reconhecimento = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function criarReconhecimento(): Reconhecimento | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Reconhecimento; webkitSpeechRecognition?: new () => Reconhecimento };
  const C = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return C ? new C() : null;
}

// Junta o que foi falado ao que já estava escrito
export function juntarTexto(atual: string, novo: string) {
  const a = atual.trim();
  const n = novo.trim();
  if (!a) return n.charAt(0).toUpperCase() + n.slice(1);
  return `${a} ${n}`;
}

// Transcrição automática: a pessoa fala e o texto aparece no campo.
// Usa o reconhecimento de voz do próprio navegador (Chrome, Edge, Safari).
export function Ditado({ aoTexto, rotulo = "Falar em vez de digitar" }: { aoTexto: (t: string) => void; rotulo?: string }) {
  const [disponivel, setDisponivel] = useState(false);
  const [ouvindo, setOuvindo] = useState(false);
  const [parcial, setParcial] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const rec = useRef<Reconhecimento | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisponivel(criarReconhecimento() !== null);
    return () => rec.current?.stop();
  }, []);

  if (!disponivel) return null;

  const alternar = () => {
    if (ouvindo) {
      rec.current?.stop();
      return;
    }
    const r = criarReconhecimento();
    if (!r) return;
    r.lang = "pt-BR";
    r.interimResults = true;
    r.continuous = false;
    r.onresult = (ev) => {
      let final = "";
      let meio = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const res = ev.results[i];
        if (res.isFinal) final += res[0].transcript;
        else meio += res[0].transcript;
      }
      setParcial(meio);
      if (final) aoTexto(final);
    };
    r.onerror = (ev) => {
      setErro(
        ev.error === "not-allowed" || ev.error === "service-not-allowed"
          ? "Libere o microfone para este site nas configurações do navegador."
          : ev.error === "no-speech"
            ? "Não ouvi nada. Tente de novo, mais perto do microfone."
            : "Não consegui entender. Tente de novo.",
      );
    };
    r.onend = () => {
      setOuvindo(false);
      setParcial("");
    };
    rec.current = r;
    setErro(null);
    setOuvindo(true);
    r.start();
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={alternar}
        aria-pressed={ouvindo}
        className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-bold ${
          ouvindo ? "border-telha bg-white text-telha" : "border-transparent text-mare-escura hover:bg-ceu"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
          <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {ouvindo ? "Ouvindo... toque para parar" : rotulo}
      </button>
      <p className="sr-only" aria-live="polite">
        {ouvindo ? "Microfone ligado. Pode falar." : ""}
      </p>
      {ouvindo && parcial && <p className="mt-1 text-sm italic text-ardosia-suave">{parcial}</p>}
      {erro && (
        <p role="alert" className="mt-1 text-sm font-bold text-telha">
          {erro}
        </p>
      )}
    </div>
  );
}

export function IconeSom() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const rostos = [
  { v: 1, nome: "Muito mal", boca: "M8 17c1.5-2 6.5-2 8 0" },
  { v: 2, nome: "Mal", boca: "M8.5 16.5c1.5-1 5.5-1 7 0" },
  { v: 3, nome: "Mais ou menos", boca: "M8.5 16h7" },
  { v: 4, nome: "Bem", boca: "M8.5 15.5c1.5 1 5.5 1 7 0" },
  { v: 5, nome: "Muito bem", boca: "M8 15c1.5 2.5 6.5 2.5 8 0" },
];

export function Carinhas({
  valor,
  aoMudar,
  legenda,
}: {
  valor?: number;
  aoMudar: (v: number) => void;
  legenda: string;
}) {
  return (
    <fieldset>
      <legend className="rotulo">{legenda}</legend>
      <div className="flex justify-between gap-1" role="radiogroup">
        {rostos.map((r) => (
          <button
            key={r.v}
            type="button"
            role="radio"
            aria-checked={valor === r.v}
            aria-label={r.nome}
            onClick={() => aoMudar(r.v)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-xs ${
              valor === r.v ? "bg-ceu text-mare-escura ring-2 ring-mare" : "text-ardosia-suave"
            }`}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill={valor === r.v ? "var(--sol-claro)" : "var(--ceu)"} stroke="currentColor" strokeWidth="1.5" />
              <circle cx="9" cy="10" r="1.2" fill="currentColor" />
              <circle cx="15" cy="10" r="1.2" fill="currentColor" />
              <path d={r.boca} stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            </svg>
            <span className="leading-tight">{r.nome}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Escala({
  valor,
  aoMudar,
  legenda,
  min = 0,
  max = 10,
  extremos,
}: {
  valor: number;
  aoMudar: (v: number) => void;
  legenda: string;
  min?: number;
  max?: number;
  extremos: [string, string];
}) {
  return (
    <div>
      <label className="rotulo flex items-baseline justify-between">
        <span>{legenda}</span>
        <span className="font-titulo text-2xl text-mare-escura">{valor}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={valor}
        onChange={(e) => aoMudar(Number(e.target.value))}
        className="w-full accent-[var(--mare)]"
        aria-valuetext={`${valor} de ${max}`}
      />
      <div className="flex justify-between text-sm text-ardosia-suave">
        <span>{extremos[0]}</span>
        <span>{extremos[1]}</span>
      </div>
    </div>
  );
}

// Linha simples de valores ao longo dos dias.
export function MiniGrafico({
  pontos,
  max = 10,
  rotulo,
}: {
  pontos: { data: string; valor: number }[];
  max?: number;
  rotulo: string;
}) {
  if (pontos.length < 2) return null;
  const w = 300;
  const h = 90;
  const passo = w / (pontos.length - 1);
  const y = (v: number) => h - 8 - (v / max) * (h - 16);
  const caminho = pontos.map((p, i) => `${i === 0 ? "M" : "L"}${i * passo},${y(p.valor)}`).join(" ");
  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full" role="img" aria-label={rotulo}>
        <line x1="0" x2={w} y1={y(max / 2)} y2={y(max / 2)} stroke="var(--nuvem)" strokeDasharray="4 4" />
        <path d={caminho} fill="none" stroke="var(--mare)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {pontos.map((p, i) => (
          <circle key={p.data} cx={i * passo} cy={y(p.valor)} r="3.5" fill="var(--branco)" stroke="var(--mare)" strokeWidth="2" />
        ))}
      </svg>
      <figcaption className="sr-only">{rotulo}</figcaption>
    </figure>
  );
}

export function Barra({ valor, rotulo, cor = "var(--sol)" }: { valor: number; rotulo: string; cor?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(valor)));
  return (
    <div
      className="h-3 w-full overflow-hidden rounded-full bg-ceu"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={rotulo}
    >
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: cor }} />
    </div>
  );
}

export function Titulo({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-extrabold">{children}</h1>
      {sub && <p className="mt-2 text-ardosia-suave">{sub}</p>}
    </header>
  );
}

export function Base({ children }: { children: ReactNode }) {
  return (
    <details className="mt-3 text-sm text-ardosia-suave">
      <summary className="cursor-pointer font-bold">De onde vem isso</summary>
      <p className="mt-1">{children}</p>
    </details>
  );
}
