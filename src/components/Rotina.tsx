"use client";

import Link from "next/link";
import { useEstado } from "@/lib/estado";
import { hoje } from "@/lib/calculos";
import { pontosHabito } from "@/lib/missoes";
import type { PlanoRotina } from "@/lib/tipos";
import { DesenhoPixel, useRecompensa } from "./Jogo";

export const NOMES_DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
export const DIAS_CURTOS = ["D", "S", "T", "Q", "Q", "S", "S"];

const RELOGIO = ["..XXX..", ".X...X.", "X..X..X", "X..XX.X", "X.....X", ".X...X.", "..XXX.."];

// Planos do dia, em ordem de horário
export function planosDoDia(planos: PlanoRotina[], dia = new Date().getDay()) {
  return planos.filter((p) => p.dias.includes(dia)).sort((a, b) => a.hora.localeCompare(b.hora));
}

// Cartão da tela Hoje: os momentos de risco de hoje e o que a pessoa combinou fazer
export function CartaoRotinaHoje() {
  const { estado, atualizar } = useEstado();
  const recompensar = useRecompensa();
  if (!estado || estado.perfil.papel === "familiar") return null;
  const rotina = estado.rotina ?? { planos: [], feitos: {} };
  const deHoje = planosDoDia(rotina.planos);
  const feitosHoje = rotina.feitos[hoje()] ?? [];

  const marcar = (p: PlanoRotina) => {
    if (feitosHoje.includes(p.id)) return;
    atualizar((e) => {
      const r = e.rotina ?? { planos: [], feitos: {} };
      return { ...e, rotina: { ...r, feitos: { ...r.feitos, [hoje()]: [...(r.feitos[hoje()] ?? []), p.id] } } };
    });
    recompensar({
      pontos: pontosHabito.rotina,
      rotulo: "Hora de risco atravessada",
      titulo: p.atividade,
      texto: `${p.momento}: você fez o combinado no lugar da aposta. Isso é rotina nova nascendo.`,
      humor: "animado",
    });
  };

  return (
    <section aria-labelledby="titulo-rotina-hoje" className="overflow-hidden rounded-[1.75rem] border-[3px] border-ardosia bg-white shadow-[0_5px_0_var(--ardosia)]">
      <div className="flex items-center justify-between gap-3 bg-menta px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <DesenhoPixel desenho={RELOGIO} tamanho={22} cor="#fff" />
          <h2 id="titulo-rotina-hoje" className="text-xl font-extrabold">
            Minha rotina de hoje
          </h2>
        </div>
        <Link href="/app/rotina" className="rounded-lg border-2 border-white px-2 py-1 text-sm font-bold hover:bg-white/15">
          Editar
        </Link>
      </div>
      <div className="p-5">
        {rotina.planos.length === 0 ? (
          <>
            <p className="font-bold">Você sabe em que hora a vontade costuma aparecer?</p>
            <p className="mt-1 text-sm text-ardosia-suave">
              Marque esses horários e escolha o que fazer no lugar da aposta. Cada vez que cumprir, vale +{pontosHabito.rotina} XP.
            </p>
            <Link href="/app/rotina" className="botao-jogo botao-jogo-azul mt-4 w-full">
              Montar minha agenda da hora de risco
            </Link>
          </>
        ) : deHoje.length === 0 ? (
          <p>Hoje não tem horário de risco marcado. Aproveite o dia, e o botão Estou com vontade continua aqui se precisar.</p>
        ) : (
          <ul className="space-y-2">
            {deHoje.map((p) => {
              const feito = feitosHoje.includes(p.id);
              return (
                <li key={p.id} className={`grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 rounded-2xl border-[3px] p-3 sm:flex ${feito ? "border-ardosia bg-menta-claro" : "border-nuvem"}`}>
                  <span className="pixel shrink-0 rounded-lg border-2 border-ardosia bg-sol px-2 py-1 text-xs">{p.hora}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-ardosia-suave">{p.momento}</span>
                    <span className="block font-bold leading-tight">{p.atividade}</span>
                  </span>
                  {feito ? (
                    <span className="pixel col-span-2 shrink-0 text-xs sm:col-span-1">✓ FEITO</span>
                  ) : (
                    <button type="button" onClick={() => marcar(p)} className="botao-jogo col-span-2 shrink-0 px-3 py-2 text-sm sm:col-span-1">
                      Fiz +{pontosHabito.rotina}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
