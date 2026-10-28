"use client";

import { useState } from "react";
import { Base, Ditado, Titulo, juntarTexto } from "@/components/ui";
import { Fala } from "@/components/Mascote";
import { DIAS_CURTOS, NOMES_DIAS, planosDoDia } from "@/components/Rotina";
import { useEstado } from "@/lib/estado";
import { hoje, novoId } from "@/lib/calculos";
import { pontosHabito } from "@/lib/missoes";
import type { PlanoRotina } from "@/lib/tipos";

// Momentos de risco mais comuns, com horário e dias sugeridos
const MOMENTOS: { momento: string; dias: number[]; hora: string }[] = [
  { momento: "Noite, sozinho com o celular", dias: [0, 1, 2, 3, 4, 5, 6], hora: "22:00" },
  { momento: "Fim de semana de jogo", dias: [0, 6], hora: "16:00" },
  { momento: "Rodada no meio da semana", dias: [3, 4], hora: "21:30" },
  { momento: "Hora do tédio depois do trabalho", dias: [1, 2, 3, 4, 5], hora: "18:30" },
  { momento: "Madrugada sem sono", dias: [0, 1, 2, 3, 4, 5, 6], hora: "01:00" },
];

// O que fazer no lugar: atividades que dão prazer, conexão ou descanso
const ATIVIDADES = [
  "Ligar ou mandar mensagem para alguém",
  "Caminhar 15 minutos",
  "Ver o jogo com amigos, sem apostar",
  "Banho e um episódio de série",
  "Cozinhar ou preparar algo gostoso",
  "Reunião online dos Jogadores Anônimos",
  "Deixar o celular carregando longe da cama",
  "Exercício de respiração do app",
];

export default function Rotina() {
  const { estado, atualizar } = useEstado();
  const [momento, setMomento] = useState("");
  const [dias, setDias] = useState<number[]>([]);
  const [hora, setHora] = useState("21:00");
  const [atividade, setAtividade] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  if (!estado) return null;

  const rotina = estado.rotina ?? { planos: [], feitos: {} };
  const totalFeitos = Object.values(rotina.feitos).reduce((s, l) => s + l.length, 0);
  const hojeDia = new Date().getDay();

  const salvarRotina = (planos: PlanoRotina[]) => atualizar((e) => ({ ...e, rotina: { ...(e.rotina ?? { feitos: {} }), planos } }));

  const adicionar = () => {
    if (!momento.trim() || !atividade.trim() || dias.length === 0) {
      setAviso("Preencha o momento, pelo menos um dia e o que você vai fazer.");
      return;
    }
    salvarRotina([...rotina.planos, { id: novoId(), momento: momento.trim(), dias: [...dias].sort(), hora, atividade: atividade.trim() }]);
    setMomento("");
    setDias([]);
    setAtividade("");
    setAviso("Combinado salvo. Ele aparece na sua tela Hoje nos dias marcados.");
  };

  const fala =
    rotina.planos.length === 0
      ? "Vamos descobrir juntos em que hora a vontade aparece? Quem sabe a hora, chega preparado."
      : totalFeitos > 0
        ? `Você já cumpriu ${totalFeitos} ${totalFeitos === 1 ? "vez" : "vezes"} o seu combinado. Isso é rotina nova nascendo!`
        : "Agenda montada! Quando chegar a hora, faz o combinado e me conta na tela Hoje.";

  return (
    <div className="space-y-8 pt-2">
      <Titulo sub="Marque os horários em que a vontade costuma aparecer e decida agora, com a cabeça fria, o que fazer no lugar da aposta.">
        Minha rotina
      </Titulo>

      <Fala humor={rotina.planos.length === 0 ? "pensativo" : "animado"}>{fala}</Fala>

      {/* Semana */}
      {rotina.planos.length > 0 && (
        <section aria-labelledby="titulo-semana" className="space-y-3">
          <h2 id="titulo-semana" className="text-2xl font-extrabold">
            Minha semana
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
            {NOMES_DIAS.map((nome, d) => {
              const doDia = planosDoDia(rotina.planos, d);
              return (
                <div key={nome} className={`rounded-2xl border-[3px] p-2 ${d === hojeDia ? "border-ardosia bg-sol-claro" : "border-nuvem bg-white"}`}>
                  <p className="pixel text-[0.65rem]">
                    {nome.toUpperCase()}
                    {d === hojeDia ? " · HOJE" : ""}
                  </p>
                  {doDia.length === 0 ? (
                    <p className="mt-1 text-xs text-ardosia-suave">Livre</p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {doDia.map((p) => (
                        <li key={p.id} className="text-xs leading-tight">
                          <strong>{p.hora}</strong> {p.atividade}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Lista de combinados */}
      {rotina.planos.length > 0 && (
        <section aria-labelledby="titulo-combinados" className="space-y-3">
          <h2 id="titulo-combinados" className="text-xl font-bold">
            Meus combinados
          </h2>
          <ul className="space-y-2">
            {rotina.planos.map((p) => (
              <li key={p.id} className="flex items-start gap-3 rounded-2xl border-[3px] border-ardosia bg-white p-4">
                <span className="pixel shrink-0 rounded-lg border-2 border-ardosia bg-sol px-2 py-1 text-xs">{p.hora}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ardosia-suave">
                    {p.momento} · {p.dias.length === 7 ? "todo dia" : p.dias.map((d) => NOMES_DIAS[d].slice(0, 3)).join(", ")}
                  </p>
                  <p className="font-bold">Se for {p.momento.toLowerCase()}, então: {p.atividade.toLowerCase()}.</p>
                </div>
                <button
                  type="button"
                  className="shrink-0 text-sm font-bold text-telha underline"
                  onClick={() => salvarRotina(rotina.planos.filter((x) => x.id !== p.id))}
                  aria-label={`Remover ${p.momento}`}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Novo combinado */}
      <section aria-labelledby="titulo-novo" className="space-y-5 rounded-[1.75rem] border-[3px] border-ardosia bg-white p-5 shadow-[0_5px_0_var(--ardosia)]">
        <h2 id="titulo-novo" className="text-2xl font-extrabold">
          {rotina.planos.length ? "Adicionar outro momento" : "Meu primeiro momento de risco"}
        </h2>

        <div>
          <p className="rotulo">Sugestões comuns</p>
          <div className="flex flex-wrap gap-2">
            {MOMENTOS.map((m) => (
              <button
                key={m.momento}
                type="button"
                className="rounded-full border-2 border-mare bg-ceu px-3 py-1.5 text-sm font-bold text-mare-escura"
                onClick={() => {
                  setMomento(m.momento);
                  setDias(m.dias);
                  setHora(m.hora);
                }}
              >
                {m.momento}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="rotulo" htmlFor="momento">
            Quando a vontade aparece
          </label>
          <input id="momento" className="campo" value={momento} onChange={(e) => setMomento(e.target.value)} placeholder="Ex.: depois de uma briga, no dia do pagamento" />
          <Ditado aoTexto={(t) => setMomento((m) => juntarTexto(m, t))} />
        </div>

        <fieldset>
          <legend className="rotulo">Em que dias</legend>
          <div className="flex gap-1.5">
            {DIAS_CURTOS.map((d, i) => {
              const marcado = dias.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={marcado}
                  aria-label={NOMES_DIAS[i]}
                  onClick={() => setDias(marcado ? dias.filter((x) => x !== i) : [...dias, i])}
                  className={`grid h-11 flex-1 place-items-center rounded-xl border-[3px] font-bold ${marcado ? "border-ardosia bg-sol" : "border-nuvem bg-white"}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <button type="button" className="mt-2 text-sm font-bold text-mare-escura underline" onClick={() => setDias([0, 1, 2, 3, 4, 5, 6])}>
            Todos os dias
          </button>
        </fieldset>

        <div>
          <label className="rotulo" htmlFor="hora-risco">
            Por volta de que horas
          </label>
          <input id="hora-risco" type="time" className="campo" value={hora} onChange={(e) => setHora(e.target.value)} />
        </div>

        <div>
          <label className="rotulo" htmlFor="atividade">
            O que vou fazer no lugar
          </label>
          <div className="mb-2 flex flex-wrap gap-2">
            {ATIVIDADES.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={atividade === a}
                className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold ${atividade === a ? "border-ardosia bg-sol" : "border-mare bg-ceu text-mare-escura"}`}
                onClick={() => setAtividade(a)}
              >
                {a}
              </button>
            ))}
          </div>
          <input id="atividade" className="campo" value={atividade} onChange={(e) => setAtividade(e.target.value)} placeholder="Ou escreva do seu jeito" />
          <Ditado aoTexto={(t) => setAtividade((a) => juntarTexto(a, t))} />
        </div>

        {aviso && (
          <p role="status" className="rounded-xl bg-ceu p-3 font-bold">
            {aviso}
          </p>
        )}

        <button type="button" className="botao-jogo botao-jogo-azul w-full text-lg" onClick={adicionar}>
          Salvar combinado
        </button>
      </section>

      <section className="rounded-2xl bg-menta-claro p-4">
        <p className="font-bold">
          Cada vez que você cumprir um combinado na hora de risco, marque na tela Hoje: vale +{pontosHabito.rotina} XP.
          {totalFeitos > 0 && ` Até agora: ${totalFeitos}.`}
        </p>
        {(rotina.feitos[hoje()] ?? []).length > 0 && <p className="mt-1 text-sm">Hoje você já cumpriu {(rotina.feitos[hoje()] ?? []).length}.</p>}
      </section>

      <Base>
        Não saber o que fazer com o tempo livre é uma das barreiras mais citadas por quem tenta parar (Gainsbury, 2014). Planos do tipo
        Se... então, decididos antes da hora de risco, e atividades que dão prazer no lugar da aposta reduzem recaída (Rodda e colegas,
        2018).
      </Base>
    </div>
  );
}
