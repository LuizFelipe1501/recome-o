"use client";

import Link from "next/link";
import { useState } from "react";
import { AvatarParceiro, CartaoMissaoDupla, Coracao } from "@/components/Dupla";
import { Mascote } from "@/components/Mascote";
import { useDupla } from "@/lib/dupla";
import { missoesDupla, niveisDupla } from "@/lib/duplaDados";
import { useEstado } from "@/lib/estado";

export default function Dupla() {
  const { estado, aceitarConvite } = useEstado();
  const { ativa, demo, parceiro, feitas, pendente } = useDupla();
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  if (!estado) return null;

  const familiar = estado.perfil.papel === "familiar";
  const nomeCurto = parceiro.split(" ")[0];
  const nivel = [...niveisDupla].reverse().find((n) => feitas >= n.minimo) ?? niveisDupla[0];
  const proximo = niveisDupla.find((n) => n.minimo > feitas);

  return (
    <div className="space-y-6 pt-4">
      <section className="overflow-hidden rounded-[1.75rem] border-[3px] border-ardosia bg-coral text-coral-texto shadow-[0_6px_0_var(--ardosia)]">
        <div className="p-5 sm:p-6">
          <p className="pixel text-xs" style={{ color: "var(--coral-rotulo, var(--sol))" }}>TRILHA DA DUPLA</p>
          <h1 className="mt-1 text-[1.9rem] font-extrabold leading-[1.05] sm:text-4xl">
            {ativa ? `Você e ${nomeCurto}` : familiar ? "Apoiar junto, de verdade" : "Ninguém sai das bets sozinho"}
          </h1>
          <p className="mt-2 max-w-xl text-coral-texto/95">
            Missões feitas pelos dois. Um chama, o outro topa, e cada um confirma a sua parte. Só conta quando os dois confirmam, e aí os
            dois ganham pontos em dobro.
          </p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3 border-t-[3px] border-ardosia bg-sol px-5 pt-3 text-ardosia">
          <div className="flex items-end">
            <Mascote tamanho={72} humor="feliz" />
            <span className="mb-6">
              <Coracao tamanho={30} />
            </span>
            <span className="mb-3">
              <AvatarParceiro nome={ativa ? nomeCurto : "?"} tamanho={56} />
            </span>
          </div>
          <div className="pb-3 text-right">
            <p className="pixel text-[0.65rem]">NÍVEL DA DUPLA</p>
            <p className="font-titulo text-xl font-extrabold">{nivel.nome}</p>
            <p className="text-sm font-bold">
              {feitas} de {missoesDupla.length} missões{proximo ? ` · ${proximo.minimo - feitas === 1 ? "falta 1" : `faltam ${proximo.minimo - feitas}`} para ${proximo.nome}` : ""}
            </p>
          </div>
        </div>
      </section>

      {demo && (
        <p className="rounded-2xl border-[3px] border-dashed border-ardosia bg-white p-3 text-sm">
          Na demonstração, a outra pessoa da dupla ({nomeCurto}) é simulada e responde sozinha em poucos segundos. Com conta, cada pessoa usa o próprio celular e
          tudo atualiza ao vivo nos dois.
        </p>
      )}

      {!ativa ? (
        <section className="rounded-[1.75rem] border-[3px] border-ardosia bg-white p-5 shadow-[0_5px_0_var(--ardosia)]">
          {familiar ? (
            <>
              <h2 className="text-xl font-extrabold">Entre na dupla com o código</h2>
              <p className="mt-1">Peça para a pessoa gerar o código na aba Dupla dela e digite aqui.</p>
              <div className="mt-3 flex gap-2">
                <label htmlFor="codigo-dupla" className="sr-only">
                  Código de convite
                </label>
                <input id="codigo-dupla" className="campo uppercase tracking-widest" maxLength={6} value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código" />
                <button type="button" className="botao-jogo botao-jogo-azul shrink-0" disabled={codigo.trim().length < 6} onClick={async () => setErro(await aceitarConvite(codigo))}>
                  Entrar
                </button>
              </div>
              {erro && (
                <p role="alert" className="mt-2 font-bold text-telha">
                  {erro}
                </p>
              )}
            </>
          ) : (
            <>
              <h2 className="text-xl font-extrabold">Convide seu padrinho ou madrinha</h2>
              <p className="mt-1">Gere um código e mande para a pessoa. Quando ela entrar, a trilha da dupla abre para os dois.</p>
              <Link href="/app/familia" className="botao-jogo botao-jogo-azul mt-4 w-full">
                Gerar código de convite
              </Link>
            </>
          )}
        </section>
      ) : null}

      <section aria-labelledby="titulo-missoes-dupla">
        <div className="flex items-end justify-between gap-2">
          <h2 id="titulo-missoes-dupla" className="text-2xl font-extrabold">
            Missões da dupla
          </h2>
          {!familiar && (
            <Link href="/app/familia" className="text-sm font-bold text-mare-escura underline">
              O que eu compartilho
            </Link>
          )}
        </div>
        <ol className={`mt-4 grid gap-4 lg:grid-cols-2 ${ativa ? "" : "opacity-60"}`} inert={!ativa}>
          {missoesDupla.map((m, i) => (
            <CartaoMissaoDupla key={m.id} m={m} indice={i + 1} destaque={pendente?.missao.id === m.id && pendente.situacao !== "livre"} />
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border-[3px] border-ardosia bg-white p-5">
        <h2 className="font-extrabold">Por que em dupla</h2>
        <p className="mt-1 text-sm">
          Num programa de recuperação pela internet, ter uma pessoa que apoia e lembra levou a 77% de recuperados ou melhores em dois
          anos, contra 61% sem esse apoio (GamblingLess, 2021). No método CRAFT, a família aprende a reforçar a vida sem aposta, e cerca
          de dois terços das pessoas acabam entrando em tratamento.
        </p>
        <p className="mt-2 text-sm text-ardosia-suave">O papel de quem apoia é estar junto e lembrar, não fiscalizar.</p>
      </section>
    </div>
  );
}
