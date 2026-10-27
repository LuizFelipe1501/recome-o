"use client";

import Link from "next/link";
import { useState } from "react";
import { Barra, Carinhas, Ouvir } from "./ui";
import { cuidarDeSi, dinheiroFamilia, sinaisPrecoces } from "@/lib/conteudo";
import { useEstado } from "@/lib/estado";
import { hoje } from "@/lib/calculos";
import type { ResumoCompartilhado } from "@/lib/tipos";

const humores = ["", "muito mal", "mal", "mais ou menos", "bem", "muito bem"];

export function PainelFamiliar() {
  const { estado, atualizar, vinculo, aceitarConvite } = useEstado();
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  if (!estado) return null;

  const resumo = vinculo?.resumo as ResumoCompartilhado | undefined;
  const temResumo = Boolean(resumo && "nome" in resumo);
  const marcados = estado.familia.sinais;
  const meuHoje = estado.familia.meuCheckin.find((c) => c.data === hoje())?.como;

  const alternarSinal = (s: string) =>
    atualizar((e) => ({
      ...e,
      familia: { ...e.familia, sinais: marcados.includes(s) ? marcados.filter((x) => x !== s) : [...marcados, s] },
    }));

  return (
    <div className="space-y-8 pt-2">
      <section>
        <p className="text-ardosia-suave">Espaço de quem apoia</p>
        <h1 className="text-3xl font-extrabold">Oi{estado.perfil.nome ? `, ${estado.perfil.nome}` : ""}.</h1>
      </section>

      <section className="bloco">
        {temResumo && resumo ? (
          <>
            <h2 className="text-xl font-bold">Como {resumo.nome} está indo</h2>
            <p className="text-sm text-ardosia-suave">Você vê só o que {resumo.nome} escolheu compartilhar.</p>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-ceu p-3">
                <dt className="text-sm">Dias no Recomeço</dt>
                <dd className="font-titulo text-3xl font-extrabold">{resumo.diasNoRecomeco}</dd>
              </div>
              {resumo.diasSemApostarNoMes !== undefined && (
                <div className="rounded-2xl bg-ceu p-3">
                  <dt className="text-sm">Dias sem apostar no mês</dt>
                  <dd className="font-titulo text-3xl font-extrabold">{resumo.diasSemApostarNoMes}</dd>
                </div>
              )}
            </dl>
            {resumo.pontos !== undefined && (
              <div className="mt-3 rounded-2xl bg-mare p-4 text-white">
                <p className="font-titulo text-3xl font-extrabold">{resumo.pontos} pontos</p>
                {resumo.nivel && <p className="mt-1 inline-block rounded-full bg-lima px-3 py-0.5 text-sm font-bold text-ardosia">{resumo.nivel}</p>}
                {resumo.ultimaMissao && <p className="mt-2 text-sm">Última missão: {resumo.ultimaMissao}</p>}
              </div>
            )}
            {resumo.humorRecente && <p className="mt-1">Último humor registrado: {humores[resumo.humorRecente]}.</p>}
            {resumo.dividasQuitadasPct !== undefined && (
              <div className="mt-3">
                <p className="mb-1">Dívidas quitadas: {resumo.dividasQuitadasPct}%</p>
                <Barra valor={resumo.dividasQuitadasPct} rotulo="Percentual das dívidas quitadas" />
              </div>
            )}
            <p className="mt-4 text-sm text-ardosia-suave">
              Os números servem para você saber como apoiar, não para cobrar. Um dia ruim não é motivo para briga.
            </p>
            <Link href="/app/conversa" className="botao mt-4 w-full">
              Mandar uma mensagem de apoio
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold">Acompanhar alguém</h2>
            <p className="mt-1">
              Se a pessoa usa o Recomeço, peça para ela gerar um código na aba Família. Você vê só o que ela escolher mostrar.
            </p>
            <div className="mt-3 flex gap-2">
              <label htmlFor="codigo-familia" className="sr-only">
                Código de convite
              </label>
              <input id="codigo-familia" className="campo uppercase tracking-widest" maxLength={6} value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código" />
              <button
                type="button"
                className="botao"
                disabled={codigo.trim().length < 6}
                onClick={async () => setErro(await aceitarConvite(codigo))}
              >
                Usar
              </button>
            </div>
            {erro && (
              <p role="alert" className="mt-2 font-bold text-telha">
                {erro}
              </p>
            )}
          </>
        )}
      </section>

      <section className="rounded-[1.75rem] bg-coral p-5 text-white">
        <h2 className="text-xl font-bold">Você é padrinho ou madrinha</h2>
        <p className="mt-1">
          Algumas missões da trilha valem o dobro quando são feitas com você: limpar o celular, puxar o Registrato junto, um programa
          sem aposta e o primeiro passo no SUS ou nos Jogadores Anônimos. Combine uma delas nesta semana.
        </p>
        <p className="mt-2 text-sm text-white/90">Seu papel é apoiar e lembrar, não fiscalizar.</p>
      </section>

      <section className="bloco">
        <Carinhas
          legenda="E você, como está hoje?"
          valor={meuHoje}
          aoMudar={(v) =>
            atualizar((s) => ({
              ...s,
              familia: { ...s.familia, meuCheckin: [...s.familia.meuCheckin.filter((c) => c.data !== hoje()), { data: hoje(), como: v }] },
            }))
          }
        />
        {meuHoje !== undefined && meuHoje <= 2 && (
          <p className="mt-3 rounded-2xl bg-ceu p-3" role="status">
            Cuidar de quem aposta pesa. O teleatendimento do SUS também atende familiares, e o CVV conversa com você pelo 188.
          </p>
        )}
      </section>

      <section aria-labelledby="titulo-sinais">
        <h2 id="titulo-sinais" className="text-2xl font-extrabold">
          Sinais para prestar atenção
        </h2>
        <p className="mt-1 text-ardosia-suave">
          A aposta online é fácil de esconder. A maioria das famílias descobre tarde. Marque o que você tem visto.
        </p>
        <div className="mt-4 space-y-2">
          {sinaisPrecoces.map((s) => (
            <button key={s} type="button" role="checkbox" aria-checked={marcados.includes(s)} className="opcao flex items-center gap-3" onClick={() => alternarSinal(s)}>
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 ${marcados.includes(s) ? "border-mare bg-mare text-white" : "border-nuvem"}`} aria-hidden="true">
                {marcados.includes(s) ? "✓" : ""}
              </span>
              {s}
            </button>
          ))}
        </div>
        {marcados.length >= 3 && (
          <p className="mt-4 rounded-2xl bg-sol-claro p-4" role="status">
            Vários sinais juntos merecem uma conversa. Veja o roteiro em Conversar para começar sem briga.
          </p>
        )}
      </section>

      <section className="bloco">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold">Dinheiro: como ajudar sem alimentar a aposta</h2>
          <Ouvir texto={dinheiroFamilia.join(". ")} />
        </div>
        <ul className="mt-3 space-y-2">
          {dinheiroFamilia.map((d) => (
            <li key={d} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sol" />
              {d}
            </li>
          ))}
        </ul>
      </section>

      <section className="bloco">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold">Cuidar de você também</h2>
          <Ouvir texto={cuidarDeSi.join(". ")} />
        </div>
        <ul className="mt-3 space-y-2">
          {cuidarDeSi.map((d) => (
            <li key={d} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-mare" />
              {d}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border-2 border-telha bg-white p-5">
        <h2 className="text-xl font-bold text-telha">Se há violência ou ameaça</h2>
        <p className="mt-2">
          Brigas por dinheiro podem virar agressão, e dívida com agiota pode trazer ameaça. Sua segurança vem antes de qualquer
          conversa.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="tel:190" className="botao bg-telha hover:bg-telha">
            Polícia, 190
          </a>
          <a href="tel:180" className="botao-linha border-telha text-telha">
            Ligue 180
          </a>
        </div>
      </section>
    </div>
  );
}
