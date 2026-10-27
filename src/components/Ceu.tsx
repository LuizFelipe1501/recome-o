"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Mecânica inspirada no e-Estesia (Jiménez-Murcia e colegas, 2021):
// a tempestade se desfaz quando a pessoa respira devagar.
// Aqui não há sensor: a pessoa segura o círculo enquanto puxa o ar
// e solta enquanto solta o ar. No modo guiado, basta acompanhar.

const CICLOS_PARA_LIMPAR = 6;
const INSPIRAR_MS = 4000;
const SEGURAR_MS = 1500;
const SOLTAR_MS = 6000;

type Fase = "parado" | "inspirar" | "segurar" | "soltar";

const nuvens = [
  { x: 8, y: 14, s: 1.25, ordem: 5 },
  { x: 58, y: 8, s: 1.1, ordem: 4 },
  { x: 28, y: 30, s: 1.4, ordem: 3 },
  { x: 72, y: 34, s: 1.2, ordem: 2 },
  { x: -6, y: 46, s: 1.3, ordem: 1 },
  { x: 46, y: 52, s: 1.5, ordem: 0 },
];

function Nuvem({ x, y, s, visivel, escura }: { x: number; y: number; s: number; visivel: number; escura: number }) {
  const cor = `color-mix(in srgb, #5d6f7b ${Math.round(escura * 100)}%, #ffffff)`;
  return (
    <g
      style={{
        opacity: visivel,
        transform: `translate(${(x + (1 - visivel) * 40) * 4}px, ${y * 4}px) scale(${s})`,
        transition: "opacity 2.5s ease, transform 3s ease",
      }}
    >
      <ellipse cx="60" cy="40" rx="55" ry="24" fill={cor} />
      <ellipse cx="35" cy="30" rx="30" ry="22" fill={cor} />
      <ellipse cx="80" cy="24" rx="34" ry="26" fill={cor} />
    </g>
  );
}

export function Ceu({ aoTerminar }: { aoTerminar: () => void }) {
  const [ciclos, setCiclos] = useState(0);
  const [fase, setFase] = useState<Fase>("parado");
  const [escala, setEscala] = useState(0.55);
  const [guiado, setGuiado] = useState(false);
  const [aviso, setAviso] = useState("Segure o círculo enquanto puxa o ar pelo nariz.");
  const inicioToque = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const limpo = Math.min(1, ciclos / CICLOS_PARA_LIMPAR);
  const terminou = ciclos >= CICLOS_PARA_LIMPAR;

  const animar = useCallback((de: number, para: number, ms: number) => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const passo = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const suave = 0.5 - Math.cos(Math.PI * k) / 2;
      setEscala(de + (para - de) * suave);
      if (k < 1) raf.current = requestAnimationFrame(passo);
    };
    raf.current = requestAnimationFrame(passo);
  }, []);

  const limparTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(
    () => () => {
      limparTimers();
      if (raf.current) cancelAnimationFrame(raf.current);
    },
    [],
  );

  // Modo guiado: o círculo conduz a respiração sozinho.
  useEffect(() => {
    if (!guiado || terminou) return;
    let ativo = true;
    const ciclo = () => {
      if (!ativo) return;
      setFase("inspirar");
      setAviso("Puxe o ar devagar pelo nariz.");
      animar(0.55, 1, INSPIRAR_MS);
      timers.current.push(
        setTimeout(() => {
          setFase("segurar");
          setAviso("Segure um pouco.");
        }, INSPIRAR_MS),
        setTimeout(() => {
          setFase("soltar");
          setAviso("Solte o ar devagar pela boca.");
          animar(1, 0.55, SOLTAR_MS);
        }, INSPIRAR_MS + SEGURAR_MS),
        setTimeout(() => {
          setCiclos((c) => c + 1);
          setFase("parado");
          ciclo();
        }, INSPIRAR_MS + SEGURAR_MS + SOLTAR_MS),
      );
    };
    ciclo();
    return () => {
      ativo = false;
      limparTimers();
    };
  }, [guiado, terminou, animar]);


  const pressionar = () => {
    if (guiado || terminou || inicioToque.current) return;
    inicioToque.current = performance.now();
    setFase("inspirar");
    setAviso("Puxe o ar devagar... continue segurando.");
    animar(escala, 1, INSPIRAR_MS);
  };

  const soltar = () => {
    if (guiado || terminou || !inicioToque.current) return;
    const duracao = performance.now() - inicioToque.current;
    inicioToque.current = null;
    setFase("soltar");
    animar(escala, 0.55, SOLTAR_MS * 0.6);
    if (duracao >= 2500) {
      setCiclos((c) => c + 1);
      setAviso("Isso. Agora solte o ar devagar pela boca, e segure de novo quando for puxar.");
    } else {
      setAviso("Foi rápido. Tente puxar o ar mais devagar, contando até quatro.");
    }
  };

  const ceuCor = `linear-gradient(180deg,
    color-mix(in srgb, #3c4e5a ${Math.round((1 - limpo) * 100)}%, #8fc3d6) 0%,
    color-mix(in srgb, #6f828d ${Math.round((1 - limpo) * 100)}%, #e7f3f5) 100%)`;

  return (
    <div
      className={`relative flex min-h-[70vh] flex-col overflow-hidden rounded-[2rem] transition-colors duration-1000 ${limpo >= 0.67 ? "text-ardosia [&_.drop-shadow]:drop-shadow-none" : "text-white"}`}
      style={{ background: ceuCor, transition: "background 2s ease" }}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx="300" cy="80" r="44" fill="#f6c560" style={{ opacity: limpo, transition: "opacity 2.5s ease" }} />
        {limpo < 1 &&
          Array.from({ length: Math.round((1 - limpo) * 14) }).map((_, i) => (
            <line key={i} x1={20 + i * 28} y1={150 + (i % 3) * 30} x2={10 + i * 28} y2={180 + (i % 3) * 30} stroke="#c9d6dc" strokeWidth="2" opacity={0.5 * (1 - limpo)} />
          ))}
        {nuvens.map((n) => {
          const visivel = ciclos > n.ordem ? 0 : 1;
          return <Nuvem key={n.ordem} x={n.x} y={n.y} s={n.s} visivel={visivel} escura={1 - limpo} />;
        })}
      </svg>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-end gap-6 px-5 pb-8 pt-40">
        <p className="min-h-[3.5rem] max-w-xs text-center text-lg font-bold drop-shadow" aria-live="polite">
          {terminou ? "O céu abriu. Repare como você está agora." : aviso}
        </p>

        {!terminou ? (
          <button
            type="button"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              pressionar();
            }}
            onPointerUp={soltar}
            onPointerCancel={soltar}
            onKeyDown={(e) => {
              if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                e.preventDefault();
                pressionar();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") soltar();
            }}
            disabled={guiado}
            className="relative grid h-44 w-44 touch-none select-none place-items-center rounded-full"
            aria-label="Segure enquanto puxa o ar e solte enquanto solta o ar. Também funciona segurando a barra de espaço."
          >
            <span
              className="absolute inset-0 rounded-full bg-white/25 backdrop-blur-sm"
              style={{ transform: `scale(${escala})` }}
            />
            <span
              className="absolute inset-0 rounded-full border-4 border-white/80"
              style={{ transform: `scale(${escala})` }}
            />
            <span className="relative font-titulo text-xl font-bold drop-shadow">
              {fase === "inspirar" ? "Puxe" : fase === "segurar" ? "Segure" : fase === "soltar" ? "Solte" : guiado ? "" : "Segure"}
            </span>
          </button>
        ) : (
          <button type="button" className="botao" onClick={aoTerminar}>
            Continuar
          </button>
        )}

        <div className="w-full max-w-xs">
          <div className="mb-1 flex justify-between text-sm font-bold drop-shadow">
            <span>Céu abrindo</span>
            <span>
              {Math.min(ciclos, CICLOS_PARA_LIMPAR)} de {CICLOS_PARA_LIMPAR} respirações
            </span>
          </div>
          <div className={`h-2 overflow-hidden rounded-full ${limpo >= 0.67 ? "bg-ardosia/15" : "bg-white/30"}`}>
            <div className={`h-full rounded-full transition-[width] duration-700 ${limpo >= 0.67 ? "bg-mare" : "bg-white"}`} style={{ width: `${limpo * 100}%` }} />
          </div>
        </div>

        {!terminou && (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setGuiado((g) => !g)}
              className="rounded-full bg-white/30 px-4 py-2 text-sm font-bold backdrop-blur-sm hover:bg-white/40"
              aria-pressed={guiado}
            >
              {guiado ? "Quero segurar eu mesmo" : "Só quero acompanhar o círculo"}
            </button>
            <button
              type="button"
              onClick={aoTerminar}
              className="rounded-full px-4 py-2 text-sm font-bold underline underline-offset-4"
            >
              Pular respiração
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
