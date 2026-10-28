"use client";

import { useEffect, useState } from "react";
import { useEstado } from "@/lib/estado";
import { medalhas } from "@/lib/medalhas";
import { DesenhoPixel, useRecompensa } from "./Jogo";

// Fica no app inteiro: quando a pessoa ganha uma medalha nova, comemora uma vez só.
export function VigiaMedalhas() {
  const { estado, atualizar } = useEstado();
  const recompensar = useRecompensa();
  const ganhas = estado ? medalhas.filter((m) => m.ganhou(estado)) : [];
  const idsGanhas = ganhas.map((m) => m.id).join(",");

  useEffect(() => {
    if (!estado) return;
    const vistas = estado.medalhasVistas ?? [];
    const novas = ganhas.filter((m) => !vistas.includes(m.id));
    if (novas.length === 0) return;
    atualizar((e) => ({ ...e, medalhasVistas: [...new Set([...(e.medalhasVistas ?? []), ...novas.map((m) => m.id)])] }));
    const m = novas[0];
    recompensar({
      pontos: 0,
      rotulo: novas.length > 1 ? `${novas.length} medalhas novas` : "Medalha nova",
      titulo: m.titulo,
      texto: novas.length > 1 ? `E mais ${novas.length - 1}. Veja todas na estante, na Trilha.` : "Guardei na sua estante, na Trilha. Ninguém tira ela de você.",
      desenho: m.desenho,
      humor: "emocionado",
    });
    // Só reage quando muda a lista de medalhas ganhas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsGanhas]);

  return null;
}

// Estante de medalhas da Trilha. Cada medalha bloqueada diz o que fazer para ganhar.
export function Medalhas() {
  const { estado } = useEstado();
  const [aberta, setAberta] = useState<string | null>(null);
  const ganhas = estado ? medalhas.filter((m) => m.ganhou(estado)) : [];

  if (!estado) return null;
  const detalhe = medalhas.find((m) => m.id === aberta);

  return (
    <section aria-labelledby="titulo-medalhas" className="rounded-[1.75rem] border-[3px] border-ardosia bg-white p-5 shadow-[0_5px_0_var(--ardosia)]">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="titulo-medalhas" className="text-2xl font-extrabold">
          Estante de medalhas
        </h2>
        <p className="pixel text-xs text-ardosia-suave">
          {ganhas.length}/{medalhas.length}
        </p>
      </div>
      <p className="mt-1 text-sm text-ardosia-suave">Cada medalha vem de um esforço seu. Toque numa para ver como ganhar.</p>
      <ul className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-4">
        {medalhas.map((m) => {
          const ok = ganhas.includes(m);
          return (
            <li key={m.id}>
              <button
                type="button"
                aria-pressed={aberta === m.id}
                aria-label={`${m.titulo}: ${ok ? "conquistada" : `bloqueada. ${m.como}`}`}
                onClick={() => setAberta(aberta === m.id ? null : m.id)}
                className={`relative grid aspect-square w-full place-items-center rounded-xl border-[3px] transition-transform active:translate-y-0.5 ${
                  ok ? "border-ardosia shadow-[0_3px_0_var(--ardosia)]" : "border-dashed border-ardosia-suave bg-ceu-fundo text-ardosia-suave"
                } ${aberta === m.id ? "ring-4 ring-mare" : ""}`}
                style={ok ? { background: m.cor } : undefined}
              >
                <DesenhoPixel desenho={m.desenho} tamanho={30} cor={ok ? "var(--ardosia)" : "currentColor"} />
                {!ok && (
                  <span className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full border-2 border-ardosia bg-white text-ardosia" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="3" />
                    </svg>
                  </span>
                )}
                {ok && (
                  <span className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full border-2 border-ardosia bg-sol text-ardosia" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12.5 10 17l9-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {detalhe && (
        <p className="surgir mt-4 rounded-xl bg-ceu p-3" role="status">
          <strong>{detalhe.titulo}.</strong> {ganhas.includes(detalhe) ? "Conquistada! " : "Ainda não. "}
          {detalhe.como}.
        </p>
      )}
    </section>
  );
}
