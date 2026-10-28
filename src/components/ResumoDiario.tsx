"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Anel } from "./Jogo";
import { Mascote } from "./Mascote";
import { useEstado } from "@/lib/estado";
import { diasNaSemana, dinheiroPoupado, estaDesmaiado, placar, proximaMissao } from "@/lib/missoes";
import { diasEntre, hoje, reais } from "@/lib/calculos";
import { atualizarSelo, ativarLembretes, ehIOSsemInstalar, lembretesSuportados, mostrarLembrete, permissaoAtual, registrarSW } from "@/lib/lembretes";
import { textoLembrete } from "@/lib/textoLembrete";
import { fraseDoDia } from "@/lib/frases";
import type { Estado } from "@/lib/tipos";

const CHAVE = "recomeco-resumo-visto";

function media(v: number[]) {
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

// Tendência da vontade: últimos 7 check-ins contra os 7 anteriores
function tendencia(e: Estado) {
  const ord = [...e.checkins].sort((a, b) => a.data.localeCompare(b.data));
  const recente = media(ord.slice(-7).map((c) => c.vontade));
  const antes = media(ord.slice(-14, -7).map((c) => c.vontade));
  if (recente === null || antes === null) return null;
  return { recente, antes, caiu: recente < antes };
}

export function ResumoDiario() {
  const { estado, usuarioId, mensagens } = useEstado();
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);
  const [lembrete, setLembrete] = useState<string>("indisponivel");
  const [agora] = useState(() => Date.now());

  const familiar = estado?.perfil.papel === "familiar";
  const fezHoje = estado ? (familiar ? estado.familia.meuCheckin.some((c) => c.data === hoje()) : estado.checkins.some((c) => c.data === hoje())) : true;

  // Abre uma vez por dia, quando a pessoa entra no app
  useEffect(() => {
    if (!estado?.perfil.onboardingFeito) return;
    if (caminho.startsWith("/app/crise") || caminho.startsWith("/app/comecar")) return;
    registrarSW();
    let visto: string | null = null;
    try {
      visto = localStorage.getItem(`${CHAVE}-${estado.perfil.papel}`);
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLembrete(permissaoAtual());
    if (visto !== hoje()) setAberto(true);
  }, [estado?.perfil.onboardingFeito, estado?.perfil.papel, caminho]);

  useEffect(() => {
    atualizarSelo(!fezHoje);
  }, [fezHoje]);

  if (!estado || !aberto) return null;

  const fechar = () => {
    try {
      localStorage.setItem(`${CHAVE}-${estado.perfil.papel}`, hoje());
    } catch {}
    setAberto(false);
  };

  const p = placar(estado);
  const semana = diasNaSemana(estado);
  const poupado = dinheiroPoupado(estado);
  const prox = proximaMissao(estado);
  const tend = familiar ? null : tendencia(estado);
  const frase = fraseDoDia(estado);
  // Recado de quem apoia nas últimas 48 horas vale mais que qualquer frase pronta
  const recado = [...mensagens].reverse().find((m) => m.autor_id !== usuarioId && agora - new Date(m.criado).getTime() < 48 * 3600000);
  const dia = diasEntre(estado.perfil.inicio);
  const ultimoHumor = familiar
    ? [...estado.familia.meuCheckin].sort((a, b) => b.data.localeCompare(a.data))[0]?.como
    : [...estado.checkins].sort((a, b) => b.data.localeCompare(a.data))[0]?.humor;

  const ligar = async () => {
    const r = await ativarLembretes(estado.perfil.horarioCheckin, usuarioId);
    setLembrete(r === "negado" ? "denied" : r === "indisponivel" ? "indisponivel" : "granted");
    if (r === "push" || r === "local") {
      const t = textoLembrete(estado);
      await mostrarLembrete(t.titulo, t.corpo, t.url);
    }
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-ardosia/70 sm:items-center sm:p-6" onClick={fechar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-resumo"
        className="surgir max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[2rem] border-[3px] border-b-0 border-ardosia bg-sol sm:rounded-[2rem] sm:border-b-[3px] sm:shadow-[0_8px_0_var(--ardosia)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-5 pb-2 pt-5 text-center">
          <button type="button" onClick={fechar} className="absolute right-3 top-3 rounded-lg p-2 text-2xl leading-none hover:bg-white/50" aria-label="Fechar resumo">
            ×
          </button>
          <Mascote
            tamanho={120}
            humor={estaDesmaiado(estado) ? "desmaiado" : ultimoHumor !== undefined && ultimoHumor <= 2 ? "preocupado" : "feliz"}
            animacao="pula"
            className="mx-auto"
          />
          <p className="pixel mt-1 text-xs">DIA {dia} · RESUMO</p>
          <h2 id="titulo-resumo" className="mt-1 text-2xl font-extrabold">
            {estaDesmaiado(estado) ? "O Caramelo desmaiou de saudade!" : fezHoje ? "Olha só o seu avanço" : `Oi${estado.perfil.nome ? `, ${estado.perfil.nome}` : ""}! Como você está hoje?`}
          </h2>
        </div>

        <div className="space-y-3 bg-white px-5 py-5">
          <figure className={`rounded-xl border-[3px] border-ardosia p-4 ${recado ? "bg-coral-claro" : frase.tom === "acolher" ? "bg-ceu" : frase.tom === "celebrar" ? "bg-menta-claro" : "bg-sol-claro"}`}>
            <p className="pixel text-[0.6rem] text-ardosia-suave">{recado ? "RECADO DE QUEM TORCE POR VOCÊ" : "FRASE DO DIA"}</p>
            <blockquote className="mt-1 font-titulo text-lg font-bold leading-snug">“{recado ? recado.texto : frase.texto}”</blockquote>
          </figure>
          <div className="grid grid-cols-2 gap-3">
            <Bloco titulo={`Nível ${p.numeroNivel}`} valor={p.nivel.nome}>
              <div className="mt-2 h-3 overflow-hidden rounded border-2 border-ardosia bg-ceu">
                <div className="h-full bg-sol" style={{ width: `${Math.max(5, p.pctNivel)}%` }} />
              </div>
              <p className="pixel mt-1 text-[0.6rem]">{p.total} XP</p>
            </Bloco>
            <Bloco titulo="Meta da semana" valor={`${semana} de 5 dias`}>
              <div className="mt-1 flex items-center gap-2">
                <Anel valor={Math.min(1, semana / 5)} tamanho={34} />
                <span className="text-xs font-bold">{semana >= 5 ? "Batida!" : `Faltam ${5 - semana}`}</span>
              </div>
            </Bloco>
            {!familiar && (
              <Bloco titulo="Longe da aposta" valor={reais(poupado)}>
                <p className="mt-1 text-xs">Nos dias registrados sem aposta</p>
              </Bloco>
            )}
            <Bloco titulo="Missões" valor={`${p.feitas} de ${p.totalMissoes}`}>
              <p className="mt-1 text-xs">{prox ? `Próxima: ${prox.titulo}` : "Trilha completa"}</p>
            </Bloco>
          </div>

          {tend && (
            <p className={`rounded-xl border-[3px] border-ardosia p-3 text-sm font-bold ${tend.caiu ? "bg-menta-claro" : "bg-ceu"}`}>
              {tend.caiu
                ? `Sua vontade média caiu de ${tend.antes.toFixed(1)} para ${tend.recente.toFixed(1)} na última semana. Está funcionando.`
                : `Sua vontade média foi de ${tend.antes.toFixed(1)} para ${tend.recente.toFixed(1)}. Semana mais pesada, e tudo bem. O botão de vontade está aí.`}
            </p>
          )}

          {lembretesSuportados() && lembrete !== "granted" && (
            <div className="rounded-xl border-[3px] border-dashed border-ardosia bg-sol-claro p-3">
              <p className="font-bold">Quer que eu te lembre todo dia?</p>
              <p className="text-sm">
                Um aviso por dia, no fim da tarde, só se o check-in ainda não estiver feito.
                {ehIOSsemInstalar() && " No iPhone, primeiro toque em Compartilhar e Adicionar à Tela de Início."}
              </p>
              {lembrete === "denied" ? (
                <p className="mt-2 text-sm font-bold text-telha">As notificações estão bloqueadas. Libere nas configurações do navegador.</p>
              ) : (
                <button type="button" className="botao-jogo botao-jogo-azul mt-2 w-full" onClick={ligar}>
                  Ligar lembretes do Caramelo
                </button>
              )}
            </div>
          )}

          {fezHoje ? (
            <button type="button" className="botao-jogo w-full text-lg" onClick={fechar}>
              Bora continuar
            </button>
          ) : (
            <Link href={familiar ? "/app" : "/app#checkin"} className="botao-jogo w-full text-lg" onClick={fechar}>
              {estaDesmaiado(estado) ? "Acordar o Caramelo com o check-in" : "Fazer o check-in de hoje"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Bloco({ titulo, valor, children }: { titulo: string; valor: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border-[3px] border-ardosia bg-ceu-fundo p-3 text-left">
      <p className="pixel text-[0.6rem] text-ardosia-suave">{titulo.toUpperCase()}</p>
      <p className="font-titulo text-lg font-extrabold leading-tight">{valor}</p>
      {children}
    </div>
  );
}
