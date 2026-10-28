"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Titulo } from "@/components/ui";
import { useEstado } from "@/lib/estado";
import type { Estado } from "@/lib/tipos";
import { ativarLembretes, desativarLembretes, ehIOSsemInstalar, lembretesSuportados, mostrarLembrete, permissaoAtual } from "@/lib/lembretes";
import { textoLembrete } from "@/lib/textoLembrete";

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
        <Interruptor
          ativo={p.legendas ?? true}
          rotulo="Legenda ao ouvir"
          descricao="Mostra o texto e destaca cada palavra enquanto o app lê em voz alta"
          aoMudar={() => setPref("legendas", !(p.legendas ?? true))}
        />

        <fieldset className="pt-3">
          <legend className="font-bold">Cores para daltonismo</legend>
          <p className="text-sm text-ardosia-suave">
            Troca as cores que podem se confundir e coloca símbolos nas respostas: ▼ para ruim, ● para meio e ▲ para bom.
          </p>
          <div className="mt-2 space-y-2" role="radiogroup" aria-label="Cores para daltonismo">
            {(
              [
                ["nenhum", "Cores padrão", "Sem ajuste", ["#f7b4bf", "#fef6a8", "#9fe6c4"]],
                ["vermelho-verde", "Vermelho e verde", "Protanopia e deuteranopia, os tipos mais comuns", ["#f39a5c", "#ecebd6", "#5aaee6"]],
                ["azul-amarelo", "Azul e amarelo", "Tritanopia", ["#f06b97", "#dedede", "#3fb59a"]],
              ] as const
            ).map(([v, t, d, cores]) => {
              const marcado = (p.daltonismo ?? "nenhum") === v;
              return (
                <button key={v} type="button" role="radio" aria-checked={marcado} className="opcao flex items-center justify-between gap-3" onClick={() => setPref("daltonismo", v)}>
                  <span>
                    <strong>{t}</strong>
                    <span className="block text-sm text-ardosia-suave">{d}</span>
                  </span>
                  <span className="flex shrink-0 gap-1" aria-hidden="true">
                    {cores.map((c, i) => (
                      <span key={c} className="grid h-7 w-7 place-items-center rounded-md border-2 border-ardosia text-xs font-bold" style={{ background: c }}>
                        {v === "nenhum" ? "" : ["▼", "●", "▲"][i]}
                      </span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          <PreviaCores />
        </fieldset>

        <p className="pt-2 text-sm text-ardosia-suave">
          A fonte do app foi feita para pessoas com baixa visão. Os textos principais têm o botão Ouvir, que lê em voz alta com a voz
          do celular. Nos campos de texto, o botão Falar em vez de digitar transcreve o que você diz, sem precisar escrever.
        </p>
      </section>

      <Lembretes />

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
          Protótipo do NonBet para o hackathon Rolê que Rende, BB Digital Week 2026. O conteúdo se baseia em terapia
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

function Lembretes() {
  const { estado, usuarioId } = useEstado();
  const [status, setStatus] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(permissaoAtual());
  }, []);
  if (!estado || status === null) return null;

  const testar = async () => {
    const t = textoLembrete(estado);
    const ok = await mostrarLembrete(t.titulo, t.corpo, t.url);
    setAviso(ok ? "Lembrete enviado. Confira a notificação no aparelho." : "Não consegui mostrar a notificação.");
  };

  return (
    <section className="bloco space-y-3" aria-labelledby="titulo-lembretes">
      <h2 id="titulo-lembretes" className="text-xl font-bold">
        Lembretes do Caramelo
      </h2>
      <p>
        Um aviso por dia, só quando o check-in ainda não foi feito. Cada dia mostra um avanço diferente: meta da semana, XP, dinheiro
        longe da aposta ou a próxima missão. Nada de cobrança.
      </p>
      {!lembretesSuportados() ? (
        <p className="text-sm text-ardosia-suave">Este navegador não aceita notificações.</p>
      ) : status === "granted" ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="botao-jogo botao-jogo-azul" onClick={testar}>
            Mandar um lembrete de teste
          </button>
          <button
            type="button"
            className="botao-linha"
            onClick={async () => {
              await desativarLembretes(usuarioId);
              setAviso("Lembretes desligados. Para bloquear de vez, use as configurações do navegador.");
            }}
          >
            Desligar
          </button>
        </div>
      ) : status === "denied" ? (
        <p className="text-sm font-bold text-telha">As notificações estão bloqueadas. Libere nas configurações do navegador para este site.</p>
      ) : (
        <button
          type="button"
          className="botao-jogo botao-jogo-azul w-full"
          onClick={async () => {
            const r = await ativarLembretes(estado.perfil.horarioCheckin, usuarioId);
            setStatus(r === "negado" ? "denied" : "granted");
            if (r !== "negado" && r !== "indisponivel") await testar();
          }}
        >
          Ligar lembretes
        </button>
      )}
      {ehIOSsemInstalar() && (
        <p className="rounded-xl bg-ceu p-3 text-sm">
          No iPhone, os lembretes só funcionam com o app na tela de início: toque em Compartilhar e depois em Adicionar à Tela de
          Início.
        </p>
      )}
      {aviso && (
        <p role="status" className="text-sm font-bold text-mare-escura">
          {aviso}
        </p>
      )}
    </section>
  );
}

// Mostra, com as cores de verdade do app, como ficam as respostas, os avisos e os chefões
function PreviaCores() {
  const escala = [
    ["Muito mal", "var(--escala-1)", "M4 6h16L12 19Z", 2],
    ["Mais ou menos", "var(--escala-3)", "M12 5a7 7 0 1 1 0 14a7 7 0 0 1 0-14Z", 1],
    ["Muito bem", "var(--escala-5)", "M4 18h16L12 5Z", 2],
  ] as const;
  const chefoes = [
    ["Perigoso", "var(--chefao-risco)"],
    ["Da casa", "var(--chefao-sobrevivencia)"],
    ["Dos juros", "var(--chefao-cara)"],
    ["Outro", "var(--chefao-outra)"],
  ] as const;
  return (
    <div className="mt-3 space-y-3 rounded-2xl border-[3px] border-ardosia bg-white p-4" aria-label="Prévia das cores">
      <p className="pixel text-[0.6rem] text-ardosia-suave">PRÉVIA COM AS CORES ESCOLHIDAS</p>
      <div className="grid grid-cols-3 gap-2">
        {escala.map(([rotulo, cor, forma, vezes]) => (
          <span key={rotulo} className="flex min-h-14 flex-col items-center justify-center rounded-xl border-[3px] border-ardosia px-1 text-center text-sm font-bold" style={{ background: cor }}>
            <span className="simbolo-escala justify-center" aria-hidden="true">
              {Array.from({ length: vezes }).map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24">
                  <path d={forma} fill="var(--ardosia)" />
                </svg>
              ))}
            </span>
            {rotulo}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 text-sm font-bold">
        <span className="rounded-lg bg-menta px-2 py-1 text-white">Feito</span>
        <span className="rounded-lg bg-coral px-2 py-1 text-coral-texto">Atenção</span>
        <span className="rounded-lg bg-telha px-2 py-1 text-white">Perigo</span>
        <span className="rounded-lg bg-menta-claro px-2 py-1">Reserva</span>
        <span className="rounded-lg bg-coral-claro px-2 py-1">Recado</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {chefoes.map(([rotulo, cor]) => (
          <span key={rotulo} className="flex flex-col items-center gap-1 text-xs font-bold">
            <span className="h-6 w-full rounded-md border-[3px] border-ardosia" style={{ background: cor }} />
            {rotulo}
          </span>
        ))}
      </div>
    </div>
  );
}
