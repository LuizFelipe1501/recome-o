"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { atividades } from "@/lib/conteudo";
import { useEstado } from "@/lib/estado";
import { ordenarDividas, reais, restante } from "@/lib/calculos";
import { Base, Escala, Ouvir } from "./ui";

export function Atividade({ id, aoConcluir }: { id: string; aoConcluir?: () => void }) {
  const a = atividades[id];
  const { estado, atualizar } = useEstado();
  const [feito, setFeito] = useState(false);

  if (!a || !estado) return null;

  const concluir = () => {
    atualizar((e) => ({
      ...e,
      atividadesFeitas: { ...e.atividadesFeitas, [id]: [...(e.atividadesFeitas[id] ?? []), new Date().toISOString()] },
    }));
    setFeito(true);
    aoConcluir?.();
  };

  const favorita = estado.favoritas.includes(id);
  const textoFalado = [a.titulo, a.intro, ...(a.passos ?? [])].join(". ");

  return (
    <article className="bloco">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{a.titulo}</h2>
          <p className="text-sm text-ardosia-suave">Cerca de {a.minutos} min</p>
        </div>
        <button
          type="button"
          onClick={() =>
            atualizar((e) => ({
              ...e,
              favoritas: favorita ? e.favoritas.filter((f) => f !== id) : [...e.favoritas, id],
            }))
          }
          aria-pressed={favorita}
          className="rounded-full p-2 text-sol hover:bg-ceu"
          aria-label={favorita ? "Tirar dos favoritos" : "Guardar nos favoritos"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z"
              fill={favorita ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <p className="mt-3">{a.intro}</p>
      <Ouvir texto={textoFalado} />

      <div className="mt-4">
        {a.tipo === "timer" && <Timer minutos={a.minutos} passos={a.passos ?? []} />}
        {a.tipo === "escala" && <Surfar passos={a.passos ?? []} />}
        {a.tipo === "lista" && <Lista itens={a.passos ?? []} />}
        {a.tipo === "cartas" && <Cartas cartas={a.cartas ?? []} />}
        {a.tipo === "texto" && <Anotacao id={id} pergunta={a.campo ?? ""} />}
        {a.tipo === "calculadora" && <Calculadora />}
        {a.tipo === "ligar" && <Ligar />}
        {a.tipo === "divida" && <ProximoPasso />}
      </div>

      <div className="mt-5">
        {feito ? (
          <p className="font-bold text-mare-escura" role="status">
            Registrado. Cada vez que você faz isso, conta na sua jornada.
          </p>
        ) : (
          <button type="button" className="botao w-full" onClick={concluir}>
            Concluí esta atividade
          </button>
        )}
      </div>
      <Base>{a.base}</Base>
    </article>
  );
}

function Timer({ minutos, passos }: { minutos: number; passos: string[] }) {
  const [fim, setFim] = useState<number | null>(null);
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    if (!fim) return;
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [fim]);

  const resta = fim ? Math.max(0, fim - agora) : minutos * 60000;
  const mm = String(Math.floor(resta / 60000)).padStart(2, "0");
  const ss = String(Math.floor((resta % 60000) / 1000)).padStart(2, "0");

  return (
    <div>
      <ul className="mb-4 space-y-2">
        {passos.map((p) => (
          <li key={p} className="flex gap-2">
            <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-mare" />
            {p}
          </li>
        ))}
      </ul>
      <div className="rounded-2xl bg-ceu p-4 text-center">
        <p className="font-titulo text-5xl font-extrabold tabular-nums" aria-live="off">
          {mm}:{ss}
        </p>
        {!fim ? (
          <button type="button" className="botao-linha mt-3" onClick={() => setFim(Date.now() + minutos * 60000)}>
            Começar a contar
          </button>
        ) : resta === 0 ? (
          <p className="mt-2 font-bold" role="status">
            Você atravessou os {minutos} minutos. Como está a vontade agora?
          </p>
        ) : (
          <p className="mt-2 text-sm text-ardosia-suave">Pode deixar a tela aberta e fazer outra coisa.</p>
        )}
      </div>
    </div>
  );
}

function Surfar({ passos }: { passos: string[] }) {
  const [antes, setAntes] = useState(7);
  const [depois, setDepois] = useState<number | null>(null);
  return (
    <div className="space-y-4">
      <Escala legenda="Vontade agora" valor={antes} aoMudar={setAntes} extremos={["Nenhuma", "Muito forte"]} />
      <ol className="list-decimal space-y-1 pl-5">
        {passos.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ol>
      {depois === null ? (
        <button type="button" className="botao-linha w-full" onClick={() => setDepois(antes)}>
          Já observei por alguns minutos
        </button>
      ) : (
        <>
          <Escala legenda="Vontade depois" valor={depois} aoMudar={setDepois} extremos={["Nenhuma", "Muito forte"]} />
          <p className="font-bold" role="status">
            {depois < antes
              ? `A onda baixou ${antes - depois} ponto${antes - depois > 1 ? "s" : ""}. Ela passa.`
              : "Às vezes a onda demora mais. Tente adiar 15 minutos ou falar com alguém."}
          </p>
        </>
      )}
    </div>
  );
}

function Lista({ itens }: { itens: string[] }) {
  const [marcado, setMarcado] = useState<string | null>(null);
  return (
    <div className="space-y-2" role="radiogroup">
      {itens.map((i) => (
        <button key={i} type="button" role="radio" aria-checked={marcado === i} className="opcao" onClick={() => setMarcado(i)}>
          {i}
        </button>
      ))}
    </div>
  );
}

function Cartas({ cartas }: { cartas: { pensamento: string; resposta: string }[] }) {
  const [viradas, setViradas] = useState<number[]>([]);
  return (
    <div className="space-y-3">
      {cartas.map((c, i) => {
        const virada = viradas.includes(i);
        return (
          <button
            key={c.pensamento}
            type="button"
            onClick={() => setViradas((v) => (virada ? v.filter((x) => x !== i) : [...v, i]))}
            aria-expanded={virada}
            className={`w-full rounded-2xl p-4 text-left transition-colors ${virada ? "bg-sol-claro" : "bg-ceu"}`}
          >
            <p className="font-titulo text-lg font-bold">“{c.pensamento}”</p>
            {virada ? <p className="mt-2">{c.resposta}</p> : <p className="mt-1 text-sm text-ardosia-suave">Toque para ver outra forma de pensar</p>}
          </button>
        );
      })}
    </div>
  );
}

function Anotacao({ id, pergunta }: { id: string; pergunta: string }) {
  const { estado, atualizar } = useEstado();
  return (
    <div>
      <label className="rotulo" htmlFor={`nota-${id}`}>
        {pergunta}
      </label>
      <textarea
        id={`nota-${id}`}
        rows={5}
        className="campo"
        value={estado?.anotacoes[id] ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          atualizar((s) => ({ ...s, anotacoes: { ...s.anotacoes, [id]: v } }));
        }}
      />
      <p className="mt-1 text-sm text-ardosia-suave">Só você vê o que escreve aqui.</p>
    </div>
  );
}

function Calculadora() {
  const { estado, atualizar } = useEstado();
  if (!estado) return null;
  const { perdaMensal, rendaMensal } = estado.perfil;
  const ano = perdaMensal * 12;
  const pct = rendaMensal ? Math.round((perdaMensal / rendaMensal) * 100) : null;
  const set = (campo: "perdaMensal" | "rendaMensal", v: number) =>
    atualizar((e) => ({ ...e, perfil: { ...e.perfil, [campo]: v } }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="rotulo" htmlFor="calc-perda">
            Perdi por mês, mais ou menos
          </label>
          <input id="calc-perda" inputMode="numeric" className="campo" value={perdaMensal || ""} onChange={(e) => set("perdaMensal", Number(e.target.value.replace(/\D/g, "")))} placeholder="R$" />
        </div>
        <div>
          <label className="rotulo" htmlFor="calc-renda">
            Minha renda por mês
          </label>
          <input id="calc-renda" inputMode="numeric" className="campo" value={rendaMensal || ""} onChange={(e) => set("rendaMensal", Number(e.target.value.replace(/\D/g, "")))} placeholder="R$" />
        </div>
      </div>
      {perdaMensal > 0 && (
        <div className="rounded-2xl bg-ceu p-4" role="status">
          <p>
            Em um ano, isso dá <strong className="font-titulo text-2xl">{reais(ano)}</strong>.
          </p>
          {pct !== null && (
            <p className="mt-1">
              São <strong>{pct}%</strong> da sua renda indo embora todo mês.
            </p>
          )}
          <p className="mt-1">Por dia, cerca de {reais(perdaMensal / 30)}.</p>
          <p className="mt-2 text-sm text-ardosia-suave">É uma conta aproximada, feita só com os números que você digitou.</p>
        </div>
      )}
    </div>
  );
}

function Ligar() {
  const { estado } = useEstado();
  const pessoa = estado?.trava.pessoaConfianca;
  return (
    <div className="space-y-3">
      {pessoa ? (
        <p>
          Sua pessoa de confiança: <strong>{pessoa}</strong>
        </p>
      ) : (
        <p className="text-ardosia-suave">
          Você ainda não escolheu uma pessoa de confiança. Dá para fazer isso em{" "}
          <Link className="font-bold text-mare-escura underline" href="/app/combinado">
            Meu combinado
          </Link>
          .
        </p>
      )}
      <a href="tel:188" className="botao-linha w-full">
        Conversar com o CVV, ligando 188
      </a>
      <p className="text-sm text-ardosia-suave">O CVV atende de graça, 24 horas, e não precisa ser uma emergência.</p>
    </div>
  );
}

function ProximoPasso() {
  const { estado } = useEstado();
  if (!estado) return null;
  const proxima = ordenarDividas(estado.dividas, estado.estrategia)[0];
  return (
    <div className="space-y-3">
      {proxima ? (
        <div className="rounded-2xl bg-ceu p-4">
          <p className="text-sm text-ardosia-suave">Primeira da fila</p>
          <p className="font-titulo text-xl font-bold">{proxima.credor}</p>
          <p>Faltam {reais(restante(proxima))}.</p>
          {proxima.categoria === "risco" && (
            <p className="mt-2 font-bold text-telha">Dívida com agiota ou com ameaça: veja os contatos de segurança em Apoio.</p>
          )}
        </div>
      ) : (
        <p>Você ainda não colocou suas dívidas no papel. Leva poucos minutos e mostra o caminho.</p>
      )}
      <Link href="/app/dividas" className="botao-linha w-full">
        Abrir o painel Desenrola
      </Link>
    </div>
  );
}
