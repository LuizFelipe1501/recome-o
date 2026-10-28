"use client";

import { useEffect, useState } from "react";
import { useEstado } from "@/lib/estado";
import { fraseDoDia } from "@/lib/frases";

export const EVENTO_ABRIR_RESUMO = "recomeco:abrir-resumo";

// Frase do dia fixa na tela Hoje, com atalho para reabrir o resumo
export function FraseDoDia() {
  const { estado, mensagens, usuarioId } = useEstado();
  const [agora, setAgora] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAgora(Date.now());
  }, []);
  if (!estado || agora === null) return null;

  const frase = fraseDoDia(estado);
  const recado = [...mensagens].reverse().find((m) => m.autor_id !== usuarioId && agora - new Date(m.criado).getTime() < 48 * 3600000);
  const fundo = recado ? "bg-coral-claro" : frase.tom === "acolher" ? "bg-ceu" : frase.tom === "celebrar" ? "bg-menta-claro" : "bg-sol-claro";

  return (
    <figure className={`rounded-2xl border-[3px] border-ardosia p-4 ${fundo}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="pixel text-[0.6rem] text-ardosia-suave">{recado ? "RECADO DE QUEM TORCE POR VOCÊ" : "FRASE DO DIA"}</p>
        <button type="button" className="text-xs font-bold text-mare-escura underline" onClick={() => window.dispatchEvent(new Event(EVENTO_ABRIR_RESUMO))}>
          Ver resumo do dia
        </button>
      </div>
      <blockquote className="mt-1 font-titulo text-lg font-bold leading-snug">“{recado ? recado.texto : frase.texto}”</blockquote>
    </figure>
  );
}
