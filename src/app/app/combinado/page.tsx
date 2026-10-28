"use client";

import Link from "next/link";
import { useState } from "react";
import { Base, Ditado, Titulo, juntarTexto } from "@/components/ui";
import { CartaoAcao } from "@/components/Jogo";
import { useEstado } from "@/lib/estado";

const ESPERA_HORAS = 72;

const passosPraticos = [
  "Apagar os aplicativos e sites de aposta salvos no celular",
  "Pedir para alguém de confiança colocar uma senha para instalar aplicativos",
  "Tirar o cartão de crédito do celular e da carteira digital",
  "Sair de grupos de palpites e de perfis que divulgam apostas",
  "Combinar com o banco um limite menor para Pix à noite",
];

export default function Combinado() {
  const { estado, atualizar } = useEstado();
  const [dias, setDias] = useState(90);
  const [motivo, setMotivo] = useState("");
  const [pessoa, setPessoa] = useState(estado?.trava.pessoaConfianca ?? "");
  const [passos, setPassos] = useState<string[]>([]);
  const [agora] = useState(() => Date.now());
  if (!estado) return null;
  const t = estado.trava;

  const fimCombinado = t.inicio && t.dias ? new Date(new Date(t.inicio).getTime() + t.dias * 86400000) : null;
  const liberaEm = t.pedidoSaida ? new Date(new Date(t.pedidoSaida).getTime() + ESPERA_HORAS * 3600000) : null;
  const podeDesfazer = liberaEm ? agora >= liberaEm.getTime() : false;

  if (!t.ativa) {
    return (
      <div className="space-y-6 pt-2">
        <Titulo sub="Um compromisso seu, com prazo e com alguém sabendo. Não é castigo: é decidir com a cabeça fria o que fazer na hora quente.">
          Meu combinado
        </Titulo>

        <fieldset>
          <legend className="rotulo">Por quanto tempo</legend>
          <div className="grid grid-cols-3 gap-2" role="radiogroup">
            {[30, 90, 180].map((d) => (
              <button key={d} type="button" role="radio" aria-checked={dias === d} className="opcao text-center" onClick={() => setDias(d)}>
                <strong>{d}</strong> dias
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-ardosia-suave">Prazos mais longos costumam proteger mais do que os curtos.</p>
        </fieldset>

        <div>
          <label className="rotulo" htmlFor="motivo">
            Por que estou fazendo isso
          </label>
          <textarea id="motivo" rows={3} className="campo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: para voltar a pagar o aluguel em dia e não mentir mais para minha mãe" />
          <Ditado aoTexto={(t) => setMotivo((m) => juntarTexto(m, t))} />
          <p className="mt-1 text-sm text-ardosia-suave">Essa frase aparece se você tentar desfazer o combinado e também na sua tela Hoje.</p>
        </div>

        <div>
          <label className="rotulo" htmlFor="pessoa-combinado">
            Quem vai saber do combinado
          </label>
          <input id="pessoa-combinado" className="campo" value={pessoa} onChange={(e) => setPessoa(e.target.value)} placeholder="Nome e telefone" />
        </div>

        <fieldset>
          <legend className="rotulo">O que eu vou fazer junto</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {passosPraticos.map((p, i) => (
              <CartaoAcao
                key={p}
                titulo={p}
                cor={["var(--mare)", "var(--sol)", "var(--menta)", "var(--coral)", "var(--mare-escura)"][i % 5]}
                feito={passos.includes(p)}
                rotuloFeito="Vou fazer"
                aoTocar={() => setPassos(passos.includes(p) ? passos.filter((x) => x !== p) : [...passos, p])}
              />
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          className="botao-jogo botao-jogo-azul w-full text-lg"
          onClick={() =>
            atualizar((e) => ({
              ...e,
              trava: { ativa: true, inicio: new Date().toISOString(), dias, motivo, pessoaConfianca: pessoa },
              anotacoes: { ...e.anotacoes, combinadoPassos: passos.join("\n") },
            }))
          }
        >
          Fazer o combinado de {dias} dias
        </button>
        <Base>
          Na autoexclusão, prazos longos têm menos recaída que os curtos, e acompanhamento depois do bloqueio aumenta a busca por
          tratamento (Gainsbury, 2014). Limites fáceis de desfazer não protegeram ninguém num ensaio com 4.328 pessoas (Ivanova e
          colegas, 2019). Por isso desfazer aqui leva {ESPERA_HORAS} horas.
        </Base>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      <Titulo>Meu combinado</Titulo>
      <section className="bloco">
        <p className="text-ardosia-suave">Combinado de {t.dias} dias</p>
        {fimCombinado && (
          <p className="font-titulo text-2xl font-extrabold">Vale até {fimCombinado.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}</p>
        )}
        {t.motivo && <p className="mt-3 font-titulo text-lg">“{t.motivo}”</p>}
        {t.pessoaConfianca && <p className="mt-3">Quem sabe: <strong>{t.pessoaConfianca}</strong></p>}
      </section>

      {!t.pedidoSaida ? (
        <section className="bloco">
          <h2 className="text-xl font-bold">Quero desfazer</h2>
          <p className="mt-1">
            Dá para desfazer, mas não na hora. O pedido leva {ESPERA_HORAS} horas. Se a vontade de desfazer veio agora, ela
            provavelmente passa antes disso.
          </p>
          <button
            type="button"
            className="botao-linha mt-3 w-full"
            onClick={() => atualizar((e) => ({ ...e, trava: { ...e.trava, pedidoSaida: new Date().toISOString() } }))}
          >
            Pedir para desfazer
          </button>
        </section>
      ) : (
        <section className="bloco space-y-3">
          <h2 className="text-xl font-bold">Você pediu para desfazer</h2>
          {t.motivo && (
            <p>
              Quando fez o combinado, você escreveu: <strong>“{t.motivo}”</strong>. Isso ainda vale para você?
            </p>
          )}
          {!podeDesfazer && liberaEm && (
            <p>
              O combinado pode ser desfeito a partir de{" "}
              {liberaEm.toLocaleString("pt-BR", { weekday: "long", hour: "2-digit", minute: "2-digit" })}.
            </p>
          )}
          <Link href="/app/crise" className="botao-jogo botao-jogo-azul w-full text-lg">
            Estou com vontade agora
          </Link>
          {t.pessoaConfianca && <p className="text-sm">Que tal avisar {t.pessoaConfianca} antes?</p>}
          <button
            type="button"
            className="botao-linha w-full"
            onClick={() => atualizar((e) => ({ ...e, trava: { ...e.trava, pedidoSaida: undefined } }))}
          >
            Manter o combinado
          </button>
          {podeDesfazer && (
            <button type="button" className="w-full text-sm text-ardosia-suave underline" onClick={() => atualizar((e) => ({ ...e, trava: { ativa: false, pessoaConfianca: e.trava.pessoaConfianca } }))}>
              Desfazer o combinado
            </button>
          )}
        </section>
      )}
    </div>
  );
}
