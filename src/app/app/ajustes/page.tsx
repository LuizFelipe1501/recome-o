"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Titulo } from "@/components/ui";
import { useEstado } from "@/lib/estado";
import type { Estado } from "@/lib/tipos";

export default function Ajustes() {
  const { estado, atualizar, sair, apagarTudo, modo, email } = useEstado();
  const router = useRouter();
  const [confirmar, setConfirmar] = useState(false);
  if (!estado) return null;
  const p = estado.prefs;

  const setPref = <K extends keyof Estado["prefs"]>(k: K, v: Estado["prefs"][K]) =>
    atualizar((e) => ({ ...e, prefs: { ...e.prefs, [k]: v } }));


  return (
    <div className="space-y-8 pt-2">
      <Titulo>Ajustes</Titulo>

      <section className="space-y-2" aria-labelledby="titulo-acess">
        <h2 id="titulo-acess" className="text-xl font-bold">
          Acessibilidade
        </h2>
        <Interruptor
          ativo={p.fonte === "grande"}
          rotulo="Letra maior"
          descricao="Aumenta todo o texto do app"
          aoMudar={() => setPref("fonte", p.fonte === "grande" ? "normal" : "grande")}
        />
        <Interruptor
          ativo={p.contraste === "alto"}
          rotulo="Contraste alto"
          descricao="Cores mais fortes para ler melhor"
          aoMudar={() => setPref("contraste", p.contraste === "alto" ? "normal" : "alto")}
        />
        <Interruptor
          ativo={p.movimento === "reduzido"}
          rotulo="Menos movimento"
          descricao="Tira as animações"
          aoMudar={() => setPref("movimento", p.movimento === "reduzido" ? "normal" : "reduzido")}
        />
        <p className="pt-2 text-sm text-ardosia-suave">
          A fonte do app foi feita para pessoas com baixa visão. Os textos principais têm o botão Ouvir, que lê em voz alta com a
          voz do celular.
        </p>
      </section>

      <section className="bloco space-y-3">
        <h2 className="text-xl font-bold">Sua conta</h2>
        {modo === "demo" ? (
          <p>Você está no modo demonstração. Os dados ficam só neste aparelho.</p>
        ) : (
          <p>Conectado como {email}.</p>
        )}
        <div>
          <label className="rotulo" htmlFor="horario-ajuste">
            Horário do check-in
          </label>
          <input
            id="horario-ajuste"
            type="time"
            className="campo"
            value={estado.perfil.horarioCheckin}
            onChange={(e) => atualizar((s) => ({ ...s, perfil: { ...s.perfil, horarioCheckin: e.target.value } }))}
          />
        </div>
        <button
          type="button"
          className="botao-linha w-full"
          onClick={async () => {
            await sair();
            router.replace("/");
          }}
        >
          Sair
        </button>
      </section>

      <section className="bloco space-y-3">
        <h2 className="text-xl font-bold">Seus dados</h2>
        <p>
          Seus registros ficam {modo === "demo" ? "neste aparelho" : "na sua conta"} e ninguém além de você vê. Na família, a outra
          pessoa vê só o que você escolher. O app não usa dados de banco.
        </p>
        {!confirmar ? (
          <button type="button" className="text-sm font-bold text-telha underline" onClick={() => setConfirmar(true)}>
            Apagar todos os meus dados
          </button>
        ) : (
          <div className="rounded-2xl border-2 border-telha p-4">
            <p className="font-bold">Isso apaga check-ins, dívidas, anotações e conexões com a família. Não dá para desfazer.</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="botao bg-telha hover:bg-telha"
                onClick={async () => {
                  await apagarTudo();
                  router.replace("/");
                }}
              >
                Apagar tudo
              </button>
              <button type="button" className="botao-linha" onClick={() => setConfirmar(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="text-sm text-ardosia-suave">
        <h2 className="text-base font-bold text-ardosia">Sobre</h2>
        <p className="mt-1">
          Protótipo do Recomeço para o hackathon Rolê que Rende, BB Digital Week 2026. O conteúdo se baseia em terapia
          cognitivo-comportamental e entrevista motivacional, as abordagens com mais evidência para o jogo problemático, e em
          estudos como GamblingLess, Help on Demand, e-Estesia e LENAD III. Não substitui atendimento profissional.
        </p>
      </section>
    </div>
  );
}

function Interruptor({ ativo, rotulo, aoMudar, descricao }: { ativo: boolean; rotulo: string; descricao: string; aoMudar: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={ativo} className="opcao flex items-center justify-between gap-3" onClick={aoMudar}>
      <span>
        <strong>{rotulo}</strong>
        <span className="block text-sm text-ardosia-suave">{descricao}</span>
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${ativo ? "bg-mare" : "bg-nuvem"}`} aria-hidden="true">
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${ativo ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}
