"use client";

import { Celebracao, useCelebracao } from "@/components/Pontos";
import { Barra, Base } from "@/components/ui";
import { useEstado } from "@/lib/estado";
import { hoje } from "@/lib/calculos";
import { corArea, missaoFeita, missoes, nomeArea, placar, pontosHabito } from "@/lib/missoes";

export default function Trilha() {
  const { estado, atualizar, vinculo } = useEstado();
  const { festa, celebrar } = useCelebracao();
  if (!estado) return null;

  const p = placar(estado);
  const proximaId = missoes.find((m) => !missaoFeita(estado, m))?.id;
  const padrinho = estado.trava.pessoaConfianca?.split(",")[0];

  const concluir = (id: string, comPadrinho: boolean, pontos: number) => {
    atualizar((e) => ({ ...e, missoes: { ...e.missoes, [id]: { data: hoje(), comPadrinho } } }));
    celebrar(`+${comPadrinho ? pontos * 2 : pontos} pontos`);
  };

  const pctNivel = p.proximo ? ((p.total - p.nivel.minimo) / (p.proximo.minimo - p.nivel.minimo)) * 100 : 100;

  return (
    <div className="relative space-y-8 pt-2">
      <Celebracao festa={festa} />

      <section className="relative overflow-hidden rounded-[1.75rem] bg-mare p-6 text-white">
        <svg className="pointer-events-none absolute -right-10 -top-10 h-48 w-48" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="40" fill="var(--sol)" />
        </svg>
        <svg className="pointer-events-none absolute -bottom-12 right-16 h-36 w-36" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="40" fill="var(--coral)" />
        </svg>
        <div className="relative">
          <p className="font-bold text-white/85">Sua trilha</p>
          <p className="mt-1 font-titulo text-6xl font-extrabold leading-none">{p.total}</p>
          <p className="font-bold">pontos</p>
          <p className="mt-4 inline-block rounded-full bg-lima px-3 py-1 font-bold text-ardosia">Nível: {p.nivel.nome}</p>
          {p.proximo && (
            <div className="mt-4 max-w-xs">
              <div className="h-3 overflow-hidden rounded-full bg-white/25" role="progressbar" aria-valuenow={Math.round(pctNivel)} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso até o próximo nível">
                <div className="h-full rounded-full bg-lima transition-[width] duration-700" style={{ width: `${pctNivel}%` }} />
              </div>
              <p className="mt-1 text-sm">
                Faltam {p.faltam} pontos para {p.proximo.nome}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 text-ardosia">
        <div className="rounded-2xl bg-menta-claro p-4">
          <p className="font-titulo text-3xl font-extrabold">
            {p.feitas}/{missoes.length}
          </p>
          <p className="text-sm font-bold">missões feitas</p>
        </div>
        <div className="rounded-2xl bg-coral-claro p-4">
          <p className="font-titulo text-3xl font-extrabold">{p.comPadrinho}</p>
          <p className="text-sm font-bold">com o padrinho, valendo o dobro</p>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="text-xl font-bold">Missões com o padrinho valem o dobro</h2>
        <p className="mt-1">
          {padrinho
            ? `Sua pessoa de confiança é ${padrinho}. Chame ela para as missões marcadas com dois bonecos.`
            : "Escolha alguém de confiança para te acompanhar. As missões feitas junto com essa pessoa valem o dobro de pontos."}
          {vinculo?.familiar_id ? " Ela também acompanha seus pontos pelo app." : ""}
        </p>
        <Base>
          Apoio humano é o fator que mais aumenta o efeito de programas de recuperação pela internet (Sagoe e colegas, 2021). Um
          guia que só apoia e lembra, uma vez por semana, levou a 77% de pessoas recuperadas ou melhoradas em 2 anos, contra 61% sem
          guia (GamblingLess, 2021).
        </Base>
      </section>

      <section aria-labelledby="titulo-missoes">
        <h2 id="titulo-missoes" className="text-2xl font-extrabold">
          Missões
        </h2>
        <p className="mt-1 text-ardosia-suave">Faça na ordem que quiser. Um deslize nunca tira pontos.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold">
          {(Object.keys(nomeArea) as (keyof typeof nomeArea)[]).map((a) => (
            <span key={a} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1">
              <span className="h-3 w-3 rounded-full" style={{ background: corArea[a] }} aria-hidden="true" />
              {nomeArea[a]}
            </span>
          ))}
        </div>

        <ol className="relative mt-5 space-y-4 before:absolute before:bottom-6 before:left-[1.35rem] before:top-6 before:w-1 before:rounded-full before:bg-nuvem">
          {missoes.map((m, i) => {
            const feita = missaoFeita(estado, m);
            const atual = m.id === proximaId;
            return (
              <li key={m.id} className="relative flex gap-4">
                <span
                  className={`relative z-[1] grid h-11 w-11 shrink-0 place-items-center rounded-full border-4 border-ceu-fundo font-titulo text-lg font-extrabold ${feita ? "text-ardosia" : "bg-white text-ardosia-suave"}`}
                  style={feita ? { background: corArea[m.area] } : atual ? { boxShadow: `0 0 0 3px ${corArea[m.area]}` } : undefined}
                  aria-hidden="true"
                >
                  {feita ? "✓" : i + 1}
                </span>
                <div className={`flex-1 rounded-2xl bg-white p-4 ${atual ? "ring-2 ring-mare" : ""} ${feita ? "opacity-90" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold">
                      {m.titulo}
                      <span className="sr-only">{feita ? ", feita" : atual ? ", próxima missão" : ""}</span>
                    </h3>
                    <span className="shrink-0 rounded-full px-2.5 py-0.5 text-sm font-extrabold" style={{ background: corArea[m.area], color: "var(--ardosia)" }}>
                      +{feita?.comPadrinho ? m.pontos * 2 : m.pontos}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ardosia-suave">{m.descricao}</p>
                  {m.compartilhavel && !feita && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-coral">
                      <IconeDupla /> Com o padrinho vale +{m.pontos * 2}
                    </p>
                  )}
                  {feita?.comPadrinho && <p className="mt-2 text-sm font-bold text-coral">Feita com o padrinho, pontos em dobro</p>}
                  {!feita && !m.automatica && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.compartilhavel && (
                        <button type="button" className="botao bg-coral px-4 py-2 text-sm hover:bg-coral" onClick={() => concluir(m.id, true, m.pontos)}>
                          Fizemos juntos
                        </button>
                      )}
                      <button type="button" className="botao-linha px-4 py-2 text-sm" onClick={() => concluir(m.id, false, m.pontos)}>
                        {m.compartilhavel ? "Fiz sozinho" : "Concluí"}
                      </button>
                    </div>
                  )}
                  {!feita && m.automatica && <p className="mt-2 text-sm font-bold text-mare-escura">Conta sozinha quando você fizer.</p>}
                  {feita && !m.automatica && (
                    <button
                      type="button"
                      className="mt-2 text-sm text-ardosia-suave underline"
                      onClick={() =>
                        atualizar((e) => {
                          const resto = { ...e.missoes };
                          delete resto[m.id];
                          return { ...e, missoes: resto };
                        })
                      }
                    >
                      Desmarcar
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="text-xl font-bold">Pontos do dia a dia</h2>
        <p className="mt-1 text-sm text-ardosia-suave">Valores fixos. Você sempre sabe quanto ganha e por quê.</p>
        <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2">
          <dt>Check-in do dia</dt>
          <dd className="font-bold">+{pontosHabito.checkin}</dd>
          <dt>Atividade concluída</dt>
          <dd className="font-bold">+{pontosHabito.atividade}</dd>
          <dt>Vontade atravessada no botão</dt>
          <dd className="font-bold">+{pontosHabito.vontadeAtravessada}</dd>
          <dt>Missão de pagamento registrada</dt>
          <dd className="font-bold">+{pontosHabito.pagamento}</dd>
          <dt>Depósito no desafio de poupança</dt>
          <dd className="font-bold">+{pontosHabito.deposito}</dd>
        </dl>
        <div className="mt-4">
          <Barra valor={(p.habitos / Math.max(1, p.total)) * 100} rotulo="Parte dos pontos que vem dos hábitos" cor="var(--menta)" />
          <p className="mt-1 text-sm">
            {p.habitos} pontos de hábitos e {p.deMissoes} de missões.
          </p>
        </div>
        <Base>
          Os pontos são previsíveis de propósito. Sorteio, prêmio surpresa e &quot;quase ganhou&quot; são os mesmos mecanismos que
          prendem na aposta (Chase e Clark, 2010), por isso ficaram de fora.
        </Base>
      </section>
    </div>
  );
}

function IconeDupla() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="8.5" cy="8" r="3" />
      <circle cx="16" cy="9" r="2.6" />
      <path d="M3 19c.6-3 2.8-4.8 5.5-4.8S13.4 16 14 19M14.5 14.2c2.6.1 4.6 1.8 5 4.8" />
    </svg>
  );
}
