"use client";

import { useState } from "react";
import { Atividade } from "@/components/Atividade";
import { Fala } from "@/components/Mascote";
import { Base, Titulo } from "@/components/ui";
import { useEstado } from "@/lib/estado";
import { atividades, atividadesLivres } from "@/lib/conteudo";
import { hoje } from "@/lib/calculos";
import { pontosHabito } from "@/lib/missoes";

// Caixa de ferramentas: atividades curtas para fazer fora da hora da vontade
export default function Ferramentas() {
  const { estado } = useEstado();
  const [aberta, setAberta] = useState<string | null>(null);
  if (!estado) return null;

  const ordem = [...estado.favoritas, ...atividadesLivres.filter((a) => !estado.favoritas.includes(a))];
  const feitasHoje = Object.values(estado.atividadesFeitas).filter((l) => l.some((d) => d.slice(0, 10) === hoje())).length;

  return (
    <div className="space-y-6 pt-2">
      <Titulo sub="Atividades curtas para treinar fora da hora da vontade. Marque com a estrela as que funcionam para você: elas passam a vir primeiro.">
        Caixa de ferramentas
      </Titulo>

      <Fala humor={feitasHoje ? "animado" : "pensativo"}>
        {feitasHoje
          ? `Você já usou ${feitasHoje} ${feitasHoje === 1 ? "ferramenta" : "ferramentas"} hoje. Treinar com calma é o que ajuda na hora difícil.`
          : `Escolhe uma, leva poucos minutos. Cada atividade concluída vale +${pontosHabito.atividade} XP.`}
      </Fala>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ordem.map((id) => {
          const a = atividades[id];
          if (!a) return null;
          const feitas = estado.atividadesFeitas[id]?.length ?? 0;
          return (
            <button
              key={id}
              type="button"
              aria-expanded={aberta === id}
              onClick={() => setAberta(aberta === id ? null : id)}
              className={`flex min-h-28 flex-col justify-between rounded-2xl border-[3px] border-ardosia p-3 text-left shadow-[0_5px_0_var(--ardosia)] transition-transform active:translate-y-1 ${
                aberta === id ? "bg-sol" : "bg-white hover:-translate-y-0.5"
              }`}
            >
              <span className="font-bold leading-tight">
                {estado.favoritas.includes(id) && <span aria-label="Favorita">★ </span>}
                {a.titulo}
              </span>
              <span className="pixel mt-2 text-[0.65rem] text-ardosia-suave">
                {a.minutos} MIN{feitas ? ` · ${feitas}X` : ""}
              </span>
            </button>
          );
        })}
      </div>

      {aberta && atividades[aberta] && (
        <div className="rounded-2xl border-[3px] border-ardosia bg-white p-1">
          <Atividade id={aberta} />
        </div>
      )}

      <Base>
        Treinar respiração, adiar e pensar nos prós e contras fora do momento de risco deixa essas ferramentas mais fáceis de usar quando a vontade
        aparece. São técnicas da terapia cognitivo-comportamental usadas em programas como o GamblingLess.
      </Base>
    </div>
  );
}
