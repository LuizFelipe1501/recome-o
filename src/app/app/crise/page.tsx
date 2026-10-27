"use client";

import Link from "next/link";
import { useState } from "react";
import { Atividade } from "@/components/Atividade";
import { Ceu } from "@/components/Ceu";
import { Mascote } from "@/components/Mascote";
import { pontosHabito } from "@/lib/missoes";
import { atividades, gatilhos } from "@/lib/conteudo";
import { useEstado } from "@/lib/estado";
import type { Crise } from "@/lib/tipos";

type Etapa = "respirar" | "gatilho" | "atividade" | "fim";

export default function PaginaCrise() {
  const { atualizar } = useEstado();
  const [etapa, setEtapa] = useState<Etapa>("respirar");
  const [gatilho, setGatilho] = useState<string | null>(null);
  const [atividade, setAtividade] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Crise["resultado"]>();

  const g = gatilhos.find((x) => x.id === gatilho);

  const registrar = (r: Crise["resultado"]) => {
    setResultado(r);
    atualizar((e) => ({
      ...e,
      crises: [...e.crises, { data: new Date().toISOString(), gatilho: gatilho ?? "nao-informado", resultado: r }],
    }));
    setEtapa("fim");
  };

  return (
    <div className="space-y-5 pt-1">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm">
        <span>Corre perigo ou pensa em se machucar?</span>
        <a href="tel:188" className="shrink-0 rounded-full bg-telha px-4 py-2 font-bold text-white">
          Ligar 188
        </a>
      </div>

      {etapa === "respirar" && (
        <>
          <h1 className="sr-only">Respirar até o céu abrir</h1>
          <Ceu aoTerminar={() => setEtapa("gatilho")} />
        </>
      )}

      {etapa === "gatilho" && (
        <section className="space-y-4">
          <h1 className="text-3xl font-extrabold">O que está pesando agora?</h1>
          <p className="text-ardosia-suave">Escolha o mais perto do que você sente. Não precisa ser exato.</p>
          <div className="space-y-2" role="radiogroup">
            {gatilhos.map((x) => (
              <button
                key={x.id}
                type="button"
                role="radio"
                aria-checked={gatilho === x.id}
                className="opcao"
                onClick={() => {
                  setGatilho(x.id);
                  setAtividade(x.atividades[0]);
                  setEtapa("atividade");
                }}
              >
                <strong>{x.titulo}</strong>
                <span className="block text-sm text-ardosia-suave">{x.descricao}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {etapa === "atividade" && g && atividade && (
        <section className="space-y-4">
          <h1 className="text-2xl font-extrabold">{g.titulo}</h1>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Outras opções">
            {g.atividades.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={atividade === id}
                onClick={() => setAtividade(id)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${atividade === id ? "bg-ardosia text-white" : "bg-white text-ardosia-suave"}`}
              >
                {atividades[id].titulo}
              </button>
            ))}
          </div>
          <Atividade key={atividade} id={atividade} />
          <div className="bloco">
            <h2 className="text-xl font-bold">E agora, como está a vontade?</h2>
            <div className="mt-3 grid gap-2">
              <button type="button" className="opcao" onClick={() => registrar("passou")}>
                Passou
              </button>
              <button type="button" className="opcao" onClick={() => registrar("diminuiu")}>
                Diminuiu, mas ainda está aqui
              </button>
              <button type="button" className="opcao" onClick={() => registrar("apostei")}>
                Acabei apostando
              </button>
            </div>
          </div>
        </section>
      )}

      {etapa === "fim" && (
        <section className="space-y-4 rounded-[1.75rem] border-[3px] border-ardosia bg-white p-5 shadow-[0_5px_0_var(--ardosia)]">
          <div className="flex items-end gap-3 rounded-2xl bg-sol p-3">
            <Mascote tamanho={88} humor={resultado === "apostei" ? "preocupado" : "feliz"} animacao="idle" />
            <p className="pb-2 font-bold">
              {resultado === "apostei" ? "Tô aqui do seu lado. Amanhã a gente segue, seu XP continua inteiro." : "Eu sabia que você conseguia. Fico orgulhoso!"}
              {resultado !== "apostei" && <span className="pixel mt-1 block text-xs text-mare-escura">+{pontosHabito.vontadeAtravessada} XP</span>}
            </p>
          </div>
          {resultado === "passou" && (
            <>
              <h1 className="text-3xl font-extrabold">Você atravessou.</h1>
              <p>
                Isso conta muito. Cada vez que a vontade passa sem aposta, ela tende a voltar mais fraca. Ficou registrado na sua
                jornada.
              </p>
            </>
          )}
          {resultado === "diminuiu" && (
            <>
              <h1 className="text-3xl font-extrabold">Diminuir já é atravessar.</h1>
              <p>A onda ainda está aqui, mas mais baixa. Se quiser, faça mais uma atividade ou fale com alguém agora.</p>
              <button type="button" className="botao-linha w-full" onClick={() => setEtapa("atividade")}>
                Fazer mais uma atividade
              </button>
            </>
          )}
          {resultado === "apostei" && (
            <>
              <h1 className="text-3xl font-extrabold">Um deslize não apaga o caminho.</h1>
              <p>
                Quase toda recuperação tem idas e vindas. A sua jornada não volta para o começo. O mais importante agora é não
                tentar recuperar o que perdeu com outra aposta.
              </p>
              <p>Amanhã, no check-in, registre com honestidade. Isso ajuda a entender o que puxou a aposta.</p>
              <Link href="/app/apoio" className="botao-linha w-full">
                Ver onde buscar apoio
              </Link>
            </>
          )}
          <Link href="/app" className="botao-jogo botao-jogo-azul w-full">
            Voltar para o início
          </Link>
        </section>
      )}
    </div>
  );
}
