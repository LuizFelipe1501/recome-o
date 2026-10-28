"use client";

import { Base, Titulo } from "@/components/ui";
import { contatos, historias } from "@/lib/conteudo";
import { useEstado } from "@/lib/estado";

export default function Apoio() {
  const { estado } = useEstado();
  const familiar = estado?.perfil.papel === "familiar";
  const urgentes = contatos.filter((c) => c.urgente);
  const demais = contatos.filter((c) => !c.urgente);

  return (
    <div className="space-y-8 pt-2">
      <Titulo
        sub={
          familiar
            ? "Você também pode e deve buscar ajuda. Quase todos estes serviços atendem familiares."
            : "O NonBet é um apoio para usar junto com estes serviços, não no lugar deles. Programas com algum apoio humano funcionam melhor do que os feitos sozinho."
        }
      >
        Onde buscar ajuda
      </Titulo>

      <section className="space-y-3" aria-labelledby="titulo-urgente">
        <h2 id="titulo-urgente" className="text-xl font-bold">
          Agora, se for urgente
        </h2>
        {urgentes.map((c) => (
          <div key={c.nome} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-telha bg-white p-4">
            <div>
              <h3 className="font-bold">{c.nome}</h3>
              <p className="text-sm">{c.oQue}</p>
            </div>
            {c.acao && (
              <a href={c.acao.href} className="botao shrink-0 bg-telha px-4 hover:bg-telha">
                {c.acao.rotulo}
              </a>
            )}
          </div>
        ))}
      </section>

      <section className="space-y-3" aria-labelledby="titulo-rede">
        <h2 id="titulo-rede" className="text-xl font-bold">
          Tratamento e apoio gratuitos
        </h2>
        {demais.map((c) => (
          <div key={c.nome} className="bloco">
            <h3 className="text-lg font-bold">{c.nome}</h3>
            <p className="mt-1">{c.oQue}</p>
            <p className="mt-2 text-sm font-bold text-mare-escura">{c.como}</p>
            {c.acao && (
              <a href={c.acao.href} target={c.acao.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="botao-linha mt-3">
                {c.acao.rotulo}
              </a>
            )}
          </div>
        ))}
        <Base>
          Depois que a pessoa decide parar, a procura por terapia costuma dobrar. É a melhor hora para dar o primeiro passo no SUS.
          Programas com algum apoio humano tiveram efeito até três vezes maior que os feitos sozinhos (Sagoe e colegas, 2021).
        </Base>
      </section>

      <section aria-labelledby="titulo-historias">
        <h2 id="titulo-historias" className="text-xl font-bold">
          Histórias de quem passou por isso
        </h2>
        <p className="mt-1 text-sm text-ardosia-suave">
          Exemplos fictícios, escritos a partir de relatos comuns em pesquisas. Na versão final, viriam de pessoas reais que
          autorizarem.
        </p>
        <div className="mt-4 space-y-4">
          {historias.map((h) => (
            <blockquote key={h.nome} className="border-l-4 border-sol pl-4">
              <p className="font-titulo text-lg">“{h.texto}”</p>
              <footer className="mt-1 text-sm text-ardosia-suave">{h.nome}, história de exemplo</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </div>
  );
}
