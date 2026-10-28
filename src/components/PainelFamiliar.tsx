"use client";

import Link from "next/link";
import { useState } from "react";
import { Barra, Carinhas, Ouvir } from "./ui";
import { CartaoAcao, Hud, useRecompensa } from "./Jogo";
import { FraseDoDia } from "./FraseDoDia";
import { CartaoDuplaHoje } from "./Dupla";
import { acoesFamiliar, estaDesmaiado, feitaHoje, pontosHabito } from "@/lib/missoes";
import { cuidarDeSi, dinheiroFamilia, sinaisPrecoces } from "@/lib/conteudo";
import { useEstado } from "@/lib/estado";
import { hoje } from "@/lib/calculos";
import type { ResumoCompartilhado } from "@/lib/tipos";

const humores = ["", "muito mal", "mal", "mais ou menos", "bem", "muito bem"];

export function PainelFamiliar() {
  const { estado, atualizar, vinculo, aceitarConvite } = useEstado();
  const recompensar = useRecompensa();
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
    <div className="space-y-6 pt-4">
      <Hud
        humor={estaDesmaiado(estado) ? "desmaiado" : meuHoje !== undefined && meuHoje <= 2 ? "preocupado" : "feliz"}
        fala={
          estaDesmaiado(estado)
            ? "O Caramelo desmaiou de saudade! Conta como você está hoje para acordar ele."
            : meuHoje === undefined
            ? `Oi${estado.perfil.nome ? `, ${estado.perfil.nome}` : ""}! Como você está hoje? Quem apoia também precisa de cuidado.`
            : "Valeu por estar aqui. Cada pequena ação de apoio conta, e conta XP também."
        }
      />

      <FraseDoDia />

      <CartaoDuplaHoje />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className="rounded-[1.75rem] border-[3px] border-ardosia bg-white p-5 shadow-[0_5px_0_var(--ardosia)]">
          <Carinhas
            legenda="E você, como está hoje?"
            valor={meuHoje}
            aoMudar={(v) => {
              const primeiro = meuHoje === undefined;
              atualizar((s) => ({
                ...s,
                familia: { ...s.familia, meuCheckin: [...s.familia.meuCheckin.filter((c) => c.data !== hoje()), { data: hoje(), como: v }] },
              }));
              if (primeiro)
                recompensar({
                  pontos: pontosHabito.checkin + (estado.familia.meuCheckin.length === 0 ? 20 : 0),
                  acordou: estaDesmaiado(estado),
                  titulo: estaDesmaiado(estado) ? "O Caramelo acordou!" : "Check-in feito",
                  texto: "Seu humor também importa.",
                });
            }}
          />
          {meuHoje !== undefined && meuHoje <= 2 && (
            <p className="mt-3 rounded-2xl bg-ceu p-3" role="status">
              Cuidar de quem aposta pesa. O teleatendimento do SUS também atende familiares, e o CVV conversa com você pelo 188.
            </p>
          )}
        </section>

        <section aria-labelledby="titulo-acoes">
          <h2 id="titulo-acoes" className="text-2xl font-extrabold">
            Ações de apoio de hoje
          </h2>
          <p className="mt-1 text-sm text-ardosia-suave">Toque no que você fez. Cada uma vale +{pontosHabito.acaoFamiliar} XP por dia.</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {acoesFamiliar.map((a) => {
              const feito = feitaHoje(estado, a.tipo);
              return (
                <CartaoAcao
                  key={a.tipo}
                  titulo={a.titulo}
                  texto={a.texto}
                  cor={a.cor}
                  feito={feito}
                  pontos={pontosHabito.acaoFamiliar}
                  aoTocar={() => {
                    if (feito) {
                      atualizar((e) => ({ ...e, familia: { ...e.familia, acoes: e.familia.acoes.filter((x) => !(x.tipo === a.tipo && x.data === hoje())) } }));
                      return;
                    }
                    atualizar((e) => ({ ...e, familia: { ...e.familia, acoes: [...e.familia.acoes, { data: hoje(), tipo: a.tipo }] } }));
                    recompensar({ pontos: pontosHabito.acaoFamiliar, titulo: a.titulo });
                  }}
                />
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-[1.75rem] border-[3px] border-ardosia bg-white p-5">
        {temResumo && resumo ? (
          <>
            <h2 className="text-xl font-bold">Como {resumo.nome} está indo</h2>
            <p className="text-sm text-ardosia-suave">Você vê só o que {resumo.nome} escolheu compartilhar.</p>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-ceu p-3">
                <dt className="text-sm">Dias no NonBet</dt>
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
            <Link href="/app/conversa" className="botao-jogo botao-jogo-azul mt-4 w-full">
              Mandar uma mensagem de apoio
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold">Acompanhar alguém</h2>
            <p className="mt-1">
              Se a pessoa usa o NonBet, peça para ela gerar um código na aba Família. Você vê só o que ela escolher mostrar.
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

      <section className="rounded-[1.75rem] border-[3px] border-ardosia bg-coral p-5 text-coral-texto shadow-[0_5px_0_var(--ardosia)]">
        <h2 className="text-xl font-bold">Você é padrinho ou madrinha</h2>
        <p className="mt-1">
          Algumas missões da trilha valem o dobro quando são feitas com você: limpar o celular, puxar o Registrato junto, um programa
          sem aposta e o primeiro passo no SUS ou nos Jogadores Anônimos. Combine uma delas nesta semana.
        </p>
        <Link href="/app/trilha" className="botao-jogo mt-4 w-full">
          Ver minha trilha de apoio
        </Link>
        <p className="mt-2 text-sm text-coral-texto/90">Seu papel é apoiar e lembrar, não fiscalizar.</p>
      </section>

      <section aria-labelledby="titulo-sinais">
        <h2 id="titulo-sinais" className="text-2xl font-extrabold">
          Sinais para prestar atenção
        </h2>
        <p className="mt-1 text-ardosia-suave">
          A aposta online é fácil de esconder. A maioria das famílias descobre tarde. Toque no que você tem visto.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sinaisPrecoces.map((s) => (
            <CartaoAcao key={s} titulo={s} cor="var(--sol)" feito={marcados.includes(s)} rotuloFeito="Visto" aoTocar={() => alternarSinal(s)} />
          ))}
        </div>
        {marcados.length >= 3 && (
          <p className="mt-4 rounded-2xl bg-sol-claro p-4" role="status">
            Vários sinais juntos merecem uma conversa. Veja o roteiro em Conversar para começar sem briga.
          </p>
        )}
      </section>

      <section className="rounded-[1.75rem] border-[3px] border-ardosia bg-white p-5">
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

      <section className="rounded-[1.75rem] border-[3px] border-ardosia bg-white p-5">
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
