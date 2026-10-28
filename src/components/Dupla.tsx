"use client";

import Link from "next/link";
import { useState } from "react";
import { Mascote } from "./Mascote";
import { useDupla, type SituacaoDupla } from "@/lib/dupla";
import { useEstado } from "@/lib/estado";
import type { MissaoDupla } from "@/lib/duplaDados";

export function Coracao({ tamanho = 28, cor = "#e0832f" }: { tamanho?: number; cor?: string }) {
  const g = [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."];
  return (
    <svg width={tamanho} height={tamanho} viewBox="-0.5 -0.5 8 7" className="pixelado" aria-hidden="true">
      {g.flatMap((l, y) => l.split("").map((c, x) => (c === "X" ? <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={cor} /> : null)))}
    </svg>
  );
}

export function AvatarParceiro({ nome, tamanho = 56 }: { nome: string; tamanho?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-2xl border-[3px] border-ardosia bg-coral font-titulo font-extrabold text-coral-texto shadow-[0_4px_0_var(--ardosia)]"
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.42 }}
      aria-hidden="true"
    >
      {nome.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function Chave({ ok, rotulo }: { ok: boolean; rotulo: string }) {
  return (
    <span className={`flex items-center gap-1.5 rounded-lg border-2 border-ardosia px-2 py-1 text-xs font-bold ${ok ? "bg-menta text-white" : "bg-white text-ardosia-suave"}`}>
      <span className="pixel">{ok ? "✔" : "…"}</span>
      {rotulo}
    </span>
  );
}

// Duas "chaves": a missão só abre quando as duas pessoas confirmam
function Chaves({ euFiz, outroFez, nomeOutro }: { euFiz: boolean; outroFez: boolean; nomeOutro: string }) {
  return (
    <div className="flex flex-wrap gap-2" aria-label={`Você ${euFiz ? "confirmou" : "ainda não confirmou"}. ${nomeOutro} ${outroFez ? "confirmou" : "ainda não confirmou"}.`}>
      <Chave ok={euFiz} rotulo="Você" />
      <Chave ok={outroFez} rotulo={nomeOutro} />
    </div>
  );
}

const textoSituacao: Record<SituacaoDupla, string> = {
  livre: "Ainda não combinada",
  "esperando-aceite": "Convite enviado",
  convite: "Te chamaram",
  combinada: "Combinada, bora fazer",
  "esperando-outro": "Sua parte feita",
  "falta-voce": "Falta a sua parte",
  concluida: "Feita pela dupla",
};

export function CartaoMissaoDupla({ m, indice, destaque }: { m: MissaoDupla; indice: number; destaque?: boolean }) {
  const { estado } = useEstado();
  const { situacao, linhas, parceiro, propor, aceitar, recusar, confirmar } = useDupla();
  const [enviando, setEnviando] = useState(false);
  if (!estado) return null;
  const s = situacao(m.id);
  const familiar = estado.perfil.papel === "familiar";
  const l = linhas[m.id];
  const euFiz = Boolean(l && (familiar ? l.feito_familiar : l.feito_apostador));
  const outroFez = Boolean(l && (familiar ? l.feito_apostador : l.feito_familiar));
  const minhaParte = familiar ? m.familiar : m.apostador;
  const parteOutro = familiar ? m.apostador : m.familiar;
  const nomeCurto = parceiro.split(" ")[0];
  const agir = async (fn: () => Promise<void>) => {
    setEnviando(true);
    await fn();
    setEnviando(false);
  };

  const cor = s === "concluida" ? "bg-menta text-white" : s === "convite" || s === "falta-voce" ? "bg-sol" : s === "livre" ? "bg-ceu" : "bg-coral-claro";

  return (
    <li className={`overflow-hidden rounded-[1.5rem] border-[3px] border-ardosia bg-white shadow-[0_5px_0_var(--ardosia)] ${destaque ? "ring-4 ring-sol" : ""}`}>
      <div className={`flex items-center justify-between gap-2 border-b-[3px] border-ardosia px-4 py-2 ${cor}`}>
        <p className="pixel text-[0.65rem]">MISSÃO {indice} DA DUPLA</p>
        <p className="pixel text-[0.65rem]">{textoSituacao[s].toUpperCase()}</p>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold leading-tight">{m.titulo}</h3>
            <p className="text-sm text-ardosia-suave">{m.descricao}</p>
          </div>
          <span className="pixel shrink-0 rounded-lg border-2 border-ardosia bg-sol px-2 py-1 text-[0.65rem]">+{m.pontos} XP</span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border-2 border-mare bg-ceu-fundo p-3">
            <p className="pixel text-[0.6rem] text-mare-escura">SUA PARTE</p>
            <p className="text-sm">{minhaParte}</p>
          </div>
          <div className="rounded-xl border-2 border-coral bg-coral-claro p-3">
            <p className="pixel text-[0.6rem] text-ardosia">PARTE DE {nomeCurto.toUpperCase()}</p>
            <p className="text-sm">{parteOutro}</p>
          </div>
        </div>

        {s !== "livre" && <Chaves euFiz={euFiz} outroFez={outroFez} nomeOutro={nomeCurto} />}

        <details className="text-sm">
          <summary className="cursor-pointer font-bold text-mare-escura">Por que fazer junto</summary>
          <p className="mt-1">{m.porque}</p>
        </details>

        {s === "livre" && (
          <button type="button" disabled={enviando} className="botao-jogo botao-jogo-azul w-full" onClick={() => agir(() => propor(m.id))}>
            Chamar {nomeCurto} para esta missão
          </button>
        )}
        {s === "esperando-aceite" && <p className="rounded-lg bg-ceu p-2 text-center text-sm font-bold">Esperando {nomeCurto} aceitar o convite.</p>}
        {s === "convite" && (
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button type="button" disabled={enviando} className="botao-jogo w-full" onClick={() => agir(() => aceitar(m.id))}>
              Topo fazer junto
            </button>
            <button type="button" disabled={enviando} className="rounded-xl px-3 text-sm font-bold text-ardosia-suave underline" onClick={() => agir(() => recusar(m.id))}>
              Agora não
            </button>
          </div>
        )}
        {(s === "combinada" || s === "falta-voce") && (
          <button type="button" disabled={enviando} className="botao-jogo w-full text-lg" onClick={() => agir(() => confirmar(m.id))}>
            Fizemos! Confirmar minha parte
          </button>
        )}
        {s === "esperando-outro" && <p className="rounded-lg bg-coral-claro p-2 text-center text-sm font-bold">Sua parte está confirmada. Falta {nomeCurto} confirmar.</p>}
        {s === "concluida" && <p className="rounded-lg bg-menta-claro p-2 text-center text-sm font-bold">Feita pela dupla. Pontos em dobro para os dois.</p>}
      </div>
    </li>
  );
}

// Cartão compacto para a tela Hoje
export function CartaoDuplaHoje() {
  const { estado } = useEstado();
  const { ativa, pendente, parceiro, feitas } = useDupla();
  if (!estado) return null;
  const nomeCurto = parceiro.split(" ")[0];

  const chamada = !ativa
    ? estado.perfil.papel === "familiar"
      ? "Use o código da pessoa que você apoia para fazer as missões juntos."
      : "Convide alguém de confiança. Missões em dupla valem o dobro para os dois."
    : !pendente
      ? "Vocês completaram a Trilha da dupla inteira!"
      : pendente.situacao === "convite"
        ? `${nomeCurto} te chamou para "${pendente.missao.titulo}".`
        : pendente.situacao === "falta-voce"
          ? `${nomeCurto} já fez a parte em "${pendente.missao.titulo}". Falta a sua.`
          : pendente.situacao === "combinada"
            ? `Missão combinada: "${pendente.missao.titulo}".`
            : pendente.situacao === "esperando-outro"
              ? `Você fez a sua parte em "${pendente.missao.titulo}". Falta ${nomeCurto}.`
              : pendente.situacao === "esperando-aceite"
                ? `Convite enviado para ${nomeCurto}: "${pendente.missao.titulo}".`
                : `Próxima missão: "${pendente.missao.titulo}". Chame ${nomeCurto}.`;
  const urgente = pendente && (pendente.situacao === "convite" || pendente.situacao === "falta-voce");

  return (
    <section aria-labelledby="titulo-dupla-hoje" className={`overflow-hidden rounded-[1.75rem] border-[3px] border-ardosia shadow-[0_5px_0_var(--ardosia)] ${urgente ? "bg-sol" : "bg-coral-claro"}`}>
      <div className="flex items-center gap-3 p-4">
        <div className="flex shrink-0 items-center">
          <Mascote tamanho={56} humor="feliz" animacao="parado" />
          <Coracao tamanho={22} />
          <AvatarParceiro nome={ativa ? nomeCurto : "?"} tamanho={44} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="pixel text-[0.6rem] text-ardosia-suave">TRILHA DA DUPLA · {feitas}/8</p>
          <h2 id="titulo-dupla-hoje" className="font-extrabold leading-tight">
            {chamada}
          </h2>
        </div>
      </div>
      <div className="px-4 pb-4">
        <Link href="/app/dupla" className="botao-jogo botao-jogo-azul w-full">
          {urgente ? "Responder agora" : ativa ? "Abrir a trilha da dupla" : "Montar minha dupla"}
        </Link>
      </div>
    </section>
  );
}
