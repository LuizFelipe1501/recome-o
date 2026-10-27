"use client";

import { useState } from "react";
import { Celebracao, useCelebracao } from "@/components/Pontos";
import { Barra, Base, Ouvir } from "@/components/ui";
import { useEstado } from "@/lib/estado";
import { comprometimentoRenda, hoje, novoId, ordenarDividas, progressoDividas, reais, restante } from "@/lib/calculos";
import { pontosHabito } from "@/lib/missoes";
import type { CategoriaDivida, Divida } from "@/lib/tipos";

const tipos: { nome: string; categoria: CategoriaDivida }[] = [
  { nome: "Conta da casa (aluguel, luz, água)", categoria: "sobrevivencia" },
  { nome: "Cartão de crédito", categoria: "cara" },
  { nome: "Cheque especial", categoria: "cara" },
  { nome: "Empréstimo ou financiamento", categoria: "cara" },
  { nome: "Agiota", categoria: "risco" },
  { nome: "Família ou amigos", categoria: "outra" },
  { nome: "Outra", categoria: "outra" },
];

const nomeCategoria: Record<CategoriaDivida, string> = {
  risco: "Risco à segurança",
  sobrevivencia: "Manter a casa",
  cara: "Juros altos",
  outra: "Outras",
};

const numero = (v: string) => Number(v.replace(/[^\d,]/g, "").replace(",", ".")) || 0;

export default function Dividas() {
  const { estado, atualizar } = useEstado();
  const [mostrarForm, setMostrarForm] = useState(false);
  const { festa, celebrar } = useCelebracao();
  if (!estado) return null;

  const ativas = ordenarDividas(estado.dividas, estado.estrategia);
  const quitadas = estado.dividas.filter((d) => d.valorTotal > 0 && restante(d) === 0);
  const totalDevido = estado.dividas.reduce((s, d) => s + restante(d), 0);
  const pct = progressoDividas(estado.dividas);
  const comprometido = comprometimentoRenda(estado);

  const pagar = (d: Divida, valor: number) => {
    const quita = d.pago + valor >= d.valorTotal;
    atualizar((e) => ({
      ...e,
      dividas: e.dividas.map((x) => (x.id === d.id ? { ...x, pago: Math.min(x.valorTotal, x.pago + valor) } : x)),
      pagamentos: [...e.pagamentos, { id: novoId(), dividaId: d.id, valor, data: hoje() }],
    }));
    celebrar(quita ? `${d.credor} quitada! +${pontosHabito.pagamento}` : `+${pontosHabito.pagamento} pontos`);
  };

  return (
    <div className="relative space-y-8 pt-2">
      <Celebracao festa={festa} />

      <section className="relative overflow-hidden rounded-[1.75rem] bg-coral p-6 text-white">
        <svg className="pointer-events-none absolute -right-8 -top-8 h-40 w-40" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="42" fill="var(--sol)" />
        </svg>
        <svg className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="42" fill="var(--mare)" opacity="0.9" />
        </svg>
        <div className="relative">
          <p className="font-bold text-white/90">Desenrola</p>
          <h1 className="mt-1 text-[2rem] font-extrabold leading-[1.05]">Desenrolando sua vida com você</h1>
          <p className="mt-3 max-w-sm">
            Cada pagamento é uma missão. Colocar no papel tira o peso da cabeça, e aqui ninguém julga.
          </p>
          {estado.dividas.length > 0 && (
            <div className="mt-5 flex items-center gap-4">
              <Anel pct={pct} />
              <div>
                <p className="text-sm font-bold text-white/90">Ainda falta</p>
                <p className="font-titulo text-3xl font-extrabold">{reais(totalDevido)}</p>
                <p className="text-sm font-bold">
                  {estado.pagamentos.length} {estado.pagamentos.length === 1 ? "missão cumprida" : "missões cumpridas"}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="text-lg font-bold">Uma linha do Desenrola só para quem saiu das bets</h2>
        <p className="mt-1">
          Esta é a nossa proposta: renegociação com desconto para dívidas ligadas a apostas, acompanhada de perto. Quem entra
          assume missões de pagamento que cabem no mês e recebe apoio emocional no mesmo app, porque renegociar sem apoio deixa a
          porta aberta para a recaída.
        </p>
        <p className="mt-2 text-sm text-ardosia-suave">Protótipo: os valores são os que você digita, e não há ligação com nenhum banco.</p>
      </section>

      {comprometido !== null && estado.dividas.length > 0 && (
        <p className={`rounded-2xl p-4 ${comprometido > 30 ? "bg-coral-claro" : "bg-menta-claro"}`}>
          As parcelas de agora comem <strong>{comprometido}%</strong> da sua renda.
          {comprometido > 30 && " Acima de 30% costuma apertar o básico. A Lei do Superendividamento pode ajudar, veja mais abaixo."}
        </p>
      )}

      <section aria-labelledby="titulo-ordem">
        <div className="flex items-end justify-between gap-3">
          <h2 id="titulo-ordem" className="text-2xl font-extrabold">
            Missões de pagamento
          </h2>
          <button type="button" className="botao px-4 py-2 text-sm" onClick={() => setMostrarForm(!mostrarForm)} aria-expanded={mostrarForm}>
            {mostrarForm ? "Fechar" : "Adicionar dívida"}
          </button>
        </div>
        <p className="mt-1 text-ardosia-suave">
          Primeiro o que ameaça você ou a casa. Depois, a estratégia que você escolher. Cada parcela paga acende um quadradinho.
        </p>

        {mostrarForm && <NovaDivida aoSalvar={() => setMostrarForm(false)} />}

        <div className="mt-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Estratégia">
          <button type="button" role="radio" aria-checked={estado.estrategia === "menor"} className="opcao" onClick={() => atualizar((e) => ({ ...e, estrategia: "menor" }))}>
            <strong>Menor primeiro</strong>
            <span className="block text-sm text-ardosia-suave">Vitórias rápidas dão fôlego</span>
          </button>
          <button type="button" role="radio" aria-checked={estado.estrategia === "juros"} className="opcao" onClick={() => atualizar((e) => ({ ...e, estrategia: "juros" }))}>
            <strong>Maior juro primeiro</strong>
            <span className="block text-sm text-ardosia-suave">Sai mais barato no total</span>
          </button>
        </div>

        {estado.dividas.length === 0 && !mostrarForm && (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-nuvem p-5">
            <p className="font-bold">Nenhuma dívida anotada ainda.</p>
            <p className="mt-1">
              Comece pelas que você lembra. Para ver tudo o que está no seu CPF em bancos e financeiras, use o Registrato, que é
              gratuito.
            </p>
          </div>
        )}

        <ol className="mt-4 space-y-3">
          {ativas.map((d, i) => (
            <CartaoDivida key={d.id} d={d} posicao={i + 1} pagar={pagar} />
          ))}
        </ol>

        {quitadas.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold">Missões vencidas</h3>
            <ul className="mt-2 space-y-2">
              {quitadas.map((d) => (
                <li key={d.id} className="entrar-cartao flex items-center justify-between rounded-2xl bg-lima px-4 py-3 text-ardosia">
                  <span>
                    <strong>{d.credor}</strong> quitada
                  </span>
                  <span aria-hidden="true" className="font-titulo text-xl font-extrabold">✓</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <DesafioPoupanca aoGuardar={(v) => celebrar(`+${pontosHabito.deposito} pontos, ${reais(v)} guardados`)} />
      <DinheiroExtra />
      <Caminhos />
    </div>
  );
}

function Anel({ pct }: { pct: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg width="92" height="92" viewBox="0 0 92 92" role="img" aria-label={`${pct}% das dívidas quitado`} className="shrink-0">
      <circle cx="46" cy="46" r={r} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="10" />
      <circle
        cx="46"
        cy="46"
        r={r}
        fill="none"
        stroke="var(--lima)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        transform="rotate(-90 46 46)"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text x="46" y="52" textAnchor="middle" className="font-titulo" fontSize="20" fontWeight="800" fill="white">
        {pct}%
      </text>
    </svg>
  );
}

function NovaDivida({ aoSalvar }: { aoSalvar: () => void }) {
  const { atualizar } = useEstado();
  const [credor, setCredor] = useState("");
  const [tipo, setTipo] = useState(tipos[1].nome);
  const [valor, setValor] = useState("");
  const [juro, setJuro] = useState("");
  const [parcela, setParcela] = useState("");
  const categoria = tipos.find((t) => t.nome === tipo)?.categoria ?? "outra";

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    const nova: Divida = {
      id: novoId(),
      credor: credor.trim() || tipo,
      tipo,
      categoria,
      valorTotal: numero(valor),
      pago: 0,
      juroMes: numero(juro),
      parcela: numero(parcela),
    };
    if (!nova.valorTotal) return;
    atualizar((s) => ({ ...s, dividas: [...s.dividas, nova] }));
    aoSalvar();
  };

  return (
    <form onSubmit={salvar} className="bloco mt-4 space-y-4">
      <div>
        <label className="rotulo" htmlFor="tipo">
          Tipo
        </label>
        <select id="tipo" className="campo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {tipos.map((t) => (
            <option key={t.nome}>{t.nome}</option>
          ))}
        </select>
      </div>
      {categoria === "risco" && (
        <p className="rounded-2xl border-2 border-telha p-3 text-sm" role="note">
          Dívida com agiota pode envolver ameaça. Ela vai para o topo da lista. Se houver ameaça, procure a polícia (190) e a
          Defensoria Pública. Não aceite novos empréstimos para pagar essa dívida.
        </p>
      )}
      {tipo === "Família ou amigos" && (
        <p className="rounded-2xl bg-ceu p-3 text-sm" role="note">
          Dívida com quem você ama pesa diferente. Combinar um valor pequeno por mês, mesmo simbólico, ajuda a reconstruir a
          confiança.
        </p>
      )}
      <div>
        <label className="rotulo" htmlFor="credor">
          Com quem
        </label>
        <input id="credor" className="campo" value={credor} onChange={(e) => setCredor(e.target.value)} placeholder="Ex.: cartão do banco, tia Lúcia" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="rotulo" htmlFor="valor">
            Quanto deve
          </label>
          <input id="valor" inputMode="decimal" required className="campo" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="R$" />
        </div>
        <div>
          <label className="rotulo" htmlFor="parcela">
            Parcela por mês
          </label>
          <input id="parcela" inputMode="decimal" className="campo" value={parcela} onChange={(e) => setParcela(e.target.value)} placeholder="R$" />
        </div>
      </div>
      <div>
        <label className="rotulo" htmlFor="juro">
          Juros ao mês, se souber
        </label>
        <input id="juro" inputMode="decimal" className="campo" value={juro} onChange={(e) => setJuro(e.target.value)} placeholder="%" />
        <p className="mt-1 text-sm text-ardosia-suave">Está no extrato ou na fatura como CET ou taxa mensal.</p>
      </div>
      <button type="submit" className="botao w-full">
        Salvar dívida
      </button>
    </form>
  );
}

function CartaoDivida({ d, posicao, pagar }: { d: Divida; posicao: number; pagar: (d: Divida, valor: number) => void }) {
  const { atualizar } = useEstado();
  const [pagamento, setPagamento] = useState(d.parcela ? String(d.parcela) : "");
  const [pulso, setPulso] = useState(0);
  const pct = d.valorTotal ? (d.pago / d.valorTotal) * 100 : 0;
  const primeira = posicao === 1;
  const totalParcelas = d.parcela ? Math.min(24, Math.ceil(d.valorTotal / d.parcela)) : 0;
  const parcelasPagas = d.parcela ? Math.min(totalParcelas, Math.floor(d.pago / d.parcela)) : 0;
  const cor = d.categoria === "risco" ? "var(--telha)" : d.categoria === "sobrevivencia" ? "var(--menta)" : d.categoria === "cara" ? "var(--coral)" : "var(--mare)";

  return (
    <li key={pulso} className={`entrar-cartao overflow-hidden rounded-2xl bg-white ${pulso ? "pulsar" : ""} ${primeira ? "ring-2 ring-mare" : ""}`} style={{ animationDelay: pulso ? "0ms" : `${posicao * 60}ms` }}>
      <div className="h-2" style={{ background: cor }} aria-hidden="true" />
      <div className="flex items-start gap-3 p-4">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-titulo font-extrabold ${primeira ? "bg-mare text-white" : "bg-ceu"}`} aria-hidden="true">
          {posicao}
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: d.categoria === "outra" ? "var(--mare-escura)" : undefined }}>
            {nomeCategoria[d.categoria]}
            {d.juroMes ? `, ${d.juroMes}% ao mês` : ""}
          </p>
          <h3 className="text-lg font-bold">{d.credor}</h3>
          <p>
            Faltam <strong>{reais(restante(d))}</strong> de {reais(d.valorTotal)}
          </p>
          {totalParcelas > 0 ? (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1.5" role="img" aria-label={`${parcelasPagas} de ${totalParcelas} parcelas pagas`}>
                {Array.from({ length: totalParcelas }).map((_, i) => (
                  <span
                    key={i}
                    className="h-5 w-5 rounded-md transition-colors duration-500"
                    style={{ background: i < parcelasPagas ? cor : "var(--ceu)", transitionDelay: `${i * 30}ms` }}
                  />
                ))}
              </div>
              <p className="mt-1 text-sm text-ardosia-suave">
                {parcelasPagas} de {totalParcelas} missões de {reais(d.parcela)}
              </p>
            </div>
          ) : (
            <div className="mt-2">
              <Barra valor={pct} rotulo={`Quanto já foi pago de ${d.credor}`} cor={cor} />
            </div>
          )}
          {primeira && <p className="mt-2 text-sm font-bold text-mare-escura">É a missão de agora. Concentre aqui o que sobrar no mês.</p>}
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const v = numero(pagamento);
              if (!v) return;
              pagar(d, v);
              setPulso(Date.now());
            }}
          >
            <label htmlFor={`pg-${d.id}`} className="sr-only">
              Valor pago para {d.credor}
            </label>
            <input id={`pg-${d.id}`} inputMode="decimal" className="campo" placeholder="Paguei R$" value={pagamento} onChange={(e) => setPagamento(e.target.value)} />
            <button type="submit" className="botao shrink-0 px-4">
              Registrar
            </button>
          </form>
          <button
            type="button"
            className="mt-2 text-sm text-ardosia-suave underline"
            onClick={() => atualizar((e) => ({ ...e, dividas: e.dividas.filter((x) => x.id !== d.id) }))}
          >
            Remover da lista
          </button>
        </div>
      </div>
    </li>
  );
}

function DinheiroExtra() {
  const { estado, atualizar } = useEstado();
  const [origem, setOrigem] = useState("13º salário");
  const [valor, setValor] = useState("");
  const [destino, setDestino] = useState("");
  if (!estado) return null;
  const opcoesDestino = [...ordenarDividas(estado.dividas, estado.estrategia).map((d) => d.credor), "Reserva"];

  return (
    <section className="bloco" aria-labelledby="titulo-extra">
      <h2 id="titulo-extra" className="text-xl font-bold">
        Dinheiro que vai entrar
      </h2>
      <p className="mt-1">
        Dinheiro na mão de repente é um dos momentos de maior risco. Decida agora, com a cabeça fria, para onde vai o 13º, a
        restituição ou um acerto.
      </p>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const v = numero(valor);
          if (!v || !destino) return;
          atualizar((s) => ({ ...s, dinheiroExtra: [...s.dinheiroExtra, { id: novoId(), origem, valor: v, destino, data: hoje() }] }));
          setValor("");
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="rotulo" htmlFor="origem">
              De onde
            </label>
            <select id="origem" className="campo" value={origem} onChange={(e) => setOrigem(e.target.value)}>
              <option>13º salário</option>
              <option>Restituição do imposto</option>
              <option>Acerto ou rescisão</option>
              <option>Trabalho extra</option>
              <option>Outro</option>
            </select>
          </div>
          <div>
            <label className="rotulo" htmlFor="valor-extra">
              Valor
            </label>
            <input id="valor-extra" inputMode="decimal" className="campo" placeholder="R$" value={valor} onChange={(e) => setValor(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="rotulo" htmlFor="destino">
            Vai para
          </label>
          <select id="destino" className="campo" value={destino} onChange={(e) => setDestino(e.target.value)}>
            <option value="">Escolha</option>
            {opcoesDestino.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="botao-linha w-full">
          Guardar decisão
        </button>
      </form>
      {estado.dinheiroExtra.length > 0 && (
        <ul className="mt-4 space-y-2">
          {estado.dinheiroExtra.map((x) => (
            <li key={x.id} className="rounded-xl bg-ceu px-3 py-2">
              {x.origem}: {reais(x.valor)} para <strong>{x.destino}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const objetivosSugeridos = ["Reserva para o próximo aperto", "Geladeira nova", "Material escolar", "Uma viagem em família", "Curso"];

function DesafioPoupanca({ aoGuardar }: { aoGuardar: (v: number) => void }) {
  const { estado, atualizar } = useEstado();
  const [valor, setValor] = useState("");
  if (!estado) return null;
  const r = estado.reserva;
  const pct = r.meta ? Math.min(100, (r.guardado / r.meta) * 100) : 0;
  const faltam = Math.max(0, r.meta - r.guardado);
  const meses = r.porMes > 0 ? Math.ceil(faltam / r.porMes) : null;
  const marcos = [25, 50, 75, 100];
  const set = (parcial: Partial<typeof r>) => atualizar((e) => ({ ...e, reserva: { ...e.reserva, ...parcial } }));

  return (
    <section className="overflow-hidden rounded-[1.75rem] bg-menta-claro p-5" aria-labelledby="titulo-desafio">
      <p className="font-bold text-ardosia-suave">Desafio de poupança</p>
      <h2 id="titulo-desafio" className="text-2xl font-extrabold">
        {r.objetivo || "Meu objetivo"}
      </h2>

      <div className="mt-4 flex items-end gap-5">
        <Pote pct={pct} />
        <div className="flex-1">
          <p className="font-titulo text-4xl font-extrabold">{reais(r.guardado)}</p>
          <p className="font-bold">de {reais(r.meta)}</p>
          {pct >= 100 ? (
            <p className="mt-2 font-bold">Objetivo alcançado. Que tal uma meta maior?</p>
          ) : (
            meses !== null && (
              <p className="mt-2 text-sm">
                Guardando {reais(r.porMes)} por mês, você chega lá em {meses} {meses === 1 ? "mês" : "meses"}.
              </p>
            )
          )}
          <ul className="mt-3 flex gap-1.5" aria-label="Marcos do desafio">
            {marcos.map((m) => (
              <li
                key={m}
                className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${pct >= m ? "bg-menta text-ardosia" : "bg-white text-ardosia-suave"}`}
              >
                {m}%<span className="sr-only">{pct >= m ? " alcançado" : ""}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <form
        className="mt-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const v = numero(valor);
          if (!v) return;
          atualizar((s) => ({
            ...s,
            reserva: { ...s.reserva, guardado: s.reserva.guardado + v, depositos: [...s.reserva.depositos, { valor: v, data: hoje() }] },
          }));
          aoGuardar(v);
          setValor("");
        }}
      >
        <label htmlFor="guardar" className="sr-only">
          Valor guardado
        </label>
        <input id="guardar" inputMode="decimal" className="campo" placeholder="Guardei R$" value={valor} onChange={(e) => setValor(e.target.value)} />
        <button type="submit" className="botao shrink-0 bg-ardosia px-4 hover:bg-ardosia">
          Guardar
        </button>
      </form>

      <details className="mt-4">
        <summary className="cursor-pointer font-bold">Mudar objetivo, meta e valor por mês</summary>
        <div className="mt-3 space-y-3">
          <div>
            <label className="rotulo" htmlFor="objetivo">
              Objetivo
            </label>
            <input id="objetivo" list="objetivos" className="campo" value={r.objetivo} onChange={(e) => set({ objetivo: e.target.value })} />
            <datalist id="objetivos">
              {objetivosSugeridos.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="rotulo" htmlFor="meta">
                Meta
              </label>
              <input id="meta" inputMode="numeric" className="campo" value={r.meta || ""} onChange={(e) => set({ meta: numero(e.target.value) })} placeholder="R$" />
            </div>
            <div>
              <label className="rotulo" htmlFor="pormes">
                Por mês
              </label>
              <input id="pormes" inputMode="numeric" className="campo" value={r.porMes || ""} onChange={(e) => set({ porMes: numero(e.target.value) })} placeholder="R$" />
            </div>
          </div>
        </div>
      </details>

      <p className="mt-4 text-sm">
        Depois da reserva pronta, o próximo passo é investir num lugar seguro, como o Tesouro Selic ou um CDB com garantia do FGC.
        Investir não tem nada a ver com apostar: o dinheiro rende devagar e não some.
      </p>
      <Base>Ter o hábito de poupar aparece como fator de proteção contra o jogo problemático no estudo Who Bets Online (2026).</Base>
    </section>
  );
}

// Pote que enche conforme o objetivo avança, com uma onda suave na superfície.
function Pote({ pct }: { pct: number }) {
  const altura = 110;
  const nivel = altura - (pct / 100) * (altura - 14);
  return (
    <svg width="96" height="130" viewBox="0 0 96 130" role="img" aria-label={`Pote ${Math.round(pct)}% cheio`} className="shrink-0">
      <defs>
        <clipPath id="dentro-pote">
          <path d="M14 26h68v86a12 12 0 0 1-12 12H26a12 12 0 0 1-12-12V26Z" />
        </clipPath>
      </defs>
      <rect x="22" y="8" width="52" height="14" rx="5" fill="var(--ardosia)" />
      <path d="M14 26h68v86a12 12 0 0 1-12 12H26a12 12 0 0 1-12-12V26Z" fill="white" />
      <g clipPath="url(#dentro-pote)">
        <g style={{ transform: `translateY(${nivel}px)`, transition: "transform 1.2s cubic-bezier(.2,.8,.2,1)" }}>
          <g className="onda">
            <path d="M0 6 Q12 0 24 6 T48 6 T72 6 T96 6 T120 6 T144 6 T168 6 T192 6 V140 H0 Z" fill="var(--menta)" />
          </g>
        </g>
        {[0.25, 0.5, 0.75].map((m) => (
          <line key={m} x1="14" x2="26" y1={altura - m * (altura - 14)} y2={altura - m * (altura - 14)} stroke="var(--ardosia)" strokeOpacity="0.25" strokeWidth="2" />
        ))}
      </g>
      <path d="M14 26h68v86a12 12 0 0 1-12 12H26a12 12 0 0 1-12-12V26Z" fill="none" stroke="var(--ardosia)" strokeWidth="4" />
    </svg>
  );
}

function Caminhos() {
  const { estado } = useEstado();
  const [desconto, setDesconto] = useState(40);
  const [copiado, setCopiado] = useState(false);
  if (!estado) return null;

  const total = estado.dividas.reduce((s, d) => s + restante(d), 0) || 5000;
  const exemplo = !estado.dividas.length;

  const resumo = [
    `Resumo das minhas dívidas (${new Date().toLocaleDateString("pt-BR")})`,
    `Renda mensal: ${estado.perfil.rendaMensal ? reais(estado.perfil.rendaMensal) : "não informada"}`,
    ...estado.dividas
      .filter((d) => restante(d) > 0)
      .map((d) => `- ${d.credor} (${d.tipo}): falta ${reais(restante(d))}, parcela ${reais(d.parcela)}${d.juroMes ? `, juros ${d.juroMes}% ao mês` : ""}`),
    `Total: ${reais(estado.dividas.reduce((s, d) => s + restante(d), 0))}`,
    "Quero o atendimento de superendividamento para renegociar preservando o mínimo para viver.",
  ].join("\n");

  return (
    <section aria-labelledby="titulo-caminhos" className="space-y-4">
      <h2 id="titulo-caminhos" className="text-2xl font-extrabold">
        Caminhos oficiais
      </h2>

      <div className="bloco">
        <h3 className="text-lg font-bold">Lei do Superendividamento</h3>
        <p className="mt-1">
          Quando as dívidas passam do que dá para pagar, você pode pedir ao Procon ou à Defensoria Pública uma renegociação de
          todas de uma vez, num plano que preserva o mínimo para viver. Leve um resumo da sua situação.
        </p>
        <button
          type="button"
          className="botao-linha mt-3 w-full"
          disabled={!estado.dividas.length}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(resumo);
              setCopiado(true);
            } catch {
              setCopiado(false);
            }
          }}
        >
          {copiado ? "Resumo copiado" : "Copiar resumo para levar"}
        </button>
        {!estado.dividas.length && <p className="mt-2 text-sm text-ardosia-suave">Adicione suas dívidas para montar o resumo.</p>}
      </div>

      <div className="bloco">
        <h3 className="text-lg font-bold">Simular um desconto</h3>
        <p className="mt-1">
          Feirões e programas de renegociação, como o Desenrola, costumam oferecer desconto para pagar à vista ou parcelado.
          Veja o efeito de um desconto no total.
        </p>
        <label className="rotulo mt-3" htmlFor="desconto">
          Desconto oferecido: {desconto}%
        </label>
        <input id="desconto" type="range" min={0} max={90} step={5} value={desconto} onChange={(e) => setDesconto(Number(e.target.value))} className="w-full accent-[var(--mare)]" />
        <p className="mt-2">
          {reais(total)} viraria <strong className="font-titulo text-2xl">{reais(total * (1 - desconto / 100))}</strong>
        </p>
        <p className="mt-1 text-sm text-ardosia-suave">
          {exemplo ? "Usando um valor de exemplo de R$ 5.000. " : ""}Simulação ilustrativa. Confira condições reais só em canais
          oficiais do credor ou do governo.
        </p>
      </div>

      <div className="bloco">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold">Conversa com o credor</h3>
          <Ouvir texto="Peça o valor total atualizado e o desconto para pagamento à vista. Proponha uma parcela que caiba no mês, mesmo que pequena. Não aceite parcela que deixe faltar comida ou contas da casa. Peça tudo por escrito e guarde o comprovante." />
        </div>
        <ul className="mt-2 space-y-2">
          <li>Peça o valor total atualizado e o desconto para pagar à vista.</li>
          <li>Proponha uma parcela que caiba no mês, mesmo que pequena.</li>
          <li>Não aceite parcela que deixe faltar comida ou as contas da casa.</li>
          <li>Peça o acordo por escrito e guarde os comprovantes.</li>
        </ul>
      </div>

      <div className="rounded-2xl border-2 border-telha bg-white p-5">
        <h3 className="text-lg font-bold text-telha">Cuidado com golpes</h3>
        <p className="mt-1">
          Quem está apertado vira alvo. Desconfie de quem cobra para limpar o nome, de empréstimo fácil por mensagem e de links
          de renegociação que chegam pelo WhatsApp. Use só o site ou o app oficial do credor, o consumidor.gov.br, o Procon e o
          gov.br.
        </p>
      </div>
    </section>
  );
}
