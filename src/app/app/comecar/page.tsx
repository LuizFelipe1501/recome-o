"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Carinhas, Ditado, Ouvir, juntarTexto } from "@/components/ui";
import { Mascote, type Humor } from "@/components/Mascote";
import { DesenhoPixel, useRecompensa } from "@/components/Jogo";
import { dadosPopulacao, perguntasIniciais } from "@/lib/conteudo";
import { useEstado } from "@/lib/estado";
import { pontosHabito } from "@/lib/missoes";
import { hoje, reais } from "@/lib/calculos";
import type { Meta } from "@/lib/tipos";

const respostas = ["Não", "Às vezes", "Sim"];
const ESTRELA = ["...X...", "..XXX..", "XXXXXXX", ".XXXXX.", "..XXX..", ".XX.XX.", "XX...XX"];

type Reacao = { texto: string; humor: Humor };

export default function Comecar() {
  const { estado, atualizar, aceitarConvite } = useEstado();
  const router = useRouter();
  const recompensar = useRecompensa();
  const [passo, setPasso] = useState(0);
  const [codigo, setCodigo] = useState("");
  const [erroCodigo, setErroCodigo] = useState<string | null>(null);
  const [ultima, setUltima] = useState<number | null>(null);

  if (!estado) return null;
  const familiar = estado.perfil.papel === "familiar";
  const p = estado.perfil;
  const setPerfil = (parcial: Partial<typeof p>) => atualizar((e) => ({ ...e, perfil: { ...e.perfil, ...parcial } }));
  const porque = estado.anotacoes["meu-porque"] ?? "";
  const setPorque = (v: string) => atualizar((s) => ({ ...s, anotacoes: { ...s.anotacoes, "meu-porque": v } }));

  const total = familiar ? 3 : 5;
  const nome = p.nome.trim();

  const terminar = () => {
    setPerfil({ onboardingFeito: true, inicio: new Date().toISOString() });
    // No primeiro dia a comemoração já faz as vezes do resumo diário
    try {
      localStorage.setItem(`recomeco-resumo-visto-${estado.perfil.papel}`, hoje());
    } catch {}
    recompensar({
      pontos: pontosHabito.boasVindas,
      rotulo: "A jornada começou",
      titulo: "Primeiro passo dado",
      texto: `Bem-vindo ao NonBet${nome ? `, ${nome}` : ""}. Daqui pra frente eu caminho do seu lado.`,
      humor: "emocionado",
    });
    router.replace("/app");
  };

  const proximo = () => {
    setUltima(null);
    if (passo + 1 < total) setPasso(passo + 1);
    else terminar();
  };

  const pontos = p.autoteste.reduce((s, v) => s + (v ?? 0), 0);
  const respondidas = p.autoteste.filter((v) => v !== undefined && v !== null).length;
  const pct = p.perdaMensal > 0 && p.rendaMensal > 0 ? Math.round((p.perdaMensal / p.rendaMensal) * 100) : null;
  const sentimento = estado.familia.meuCheckin.find((c) => c.data === hoje())?.como;

  // O Caramelo reage ao que a pessoa responde em cada passo
  const reacao = (): Reacao => {
    if (familiar) {
      if (passo === 0)
        return nome
          ? { texto: `Prazer, ${nome}! Vamos cuidar juntos de quem você ama, e de você também.`, humor: "apaixonado" }
          : { texto: "Que bom que você chegou. Eu sou o Caramelo. Quem cuida também precisa de cuidado.", humor: "feliz" };
      if (passo === 1) {
        if (!sentimento) return { texto: "E você, como está de verdade? Pode ser sincero comigo.", humor: "pensativo" };
        if (sentimento <= 2) return { texto: "Cuidar cansa, né? Aqui você também é cuidado. Fica comigo.", humor: "triste" };
        if (sentimento === 3) return { texto: "Um dia mais ou menos. Obrigado por contar. Eu tô aqui.", humor: "pensativo" };
        return { texto: "Que bom! Gente bem cuidada cuida melhor dos outros.", humor: "feliz" };
      }
      if (erroCodigo) return { texto: "Esse código não deu certo. Confere as letras com a pessoa?", humor: "preocupado" };
      return { texto: "Com o código, vocês viram uma dupla. Missões feitas juntos valem o dobro!", humor: "piscadinha" };
    }

    if (passo === 0)
      return nome
        ? { texto: `Prazer, ${nome}! Já gostei de você. Vou caminhar do seu lado todos os dias.`, humor: "apaixonado" }
        : { texto: "Oi! Eu sou o Caramelo. Aqui ninguém julga ninguém. Como posso te chamar?", humor: "animado" };
    if (passo === 1) {
      if (respondidas === perguntasIniciais.length) {
        if (pontos >= 4) return { texto: "Ei, isso pesa, né? Obrigado por confiar em mim. Tem saída, e você não vai sozinho.", humor: "triste" };
        if (pontos >= 1) return { texto: "Tem alguns sinais de alerta. Que bom que a gente percebeu cedo. Isso é cuidado.", humor: "pensativo" };
        return { texto: "Poucos sinais por enquanto. Vamos manter assim, juntos?", humor: "feliz" };
      }
      if (ultima === 2) return { texto: "Obrigado pela sinceridade. Contar a verdade já é um passo enorme.", humor: "preocupado" };
      if (ultima === 1) return { texto: "Às vezes também conta. Tô anotando com carinho, sem julgar.", humor: "pensativo" };
      if (ultima === 0) return { texto: "Que bom! Segue comigo nas próximas.", humor: "feliz" };
      return { texto: "Cinco perguntinhas sobre o último mês. Só você vê as respostas, prometo.", humor: "pensativo" };
    }
    if (passo === 2) {
      if (pct !== null && pct >= 30) return { texto: `${pct}% da sua renda... isso dói. Mas esse dinheiro pode voltar a ser seu.`, humor: "triste" };
      if (pct !== null && pct >= 10) return { texto: `${reais(p.perdaMensal * 12)} em um ano. Imagina isso guardado na sua casinha!`, humor: "preocupado" };
      if (pct !== null) return { texto: "Anotado. Saber o tamanho do problema já tira um peso das costas.", humor: "pensativo" };
      return { texto: "Sabia? A maioria dos brasileiros não aposta! Viver sem bet é o normal.", humor: "surpreso" };
    }
    if (passo === 3) {
      if (porque.trim().length > 3) return { texto: "Que motivo bonito. Vou te lembrar dele toda vez que ficar difícil.", humor: "emocionado" };
      if (p.meta === "parar") return { texto: "Decisão de gigante! Vou estar do seu lado todos os dias.", humor: "animado" };
      if (p.meta === "reduzir") return { texto: "Um passo de cada vez funciona. Limite claro também é força.", humor: "feliz" };
      return { texto: "Tudo bem pensar com calma. Eu espero você, sem pressa.", humor: "piscadinha" };
    }
    if ((estado.trava.pessoaConfianca ?? "").trim())
      return { texto: "Ter alguém do lado muda tudo. Fico feliz que você tem essa pessoa.", humor: "apaixonado" };
    return { texto: "Um minutinho por dia. Eu te lembro, sem cobrança nenhuma.", humor: "normal" };
  };

  const r = reacao();
  const textoSecao: Record<string, string> = familiar
    ? {
        0: "Que bom que você está aqui. Conviver com alguém que aposta cansa e preocupa. Este espaço é para você entender o que está acontecendo, saber como ajudar e cuidar de si.",
        1: "E você, como está? Quem convive com o problema também sofre. Raiva, cansaço e desesperança são reações comuns.",
        2: "Tem um código de convite? Se a pessoa já usa o NonBet, ela pode gerar um código na aba Família.",
      }
    : {
        0: "Isto aqui é sem julgamento. Muita gente entrou nas apostas para fechar o mês, por diversão ou porque todo mundo em volta apostava. O app foi feito para te ajudar a retomar o controle, no seu ritmo.",
        1: `Uma conversa rápida. ${perguntasIniciais.join(" ")}`,
        2: `Nem todo mundo aposta. ${String(dadosPopulacao.naoApostam).replace(".", ",")} por cento dos brasileiros com 14 anos ou mais não apostaram nenhuma vez no último ano.`,
        3: "O que você quer agora? Parar de apostar, diminuir, ou ainda estou decidindo.",
        4: "Um minuto por dia. Escolha o horário do seu check-in e, se quiser, alguém de confiança.",
      };

  return (
    <div className="pt-4 lg:pt-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="hidden font-titulo text-2xl font-extrabold lg:block">NonBet</p>
          <p className="pixel text-xs text-ardosia-suave">
            PASSO {passo + 1} DE {total}
          </p>
        </div>
        <p className="pixel rounded-lg border-2 border-ardosia bg-sol px-2 py-1 text-xs">+{pontosHabito.boasVindas} XP NO FINAL</p>
        <ol className="flex w-full gap-1.5" aria-label={`Passo ${passo + 1} de ${total}`}>
          {Array.from({ length: total }).map((_, i) => (
            <li
              key={i}
              className={`grid h-7 flex-1 place-items-center rounded-md border-[3px] border-ardosia ${i < passo ? "bg-sol" : i === passo ? "bg-mare text-white" : "bg-white"}`}
              aria-label={i < passo ? `Passo ${i + 1} feito` : i === passo ? `Passo ${i + 1}, atual` : `Passo ${i + 1}`}
            >
              {i < passo && <DesenhoPixel desenho={ESTRELA} tamanho={14} cor="var(--ardosia)" />}
            </li>
          ))}
        </ol>
      </header>

      <div className="grid gap-5 lg:grid-cols-[18rem_1fr] lg:items-start lg:gap-8">
        {/* Palco do Caramelo */}
        <aside className="relative overflow-hidden rounded-[1.75rem] border-[3px] border-ardosia bg-mare p-4 text-white shadow-[0_6px_0_var(--ardosia)] lg:sticky lg:top-8 lg:p-5">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-mare-escura" aria-hidden="true" />
          <div className="relative flex items-end gap-3 lg:flex-col lg:items-center">
            <Mascote key={r.humor} tamanho={96} humor={r.humor} className="shrink-0 drop-shadow-[0_4px_0_rgba(0,0,0,0.25)] lg:h-40 lg:w-40" />
            <div className="relative mb-3 flex-1 rounded-2xl border-[3px] border-ardosia bg-white px-4 py-3 font-bold text-ardosia lg:mb-4 lg:w-full" aria-live="polite">
              <p className="pixel mb-0.5 text-[0.6rem] text-mare-escura">CARAMELO</p>
              <p key={r.texto} className="surgir">
                {r.texto}
              </p>
            </div>
          </div>
        </aside>

        <div className="rounded-[1.75rem] border-[3px] border-ardosia bg-white p-5 shadow-[0_5px_0_var(--ardosia)] sm:p-6">
          {passo === 0 && (
            <section className="space-y-5">
              <h1 className="text-3xl font-extrabold">{familiar ? "Que bom que você está aqui" : "Isto aqui é sem julgamento"}</h1>
              <p>
                {familiar
                  ? "Conviver com alguém que aposta cansa e preocupa. Este espaço é para você entender o que está acontecendo, saber como ajudar e cuidar de si."
                  : "Muita gente entrou nas apostas para fechar o mês, por diversão ou porque todo mundo em volta apostava. O app foi feito para te ajudar a retomar o controle, no seu ritmo."}
              </p>
              <div>
                <label className="rotulo" htmlFor="nome">
                  Como quer ser chamado
                </label>
                <input id="nome" className="campo" value={p.nome} autoComplete="nickname" onChange={(e) => setPerfil({ nome: e.target.value })} />
                <Ditado aoTexto={(t) => setPerfil({ nome: juntarTexto("", t).replace(/[.!?]$/, "") })} rotulo="Falar meu nome" />
              </div>
              <p className="rounded-xl bg-ceu p-3 text-sm">
                <strong>Seus dados são seus.</strong> O NonBet não acessa sua conta no banco e, se você chamar alguém da família, ela vê só o
                que você escolher mostrar.
              </p>
              {familiar && (
                <div>
                  <label className="rotulo" htmlFor="relacao">
                    Quem é a pessoa para você
                  </label>
                  <select
                    id="relacao"
                    className="campo"
                    value={estado.anotacoes.relacao ?? ""}
                    onChange={(e) => atualizar((s) => ({ ...s, anotacoes: { ...s.anotacoes, relacao: e.target.value } }))}
                  >
                    <option value="">Escolha</option>
                    <option>Filho ou filha</option>
                    <option>Companheiro ou companheira</option>
                    <option>Pai ou mãe</option>
                    <option>Irmão ou irmã</option>
                    <option>Amigo ou amiga</option>
                    <option>Outra pessoa</option>
                  </select>
                </div>
              )}
            </section>
          )}

          {!familiar && passo === 1 && (
            <section className="space-y-5">
              <h1 className="text-3xl font-extrabold">Uma conversa rápida</h1>
              <p>
                Cinco perguntas sobre o último mês. Não é um diagnóstico, serve para você enxergar onde está. Ninguém além de você vê as
                respostas.
              </p>
              {perguntasIniciais.map((q, i) => (
                <fieldset key={q} className="rounded-2xl bg-ceu-fundo p-4">
                  <legend className="sr-only">{q}</legend>
                  <p className="font-bold" aria-hidden="true">
                    <span className="pixel mr-1 text-xs text-mare-escura">{i + 1}/5</span> {q}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label={q}>
                    {respostas.map((resp, v) => {
                      const marcado = p.autoteste[i] === v;
                      return (
                        <button
                          key={resp}
                          type="button"
                          role="radio"
                          aria-checked={marcado}
                          className={`min-h-12 rounded-xl border-[3px] px-2 font-bold transition-transform active:translate-y-0.5 ${
                            marcado ? "border-ardosia bg-sol shadow-[0_3px_0_var(--ardosia)]" : "border-nuvem bg-white hover:border-ardosia"
                          }`}
                          onClick={() => {
                            const novo = [...p.autoteste];
                            novo[i] = v;
                            setPerfil({ autoteste: novo });
                            setUltima(v);
                          }}
                        >
                          {marcado && <span aria-hidden="true">✓ </span>}
                          {resp}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
              {respondidas === perguntasIniciais.length && (
                <div className="surgir rounded-2xl border-[3px] border-ardosia bg-sol-claro p-4" role="status">
                  {pontos >= 4 ? (
                    <p>
                      Suas respostas mostram que a aposta já está pesando na sua vida. Isso tem tratamento e tem saída. Além do app, vale
                      procurar o teleatendimento gratuito do SUS, que fica em Apoio.
                    </p>
                  ) : pontos >= 1 ? (
                    <p>Há alguns sinais de alerta. Este é um ótimo momento para agir, antes que o problema cresça.</p>
                  ) : (
                    <p>Por enquanto, poucos sinais de dano. O app pode te ajudar a manter assim.</p>
                  )}
                </div>
              )}
            </section>
          )}

          {!familiar && passo === 2 && (
            <section className="space-y-5">
              <h1 className="text-3xl font-extrabold">Nem todo mundo aposta</h1>
              <p className="font-titulo text-5xl font-extrabold text-mare-escura">{String(dadosPopulacao.naoApostam).replace(".", ",")}%</p>
              <p>
                dos brasileiros com 14 anos ou mais não apostaram nenhuma vez no último ano. A propaganda e o futebol fazem parecer que
                todo mundo aposta, mas a maioria não aposta.
              </p>
              <p className="text-sm text-ardosia-suave">Fonte: {dadosPopulacao.fonte}.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="rotulo" htmlFor="perda">
                    Perco por mês, mais ou menos
                  </label>
                  <input id="perda" inputMode="numeric" className="campo" placeholder="R$" value={p.perdaMensal || ""} onChange={(e) => setPerfil({ perdaMensal: Number(e.target.value.replace(/\D/g, "")) })} />
                </div>
                <div>
                  <label className="rotulo" htmlFor="renda">
                    Minha renda por mês
                  </label>
                  <input id="renda" inputMode="numeric" className="campo" placeholder="R$" value={p.rendaMensal || ""} onChange={(e) => setPerfil({ rendaMensal: Number(e.target.value.replace(/\D/g, "")) })} />
                </div>
              </div>
              {pct !== null && (
                <p className="surgir rounded-2xl bg-ceu p-4" role="status">
                  Hoje, cerca de <strong>{pct}%</strong> da sua renda vai para as apostas. Em um ano, são {reais(p.perdaMensal * 12)}.
                </p>
              )}
              <p className="text-sm text-ardosia-suave">Pode deixar em branco se não souber. Dá para preencher depois.</p>
            </section>
          )}

          {!familiar && passo === 3 && (
            <section className="space-y-5">
              <h1 className="text-3xl font-extrabold">O que você quer agora?</h1>
              <p>Não existe resposta certa. Você pode mudar de ideia quando quiser.</p>
              <div className="space-y-2" role="radiogroup" aria-label="O que você quer agora">
                {(
                  [
                    ["parar", "Parar de apostar", "Ficar longe das apostas de vez."],
                    ["reduzir", "Diminuir", "Apostar bem menos, com limites claros."],
                    ["decidindo", "Ainda estou decidindo", "Quero entender melhor antes."],
                  ] as [Meta, string, string][]
                ).map(([v, t, d]) => {
                  const marcado = p.meta === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={marcado}
                      onClick={() => setPerfil({ meta: v })}
                      className={`flex w-full items-center gap-3 rounded-2xl border-[3px] p-4 text-left transition-transform active:translate-y-0.5 ${
                        marcado ? "border-ardosia bg-sol shadow-[0_4px_0_var(--ardosia)]" : "border-nuvem bg-white hover:border-ardosia"
                      }`}
                    >
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-[3px] border-ardosia ${marcado ? "bg-ardosia" : "bg-white"}`} aria-hidden="true">
                        {marcado && <span className="h-2 w-2 rounded-full bg-sol" />}
                      </span>
                      <span>
                        <strong>{t}</strong>
                        <span className="block text-sm text-ardosia-suave">{d}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div>
                <label className="rotulo" htmlFor="porque">
                  Por quem ou pelo quê você quer mudar? <span className="font-normal text-ardosia-suave">(opcional)</span>
                </label>
                <textarea id="porque" rows={2} className="campo" value={porque} onChange={(e) => setPorque(e.target.value)} placeholder="Ex.: pela minha filha, para dormir em paz, para quitar o cartão" />
                <Ditado aoTexto={(t) => setPorque(juntarTexto(porque, t))} />
                <p className="mt-1 text-sm text-ardosia-suave">Essa frase aparece na sua tela Hoje para lembrar por que você começou.</p>
              </div>
            </section>
          )}

          {!familiar && passo === 4 && (
            <section className="space-y-5">
              <h1 className="text-3xl font-extrabold">Um minuto por dia</h1>
              <p>
                Uma vez por dia o app pergunta como você está. Leva menos de um minuto. Escolha um horário bom, de preferência perto do
                momento em que a vontade costuma aparecer.
              </p>
              <div>
                <label className="rotulo" htmlFor="horario">
                  Horário do meu check-in
                </label>
                <input id="horario" type="time" className="campo" value={p.horarioCheckin} onChange={(e) => setPerfil({ horarioCheckin: e.target.value })} />
              </div>
              <div>
                <label className="rotulo" htmlFor="pessoa">
                  Alguém de confiança para os momentos difíceis
                </label>
                <input
                  id="pessoa"
                  className="campo"
                  placeholder="Nome e telefone, se quiser"
                  value={estado.trava.pessoaConfianca ?? ""}
                  onChange={(e) => atualizar((s) => ({ ...s, trava: { ...s.trava, pessoaConfianca: e.target.value } }))}
                />
                <p className="mt-1 text-sm text-ardosia-suave">Opcional. Aparece quando você pedir ajuda no botão de vontade.</p>
              </div>
            </section>
          )}

          {familiar && passo === 1 && (
            <section className="space-y-5">
              <h1 className="text-3xl font-extrabold">E você, como está?</h1>
              <p>Quem convive com o problema também sofre. Raiva, cansaço e desesperança são reações comuns.</p>
              <Carinhas
                legenda="Como você se sente hoje"
                valor={sentimento}
                aoMudar={(v) =>
                  atualizar((s) => ({
                    ...s,
                    familia: { ...s.familia, meuCheckin: [...s.familia.meuCheckin.filter((c) => c.data !== hoje()), { data: hoje(), como: v }] },
                  }))
                }
              />
            </section>
          )}

          {familiar && passo === 2 && (
            <section className="space-y-5">
              <h1 className="text-3xl font-extrabold">Tem um código de convite?</h1>
              <p>
                Se a pessoa já usa o NonBet, ela pode gerar um código na aba Família. Com ele, você acompanha só o que ela escolher mostrar
                e pode mandar mensagens de apoio.
              </p>
              <div>
                <label className="rotulo" htmlFor="codigo">
                  Código
                </label>
                <input id="codigo" className="campo uppercase tracking-widest" value={codigo} onChange={(e) => setCodigo(e.target.value)} maxLength={6} />
              </div>
              {erroCodigo && (
                <p role="alert" className="font-bold text-telha">
                  {erroCodigo}
                </p>
              )}
              <button
                type="button"
                className="botao-linha w-full"
                disabled={codigo.trim().length < 6}
                onClick={async () => {
                  const erro = await aceitarConvite(codigo);
                  if (erro) setErroCodigo(erro);
                  else terminar();
                }}
              >
                Usar código
              </button>
              <p className="text-sm text-ardosia-suave">Não tem código? Tudo bem. O espaço da família funciona do mesmo jeito.</p>
            </section>
          )}

          <div className="mt-8 flex gap-3">
            {passo > 0 && (
              <button
                type="button"
                className="botao-linha"
                onClick={() => {
                  setUltima(null);
                  setPasso(passo - 1);
                }}
              >
                Voltar
              </button>
            )}
            <button type="button" className="botao-jogo botao-jogo-azul flex-1 text-lg" onClick={proximo}>
              {passo + 1 < total ? "Continuar" : "Entrar no NonBet"}
            </button>
          </div>
          <div className="mt-4">
            <Ouvir key={passo} texto={`${r.texto} ${textoSecao[passo] ?? ""}`} rotulo="Ouvir em voz alta" />
          </div>
        </div>
      </div>
    </div>
  );
}
