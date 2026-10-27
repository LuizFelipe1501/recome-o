"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Carinhas, Ouvir } from "@/components/ui";
import { dadosPopulacao, perguntasIniciais } from "@/lib/conteudo";
import { useEstado } from "@/lib/estado";
import { hoje, reais } from "@/lib/calculos";
import type { Meta } from "@/lib/tipos";

const respostas = ["Não", "Às vezes", "Sim"];

export default function Comecar() {
  const { estado, atualizar, aceitarConvite } = useEstado();
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const [codigo, setCodigo] = useState("");
  const [erroCodigo, setErroCodigo] = useState<string | null>(null);

  if (!estado) return null;
  const familiar = estado.perfil.papel === "familiar";
  const p = estado.perfil;
  const setPerfil = (parcial: Partial<typeof p>) => atualizar((e) => ({ ...e, perfil: { ...e.perfil, ...parcial } }));

  const total = familiar ? 3 : 5;

  const terminar = () => {
    setPerfil({ onboardingFeito: true, inicio: new Date().toISOString() });
    router.replace("/app");
  };

  const proximo = () => (passo + 1 < total ? setPasso(passo + 1) : terminar());

  const pontos = p.autoteste.reduce((s, v) => s + v, 0);
  const respondidas = p.autoteste.filter((v) => v !== undefined).length;

  return (
    <div className="pt-4">
      <div className="mb-6">
        <p className="text-sm font-bold text-ardosia-suave">
          Passo {passo + 1} de {total}
        </p>
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= passo ? "bg-mare" : "bg-nuvem"}`} />
          ))}
        </div>
      </div>

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
            <input id="nome" className="campo" value={p.nome} onChange={(e) => setPerfil({ nome: e.target.value })} />
          </div>
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
            Cinco perguntas sobre o último mês. Não é um diagnóstico, serve para você enxergar onde está. Ninguém além de você vê
            as respostas.
          </p>
          {perguntasIniciais.map((q, i) => (
            <fieldset key={q} className="bloco">
              <legend className="font-bold">{q}</legend>
              <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup">
                {respostas.map((r, v) => (
                  <button
                    key={r}
                    type="button"
                    role="radio"
                    aria-checked={p.autoteste[i] === v}
                    className="opcao text-center"
                    onClick={() => {
                      const novo = [...p.autoteste];
                      novo[i] = v;
                      setPerfil({ autoteste: novo });
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          {respondidas === perguntasIniciais.length && (
            <div className="rounded-2xl bg-sol-claro p-4" role="status">
              {pontos >= 4 ? (
                <p>
                  Suas respostas mostram que a aposta já está pesando na sua vida. Isso tem tratamento e tem saída. Além do app,
                  vale procurar o teleatendimento gratuito do SUS, que fica em Apoio.
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
          <p className="font-titulo text-5xl font-extrabold text-mare-escura">{dadosPopulacao.naoApostam}%</p>
          <p>
            dos brasileiros com 14 anos ou mais não apostaram nenhuma vez no último ano. A propaganda e o futebol fazem parecer
            que todo mundo aposta, mas a maioria não aposta.
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
          {p.perdaMensal > 0 && p.rendaMensal > 0 && (
            <p className="rounded-2xl bg-ceu p-4" role="status">
              Hoje, cerca de <strong>{Math.round((p.perdaMensal / p.rendaMensal) * 100)}%</strong> da sua renda vai para as apostas.
              Em um ano, são {reais(p.perdaMensal * 12)}.
            </p>
          )}
          <p className="text-sm text-ardosia-suave">Pode deixar em branco se não souber. Dá para preencher depois.</p>
        </section>
      )}

      {!familiar && passo === 3 && (
        <section className="space-y-5">
          <h1 className="text-3xl font-extrabold">O que você quer agora?</h1>
          <p>Não existe resposta certa. Você pode mudar de ideia quando quiser.</p>
          <div className="space-y-2" role="radiogroup">
            {(
              [
                ["parar", "Parar de apostar", "Ficar longe das apostas de vez."],
                ["reduzir", "Diminuir", "Apostar bem menos, com limites claros."],
                ["decidindo", "Ainda estou decidindo", "Quero entender melhor antes."],
              ] as [Meta, string, string][]
            ).map(([v, t, d]) => (
              <button key={v} type="button" role="radio" aria-checked={p.meta === v} className="opcao" onClick={() => setPerfil({ meta: v })}>
                <strong>{t}</strong>
                <span className="block text-sm text-ardosia-suave">{d}</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-ardosia-suave">
            Mais da metade das pessoas em programas parecidos escolhe começar diminuindo. Os dois caminhos têm apoio aqui.
          </p>
        </section>
      )}

      {!familiar && passo === 4 && (
        <section className="space-y-5">
          <h1 className="text-3xl font-extrabold">Um minuto por dia</h1>
          <p>
            Uma vez por dia o app pergunta como você está. Leva menos de um minuto. Escolha um horário bom, de preferência perto
            do momento em que a vontade costuma aparecer.
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
            valor={estado.familia.meuCheckin.find((c) => c.data === hoje())?.como}
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
            Se a pessoa já usa o Recomeço, ela pode gerar um código na aba Família. Com ele, você acompanha só o que ela escolher
            mostrar e pode mandar mensagens de apoio.
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
          <button type="button" className="botao-linha" onClick={() => setPasso(passo - 1)}>
            Voltar
          </button>
        )}
        <button type="button" className="botao flex-1" onClick={proximo}>
          {passo + 1 < total ? "Continuar" : "Entrar no Recomeço"}
        </button>
      </div>
      {passo === 0 && (
        <div className="mt-4">
          <Ouvir texto="Você pode ouvir os textos do app tocando neste botão em cada tela." rotulo="Ouvir em voz alta" />
        </div>
      )}
    </div>
  );
}
