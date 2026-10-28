"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Mascote, type Humor } from "./Mascote";
import { useEstado } from "@/lib/estado";
import { diasNaSemana, dinheiroPoupado, placar } from "@/lib/missoes";
import { melhorSequencia, reacoesCarinho, sequencia } from "@/lib/falas";
import { reais } from "@/lib/calculos";

// ------------------------------------------------------------ recompensa

type Premio = { pontos: number; titulo: string; texto?: string; acordou?: boolean; rotulo?: string; humor?: Humor; desenho?: string[]; id: number };

const Ctx = createContext<{ recompensar: (p: Omit<Premio, "id">) => void }>({ recompensar: () => {} });

export function useRecompensa() {
  return useContext(Ctx).recompensar;
}

export function ProvedorRecompensa({ children }: { children: ReactNode }) {
  const { estado } = useEstado();
  const [premio, setPremio] = useState<Premio | null>(null);
  const [subiu, setSubiu] = useState<string | null>(null);
  const nivelAntes = useRef<number | null>(null);

  const fila = useRef<Premio[]>([]);
  const naTela = useRef(false);
  const recompensar = useCallback(
    (p: Omit<Premio, "id">) => {
      const novo = { ...p, id: Date.now() + Math.random() };
      // Se já tem um prêmio na tela, o novo espera a vez
      if (naTela.current) {
        fila.current.push(novo);
        return;
      }
      naTela.current = true;
      if (estado) nivelAntes.current = placar(estado).numeroNivel;
      setSubiu(null);
      setPremio(novo);
    },
    [estado],
  );

  useEffect(() => {
    if (!premio || !estado || nivelAntes.current === null) return;
    const p = placar(estado);
    if (p.numeroNivel > nivelAntes.current) setSubiu(p.nivel.nome);
    nivelAntes.current = null;
  }, [estado, premio]);

  const fechar = () => {
    const proximo = fila.current.shift() ?? null;
    naTela.current = Boolean(proximo);
    setSubiu(null);
    setPremio(proximo);
  };

  return (
    <Ctx.Provider value={{ recompensar }}>
      {children}
      {premio && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-ardosia/70 p-5" role="dialog" aria-modal="true" aria-labelledby="titulo-premio" onClick={fechar}>
          <div
            key={premio.id}
            className="surgir relative w-full max-w-sm overflow-hidden rounded-[2rem] border-4 border-ardosia bg-sol p-6 text-center shadow-[0_8px_0_var(--ardosia)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Raios />
            <div className="relative">
              {premio.acordou ? (
                <CarameloAcordando />
              ) : premio.desenho ? (
                <div className="relative mx-auto h-[140px] w-[140px]">
                  <Mascote tamanho={140} humor={premio.humor ?? "emocionado"} animacao="pula" />
                  <span className="surgir absolute -right-4 bottom-2 grid h-16 w-16 place-items-center rounded-2xl border-[3px] border-ardosia bg-white shadow-[0_4px_0_var(--ardosia)]">
                    <DesenhoPixel desenho={premio.desenho} tamanho={40} />
                  </span>
                </div>
              ) : (
                <Mascote tamanho={140} humor={premio.humor ?? "feliz"} animacao="pula" className="mx-auto" />
              )}
              <p className="pixel mt-2 text-sm text-mare-escura">{subiu ? "Subiu de nível!" : premio.rotulo ?? "Conquista"}</p>
              <h2 id="titulo-premio" className="mt-1 text-2xl font-extrabold">
                {subiu ?? premio.titulo}
              </h2>
              {subiu && <p className="font-bold">{premio.titulo}</p>}
              {premio.texto && <p className="mt-1">{premio.texto}</p>}
              {premio.pontos > 0 && (
                <p className="pixel mt-4 inline-block rounded-xl border-[3px] border-ardosia bg-white px-4 py-2 text-2xl text-mare-escura">+{premio.pontos} XP</p>
              )}
              <button type="button" className="botao-jogo botao-jogo-azul mt-6 w-full text-lg" onClick={fechar} autoFocus>
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

// Caramelo acordando: deitado, chacoalha, levanta num pulo e abana o rabo
function CarameloAcordando() {
  const [fase, setFase] = useState(0);
  useEffect(() => {
    const t = [setTimeout(() => setFase(1), 600), setTimeout(() => setFase(2), 1400), setTimeout(() => setFase(3), 2150)];
    return () => t.forEach(clearTimeout);
  }, []);
  const balao = ["Zzz...", "Hã?!", "Opa!", "Voltei!"][fase];
  return (
    <div className="relative mx-auto h-[140px] w-[140px]">
      <Mascote
        key={fase}
        tamanho={140}
        humor={fase < 2 ? "desmaiado" : fase === 2 ? "normal" : "feliz"}
        animacao={fase === 0 ? "parado" : fase === 1 ? "chacoalha" : fase === 2 ? "levanta" : "pula"}
        rotulo={fase < 2 ? "Caramelo ainda desmaiado" : "Caramelo acordado"}
      />
      <span key={`b${fase}`} className="surgir pixel absolute -right-6 top-0 rounded-lg border-[3px] border-ardosia bg-white px-2 py-1 text-xs" aria-hidden="true">
        {balao}
      </span>
    </div>
  );
}

function Raios() {
  return (
    <svg className="brilho-lento pointer-events-none absolute left-1/2 top-24 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 opacity-40" viewBox="-50 -50 100 100" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d="M0 0 L-4 -50 L4 -50 Z" fill="#fff" transform={`rotate(${i * 30})`} />
      ))}
    </svg>
  );
}

// ------------------------------------------------------------ HUD

export function Hud({ fala, humor = "normal" }: { fala?: ReactNode; humor?: Humor }) {
  const { estado, atualizar } = useEstado();
  const [carinho, setCarinho] = useState<{ n: number; texto: string; humor: Humor } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  if (!estado) return null;
  const p = placar(estado);
  const seq = estado.perfil.papel === "familiar" ? 0 : sequencia(estado);
  const recorde = estado.perfil.papel === "familiar" ? 0 : melhorSequencia(estado);
  const desmaiado = humor === "desmaiado";

  const fazerCarinho = () => {
    if (desmaiado) return;
    const total = (estado.carinhos ?? 0) + 1;
    const r = reacoesCarinho[(total - 1) % reacoesCarinho.length];
    atualizar((e) => ({ ...e, carinhos: (e.carinhos ?? 0) + 1 }));
    setCarinho({ n: total, texto: r.texto, humor: r.humor });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCarinho(null), 3500);
  };
  const humorAtual = carinho?.humor ?? humor;
  const falaAtual = carinho?.texto ?? fala;
  const semana = diasNaSemana(estado);
  const familiar = estado.perfil.papel === "familiar";
  const poupado = familiar ? 0 : dinheiroPoupado(estado);

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border-[3px] border-ardosia bg-mare text-white shadow-[0_6px_0_var(--ardosia)]" aria-label="Seu progresso">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-mare-escura" aria-hidden="true" />
      <div className="relative grid grid-cols-[auto_1fr] items-end gap-3 p-4 sm:gap-5 sm:p-5">
        <button
          type="button"
          onClick={fazerCarinho}
          className="relative -mb-1 rounded-2xl"
          aria-label={desmaiado ? "Caramelo desmaiado. Faça o check-in para acordar ele." : "Fazer carinho no Caramelo"}
        >
          <Mascote key={carinho?.n ?? 0} tamanho={104} humor={humorAtual} className={`drop-shadow-[0_4px_0_rgba(0,0,0,0.25)] sm:h-32 sm:w-32 ${carinho ? "mascote-carinho" : ""}`} />
          {carinho && (
            <svg key={`c${carinho.n}`} className="coracao-subindo pixelado pointer-events-none absolute left-1/2 top-0" width="28" height="28" viewBox="0 0 7 7" aria-hidden="true">
              <DesenhoPixelRects desenho={[".......", ".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."]} cor="#e8304a" />
            </svg>
          )}
        </button>
        <div className="min-w-0 pb-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="pixel rounded-lg border-2 border-ardosia bg-sol px-2 py-0.5 text-xs text-ardosia">NÍVEL {p.numeroNivel}</span>
            <span className="truncate font-titulo text-lg font-extrabold">{p.nivel.nome}</span>
            {(seq > 0 || recorde >= 2) && (
              <span className="pixel inline-flex items-center gap-1 rounded-lg border-2 border-ardosia bg-coral-claro px-2 py-0.5 text-xs text-ardosia" title="Dias seguidos com check-in. O recorde fica guardado mesmo se a sequência parar.">
                <DesenhoPixel desenho={["...X...", "..XX...", "..XXX..", ".XXXXX.", ".XX.XX.", "XX...XX", ".XXXXX."]} tamanho={14} cor="#d55e00" />
                {seq > 0 ? `${seq} ${seq === 1 ? "DIA" : "DIAS"} SEGUIDOS` : ""}
                {seq > 0 && recorde > seq ? " · " : ""}
                {recorde > seq ? `RECORDE ${recorde}` : ""}
              </span>
            )}
          </div>
          <div
            className="mt-2 h-5 overflow-hidden rounded-lg border-[3px] border-ardosia bg-white/25"
            role="progressbar"
            aria-valuenow={Math.round(p.pctNivel)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Experiência até o próximo nível"
          >
            <div className="h-full bg-sol transition-[width] duration-700" style={{ width: `${Math.max(4, p.pctNivel)}%` }} />
          </div>
          <p className="pixel mt-1 text-[0.7rem] text-white/90">
            {p.total} XP{p.proximo ? ` · faltam ${p.faltam} para ${p.proximo.nome}` : " · nível máximo"}
          </p>
        </div>
      </div>
      {falaAtual && (
        <div className="relative mx-4 mb-4 rounded-2xl border-[3px] border-ardosia bg-white px-4 py-3 font-bold text-ardosia" aria-live="polite">
          <span className="absolute -top-[11px] left-10 h-0 w-0 border-x-[9px] border-b-[9px] border-x-transparent border-b-ardosia" aria-hidden="true" />
          <span key={carinho?.n ?? "fala"} className="surgir block">
            {falaAtual}
          </span>
        </div>
      )}
      <div className="relative grid grid-cols-3 border-t-[3px] border-ardosia bg-white text-ardosia">
        <Stat valor={`${semana}/5`} rotulo="dias na semana">
          <Anel valor={Math.min(1, semana / 5)} />
        </Stat>
        <Stat valor={`${p.feitas}/${p.totalMissoes}`} rotulo="missões" />
        {familiar ? <Stat valor={String(p.comPadrinho)} rotulo="feitas em dupla" /> : <Stat valor={reais(poupado)} rotulo="longe da aposta" />}
      </div>
    </section>
  );
}

function Stat({ valor, rotulo, children }: { valor: string; rotulo: string; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 border-r-[3px] border-ardosia px-2 py-2.5 last:border-r-0">
      {children}
      <div className="min-w-0 text-center">
        <p className="truncate font-titulo text-lg font-extrabold leading-tight">{valor}</p>
        <p className="text-[0.7rem] font-bold leading-tight text-ardosia-suave">{rotulo}</p>
      </div>
    </div>
  );
}

export function Anel({ valor, tamanho = 30 }: { valor: number; tamanho?: number }) {
  const r = 12;
  const c = 2 * Math.PI * r;
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 30 30" aria-hidden="true" className="shrink-0 -rotate-90">
      <circle cx="15" cy="15" r={r} fill="none" stroke="var(--ceu)" strokeWidth="5" />
      <circle cx="15" cy="15" r={r} fill="none" stroke="var(--menta)" strokeWidth="5" strokeDasharray={c} strokeDashoffset={c * (1 - valor)} strokeLinecap="round" />
    </svg>
  );
}

// ------------------------------------------------------------ cartão de ação (substitui caixinhas)

export function CartaoAcao({
  titulo,
  texto,
  cor,
  feito,
  pontos,
  aoTocar,
  rotuloFeito = "Feito hoje",
}: {
  titulo: string;
  texto?: string;
  cor: string;
  feito: boolean;
  pontos?: number;
  aoTocar: () => void;
  rotuloFeito?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={feito}
      onClick={aoTocar}
      className={`group relative flex min-h-28 flex-col justify-between overflow-hidden rounded-2xl border-[3px] border-ardosia p-3 text-left transition-transform active:translate-y-1 ${
        feito ? "shadow-[0_2px_0_var(--ardosia)] translate-y-[3px]" : "bg-white shadow-[0_5px_0_var(--ardosia)] hover:-translate-y-0.5"
      }`}
      style={feito ? { background: "var(--sol)" } : undefined}
    >
      <span className="absolute right-0 top-0 h-full w-2" style={{ background: cor }} aria-hidden="true" />
      <span className="pr-3 font-bold leading-tight">{titulo}</span>
      {texto && <span className="mt-1 pr-3 text-xs leading-snug opacity-80">{texto}</span>}
      <span className="pixel mt-2 text-[0.7rem]">{feito ? `✔ ${rotuloFeito}` : pontos ? `+${pontos} XP` : "Tocar"}</span>
    </button>
  );
}

export function LinkJogo({ href, children, azul }: { href: string; children: ReactNode; azul?: boolean }) {
  return (
    <Link href={href} className={`botao-jogo w-full ${azul ? "botao-jogo-azul" : ""}`}>
      {children}
    </Link>
  );
}

// ------------------------------------------------------------ desenhos em pixel 7x7

function DesenhoPixelRects({ desenho, cor = "currentColor" }: { desenho: string[]; cor?: string }) {
  return (
    <>
      {desenho.flatMap((linha, y) =>
        linha.split("").map((c, x) => (c === "X" ? <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={cor} /> : null)),
      )}
    </>
  );
}

export function DesenhoPixel({ desenho, tamanho = 26, cor = "currentColor", className = "" }: { desenho: string[]; tamanho?: number; cor?: string; className?: string }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 7 7" className={`pixelado ${className}`} aria-hidden="true">
      <DesenhoPixelRects desenho={desenho} cor={cor} />
    </svg>
  );
}
