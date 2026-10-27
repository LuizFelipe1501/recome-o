"use client";

import { useState } from "react";
import { Mensagens } from "@/components/Mensagens";
import { Base, Titulo } from "@/components/ui";
import { useEstado } from "@/lib/estado";
import { resumoParaFamilia } from "@/lib/calculos";

export default function Familia() {
  const { estado, atualizar, vinculo, criarConvite, encerrarVinculo, modo, recarregarFamilia } = useEstado();
  const [aviso, setAviso] = useState<string | null>(null);
  if (!estado) return null;

  const c = estado.familia.compartilhar;
  const alternar = (campo: keyof typeof c) =>
    atualizar((e) => ({ ...e, familia: { ...e.familia, compartilhar: { ...e.familia.compartilhar, [campo]: !e.familia.compartilhar[campo] } } }));
  const previa = resumoParaFamilia(estado);

  return (
    <div className="space-y-6 pt-2">
      <Titulo sub="Ter alguém por perto ajuda muito. Até metade das pessoas com problema com aposta conta com a ajuda de alguém próximo para sair.">
        Família e apoio
      </Titulo>

      <section className="bloco">
        <h2 className="text-xl font-bold">Convidar alguém</h2>
        {vinculo ? (
          <>
            {vinculo.familiar_id ? (
              <p className="mt-1">Uma pessoa está conectada com você. Ela vê só o que você escolheu abaixo.</p>
            ) : (
              <>
                <p className="mt-1">Passe este código para a pessoa. Ela cria a conta como &quot;ajudar alguém&quot; e digita o código.</p>
                <p className="mt-3 rounded-2xl bg-ceu py-4 text-center font-titulo text-4xl font-extrabold tracking-[0.3em]">{vinculo.codigo}</p>
                <button type="button" className="mt-2 text-sm font-bold text-mare-escura underline" onClick={recarregarFamilia}>
                  Já passei, conferir se conectou
                </button>
              </>
            )}
            <button type="button" className="botao-linha mt-4 w-full" onClick={encerrarVinculo}>
              Encerrar a conexão
            </button>
          </>
        ) : (
          <>
            <p className="mt-1">
              Gere um código para alguém de confiança acompanhar seu progresso e te mandar mensagens de apoio. Você decide o que
              aparece para ela.
            </p>
            <button
              type="button"
              className="botao mt-3 w-full"
              onClick={async () => {
                const erro = await criarConvite();
                setAviso(erro);
              }}
            >
              Gerar código de convite
            </button>
            {aviso && (
              <p className="mt-2 text-sm font-bold" role="status">
                {aviso}
              </p>
            )}
            {modo === "demo" && (
              <p className="mt-2 text-sm text-ardosia-suave">No modo demonstração, a conexão entre duas pessoas não funciona de verdade.</p>
            )}
          </>
        )}
      </section>

      <section className="bloco">
        <h2 className="text-xl font-bold">O que a outra pessoa pode ver</h2>
        <p className="mt-1 text-sm text-ardosia-suave">Ela nunca vê suas anotações, seus check-ins detalhados nem valores das dívidas.</p>
        <div className="mt-3 space-y-2">
          {(
            [
              ["progresso", "Meus dias e a fase da jornada"],
              ["humor", "Meu humor mais recente"],
              ["dividas", "Quanto das dívidas já quitei, em %"],
            ] as const
          ).map(([campo, rotulo]) => (
            <button key={campo} type="button" role="switch" aria-checked={c[campo]} className="opcao flex items-center justify-between gap-3" onClick={() => alternar(campo)}>
              {rotulo}
              <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${c[campo] ? "bg-mare" : "bg-nuvem"}`} aria-hidden="true">
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${c[campo] ? "left-6" : "left-1"}`} />
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-ceu p-4 text-sm">
          <p className="font-bold">Prévia do que aparece</p>
          <p>Dias no Recomeço: {previa.diasNoRecomeco}</p>
          {previa.faseAtual && <p>Fase: {previa.faseAtual}</p>}
          {previa.diasSemApostarNoMes !== undefined && <p>Dias sem apostar no mês: {previa.diasSemApostarNoMes}</p>}
          {previa.humorRecente !== undefined && <p>Humor recente registrado</p>}
          {previa.dividasQuitadasPct !== undefined && <p>Dívidas quitadas: {previa.dividasQuitadasPct}%</p>}
        </div>
      </section>

      {vinculo?.familiar_id && <Mensagens titulo="Mensagens" vazio="Ainda não há mensagens. Você também pode escrever primeiro." />}

      <section className="bloco">
        <h2 className="text-xl font-bold">Se alguém já emprestou dinheiro</h2>
        <p className="mt-1">
          Dívida com família costuma pesar mais na relação do que no bolso. Coloque essa dívida no seu plano, no painel Desenrola, e
          combine um valor pequeno por mês. Pagar, mesmo pouco, ajuda a reconstruir a confiança.
        </p>
        <Base>
          Ter alguém próximo melhora as chances de sucesso e a permanência no tratamento (Nilsson e colegas, 2016). Os familiares
          também precisam de apoio próprio: na Suécia, só 1 em cada 10 buscou ajuda (Svensson e colegas, 2013).
        </Base>
      </section>
    </div>
  );
}
