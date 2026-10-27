"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Hud, useRecompensa } from "@/components/Jogo";
import { Mascote } from "@/components/Mascote";
import { useEstado } from "@/lib/estado";
import { hoje } from "@/lib/calculos";
import { fasesDe, missaoFeita, pontosHabito, trilhaDe, type Missao } from "@/lib/missoes";

// Deslocamento horizontal dos nós, em zigue-zague
const ONDA = [0, 1, 1.6, 1, 0, -1, -1.6, -1];

export default function Trilha() {
  const { estado, atualizar } = useEstado();
  const recompensar = useRecompensa();
  const [aberta, setAberta] = useState<Missao | null>(null);
  if (!estado) return null;

  const familiar = estado.perfil.papel === "familiar";
  const trilha = trilhaDe(estado.perfil.papel);
  const fases = fasesDe(estado.perfil.papel);
  const proxima = trilha.find((m) => !missaoFeita(estado, m));
  const parceiro = familiar ? "a pessoa que você apoia" : "o padrinho";

  const concluir = (m: Missao, comPadrinho: boolean) => {
    atualizar((e) => ({ ...e, missoes: { ...e.missoes, [m.id]: { data: hoje(), comPadrinho } } }));
    setAberta(null);
    recompensar({
      pontos: comPadrinho ? m.pontos * 2 : m.pontos,
      titulo: m.titulo,
      texto: comPadrinho ? "Feita em dupla: pontos em dobro." : undefined,
    });
  };

  let indiceGlobal = 0;

  return (
    <div className="space-y-6 pt-4">
      <Hud
        humor="feliz"
        fala={
          proxima ? (
            <>
              Próxima parada: <span className="text-mare-escura">{proxima.titulo}</span>. Toque no nó que está pulando.
            </>
          ) : (
            "Você completou a trilha inteira. Que orgulho!"
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start">
        <div className="space-y-6">
          {fases.map((f, fi) => {
            const daFase = trilha.filter((m) => m.fase === f.id);
            const feitas = daFase.filter((m) => missaoFeita(estado, m)).length;
            const bloqueada = fi > 0 && trilha.filter((m) => m.fase === fases[fi - 1].id).every((m) => !missaoFeita(estado, m)) && feitas === 0;
            return (
              <section key={f.id} aria-labelledby={`fase-${f.id}`} className="overflow-hidden rounded-[1.75rem] border-[3px] border-ardosia bg-white shadow-[0_5px_0_var(--ardosia)]">
                <header className="flex items-center justify-between gap-3 border-b-[3px] border-ardosia px-5 py-3" style={{ background: f.cor, color: f.corTexto }}>
                  <div>
                    <p className="pixel text-[0.7rem] opacity-90">FASE {fi + 1}</p>
                    <h2 id={`fase-${f.id}`} className="text-xl font-extrabold">
                      {f.titulo}
                    </h2>
                    <p className="text-sm font-bold opacity-90">{f.subtitulo}</p>
                  </div>
                  <p className="pixel shrink-0 rounded-lg border-2 border-ardosia bg-white px-2 py-1 text-xs text-ardosia">
                    {feitas}/{daFase.length}
                  </p>
                </header>

                <ol className="relative py-6">
                  {daFase.map((m, i) => {
                    const feita = missaoFeita(estado, m);
                    const atual = proxima?.id === m.id;
                    const desloc = ONDA[indiceGlobal++ % ONDA.length];
                    return (
                      <li key={m.id} className="relative flex justify-center py-2" style={{ transform: `translateX(${desloc * 3.2}rem)` }}>
                        {i > 0 && <span className="absolute -top-3 left-1/2 h-6 w-2 -translate-x-1/2 rounded-full bg-nuvem" aria-hidden="true" />}
                        <button
                          type="button"
                          onClick={() => setAberta(m)}
                          className={`group relative flex flex-col items-center ${atual ? "no-atual" : ""}`}
                          aria-label={`${m.titulo}. ${feita ? "Feita" : atual ? "Próxima missão" : "Ainda não feita"}. ${m.pontos} pontos.`}
                        >
                          {atual && (
                            <span className="pixel absolute -top-7 whitespace-nowrap rounded-md border-2 border-ardosia bg-sol px-2 py-0.5 text-[0.65rem]" aria-hidden="true">
                              COMEÇAR
                            </span>
                          )}
                          <span
                            className={`grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full border-[3px] border-ardosia text-2xl font-extrabold transition-transform group-active:translate-y-1 ${
                              feita ? "shadow-[0_5px_0_var(--ardosia)]" : atual ? "bg-white shadow-[0_5px_0_var(--ardosia)] ring-4 ring-sol" : "bg-ceu text-ardosia-suave shadow-[0_5px_0_var(--nuvem)]"
                            } ${bloqueada && !feita ? "opacity-60" : ""}`}
                            style={feita ? { background: f.cor, color: f.corTexto } : undefined}
                            aria-hidden="true"
                          >
                            {feita ? <Estrela /> : m.compartilhavel ? <Dupla /> : <span className="pixel text-lg">{indiceGlobal}</span>}
                          </span>
                          <span className="mt-2 max-w-[9rem] text-center text-sm font-bold leading-tight">{m.titulo}</span>
                          <span className="pixel text-[0.65rem] text-ardosia-suave">
                            {feita ? (feita.comPadrinho ? `+${m.pontos * 2} XP EM DUPLA` : `+${m.pontos} XP`) : m.compartilhavel ? `+${m.pontos} OU ${m.pontos * 2} XP` : `+${m.pontos} XP`}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="rounded-2xl border-[3px] border-ardosia bg-coral-claro p-4">
            <div className="flex items-center gap-2">
              <Dupla />
              <h2 className="font-extrabold">Em dupla vale o dobro</h2>
            </div>
            <p className="mt-1 text-sm">
              Missões com o ícone de duas pessoas valem o dobro quando feitas com {parceiro}.{" "}
              {familiar
                ? "O CRAFT mostra que a família tem papel ativo na mudança."
                : "Apoio humano é o que mais aumenta o efeito de programas pela internet (Sagoe e colegas, 2021)."}
            </p>
          </div>
          <div className="rounded-2xl border-[3px] border-ardosia bg-white p-4">
            <h2 className="font-extrabold">XP do dia a dia</h2>
            <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-sm">
              <dt>Check-in</dt>
              <dd className="pixel">+{pontosHabito.checkin}</dd>
              {familiar ? (
                <>
                  <dt>Cada ação de apoio</dt>
                  <dd className="pixel">+{pontosHabito.acaoFamiliar}</dd>
                </>
              ) : (
                <>
                  <dt>Atividade concluída</dt>
                  <dd className="pixel">+{pontosHabito.atividade}</dd>
                  <dt>Vontade atravessada</dt>
                  <dd className="pixel">+{pontosHabito.vontadeAtravessada}</dd>
                  <dt>Pagamento registrado</dt>
                  <dd className="pixel">+{pontosHabito.pagamento}</dd>
                  <dt>Depósito na poupança</dt>
                  <dd className="pixel">+{pontosHabito.deposito}</dd>
                </>
              )}
            </dl>
            <p className="mt-3 text-xs text-ardosia-suave">
              Valores fixos, sem sorteio nem surpresa, porque recompensa aleatória é o que prende na aposta (Chase e Clark, 2010). Um
              deslize nunca tira XP.
            </p>
          </div>
        </aside>
      </div>

      {aberta && (
        <Folha missao={aberta} feita={Boolean(missaoFeita(estado, aberta))} parceiro={parceiro} aoFechar={() => setAberta(null)} aoConcluir={concluir}
          aoDesfazer={() => {
            atualizar((e) => {
              const resto = { ...e.missoes };
              delete resto[aberta.id];
              return { ...e, missoes: resto };
            });
            setAberta(null);
          }}
          manualFeita={Boolean(estado.missoes[aberta.id])}
        />
      )}
    </div>
  );
}

function Folha({
  missao: m,
  feita,
  manualFeita,
  parceiro,
  aoFechar,
  aoConcluir,
  aoDesfazer,
}: {
  missao: Missao;
  feita: boolean;
  manualFeita: boolean;
  parceiro: string;
  aoFechar: () => void;
  aoConcluir: (m: Missao, dupla: boolean) => void;
  aoDesfazer: () => void;
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && aoFechar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [aoFechar]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ardosia/60 sm:items-center sm:p-6" onClick={aoFechar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-folha"
        className="surgir max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] border-[3px] border-b-0 border-ardosia bg-white p-5 sm:rounded-[2rem] sm:border-b-[3px] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <Mascote tamanho={64} humor={feita ? "feliz" : "normal"} animacao="parado" className="shrink-0" />
          <div className="flex-1">
            <p className="pixel text-xs text-mare-escura">{feita ? "MISSÃO FEITA" : "MISSÃO"}</p>
            <h2 id="titulo-folha" className="text-2xl font-extrabold">
              {m.titulo}
            </h2>
            <p className="mt-1">{m.descricao}</p>
          </div>
          <button type="button" onClick={aoFechar} className="rounded-lg p-2 text-2xl leading-none hover:bg-ceu" aria-label="Fechar">
            ×
          </button>
        </div>

        <ol className="mt-5 space-y-2">
          {m.passos.map((p, i) => (
            <li key={p} className="flex gap-3 rounded-xl bg-ceu p-3">
              <span className="pixel grid h-7 w-7 shrink-0 place-items-center rounded-md border-2 border-ardosia bg-sol text-xs">{i + 1}</span>
              <span>{p}</span>
            </li>
          ))}
        </ol>

        <div className="mt-4 rounded-xl border-l-[6px] border-mare bg-ceu-fundo p-3 text-sm">
          <p className="font-bold">Por que esta missão</p>
          <p className="mt-0.5">{m.porque}</p>
        </div>

        <div className="mt-6 space-y-3">
          {m.link && !feita && (
            <Link href={m.link.href} className="botao-jogo botao-jogo-azul w-full text-lg" onClick={aoFechar}>
              {m.link.rotulo}
            </Link>
          )}
          {!feita && !m.automatica && (
            <>
              {m.compartilhavel && (
                <button type="button" className="botao-jogo w-full text-lg" onClick={() => aoConcluir(m, true)}>
                  Fizemos juntos · +{m.pontos * 2} XP
                </button>
              )}
              <button
                type="button"
                className={`botao-jogo w-full text-lg ${m.compartilhavel ? "botao-jogo-azul" : ""}`}
                onClick={() => aoConcluir(m, false)}
              >
                {m.compartilhavel ? `Fiz sozinho · +${m.pontos} XP` : `Missão cumprida · +${m.pontos} XP`}
              </button>
              {m.compartilhavel && <p className="text-center text-sm text-ardosia-suave">Chame {parceiro} para fazer junto e ganhar o dobro.</p>}
            </>
          )}
          {!feita && m.automatica && <p className="text-center text-sm font-bold text-mare-escura">Esta conta sozinha quando você fizer no app.</p>}
          {feita && manualFeita && (
            <button type="button" className="w-full text-sm text-ardosia-suave underline" onClick={aoDesfazer}>
              Marquei sem querer, desfazer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Estrela() {
  return (
    <svg width="34" height="34" viewBox="0 0 12 12" className="pixelado" aria-hidden="true">
      <path d="M5 0h2v2h1v2h4v2h-1v1h-1v2h1v3H9v-1H8v-1H4v1H3v1H1V9h1V7H1V6H0V4h4V2h1z" fill="currentColor" />
    </svg>
  );
}

function Dupla() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <circle cx="8.5" cy="8" r="3" />
      <circle cx="16" cy="9" r="2.6" />
      <path d="M3 19c.6-3 2.8-4.8 5.5-4.8S13.4 16 14 19M14.5 14.2c2.6.1 4.6 1.8 5 4.8" />
    </svg>
  );
}
