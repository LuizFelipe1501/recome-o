"use client";

import { useState } from "react";
import { BarraVida, Chefao, corChefao, nomeChefao, textoChefao } from "@/components/Chefao";
import { useRecompensa } from "@/components/Jogo";
import { Mascote } from "@/components/Mascote";
import { Base, Ouvir } from "@/components/ui";
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
  const recompensar = useRecompensa();
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
    recompensar(
      quita
        ? { pontos: pontosHabito.pagamento, titulo: `${d.credor}: chefão derrotado!`, texto: "Dívida quitada. O dinheiro dessa parcela agora vai para o próximo." }
        : { pontos: pontosHabito.pagamento, titulo: "Golpe certeiro", texto: `${reais(valor)} a menos em ${d.credor}. Faltam ${reais(Math.max(0, restante(d) - valor))}.` },
    );
  };

  return (
    <div className="space-y-6 pt-4">
      <section className="overflow-hidden rounded-[1.75rem] border-[3px] border-ardosia bg-ardosia text-white shadow-[0_6px_0_#000]">
        <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
          <div>
            <p className="pixel text-xs text-sol">DESENROLA</p>
            <h1 className="mt-1 text-[1.9rem] font-extrabold leading-[1.05] sm:text-4xl">Desenrolando sua vida com você</h1>
            <p className="mt-2 max-w-md text-white/90">Cada dívida é um chefão. Cada pagamento tira vida dele. Aqui ninguém julga.</p>
          </div>
          {estado.dividas.length > 0 && (
            <div className="flex items-center gap-4 rounded-2xl border-[3px] border-white/30 bg-white/10 p-3">
              <Anel pct={pct} />
              <div>
                <p className="pixel text-[0.65rem] text-white/80">AINDA FALTA</p>
                <p className="font-titulo text-2xl font-extrabold">{reais(totalDevido)}</p>
                <p className="text-sm font-bold">
                  {quitadas.length} de {estado.dividas.length} chefões derrotados
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-end justify-between gap-2 border-t-[3px] border-ardosia bg-sol px-5 pt-2 text-ardosia">
          <Mascote tamanho={56} humor="feliz" />
          <p className="flex-1 pb-3 text-sm font-bold">
            {ativas.length ? `Próximo alvo: ${ativas[0].credor}. Bora juntos!` : "Coloque as dívidas no papel e a gente monta o plano de ataque."}
          </p>
          <div className="flex gap-1 pb-2">
            {ativas.slice(0, 3).map((d) => (
              <Chefao key={d.id} categoria={d.categoria} tamanho={40} />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border-[3px] border-ardosia bg-white p-5">
        <h2 className="text-lg font-bold">Desenrola 3.0 com acompanhamento</h2>
        <p className="mt-1">
          O Desenrola 3.0, previsto para novembro, vai renegociar dívidas atrasadas de milhões de famílias, muitas delas
          endividadas por apostas. Renegociar sem apoio deixa a porta aberta para a recaída.
        </p>
        <p className="mt-2">
          Esta é a nossa proposta: quem renegocia uma dívida ligada a aposta assume missões de pagamento que cabem no mês e recebe
          apoio emocional no mesmo app, junto com a família se quiser.
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
            Chefões para derrotar
          </h2>
          <button type="button" className="botao-jogo botao-jogo-azul shrink-0 px-4 py-2 text-sm" onClick={() => setMostrarForm(!mostrarForm)} aria-expanded={mostrarForm}>
            {mostrarForm ? "Fechar" : "Adicionar dívida"}
          </button>
        </div>
        <p className="mt-1 text-ardosia-suave">
          Primeiro o que ameaça você ou a casa. Depois, a estratégia que você escolher. Cada pagamento registrado tira vida do chefão.
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

        <ol className="mt-4 grid gap-4 lg:grid-cols-2">
          {ativas.map((d, i) => (
            <CartaoDivida key={d.id} d={d} posicao={i + 1} pagar={pagar} />
          ))}
        </ol>

        {quitadas.length > 0 && (
          <div className="mt-6 rounded-2xl border-[3px] border-ardosia bg-sol p-4">
            <h3 className="pixel text-sm">ESTANTE DE TROFÉUS</h3>
            <ul className="mt-3 flex flex-wrap gap-3">
              {quitadas.map((d) => (
                <li key={d.id} className="entrar-cartao flex flex-col items-center rounded-xl border-[3px] border-ardosia bg-white px-3 py-2 text-center">
                  <Chefao categoria={d.categoria} tamanho={44} derrotado />
                  <span className="mt-1 max-w-[7rem] text-sm font-bold leading-tight">{d.credor}</span>
                  <span className="pixel text-[0.6rem] text-menta">QUITADA</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <DesafioPoupanca aoGuardar={(v) => recompensar({ pontos: pontosHabito.deposito, titulo: "Tijolo na casinha", texto: `${reais(v)} guardados. A casinha do Caramelo cresceu.` })} />
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
  const [golpe, setGolpe] = useState<{ id: number; valor: number } | null>(null);
  const primeira = posicao === 1;
  const cor = corChefao[d.categoria];
  const falta = restante(d);
  const parcelas = d.parcela ? Math.ceil(falta / d.parcela) : null;

  return (
    <li className={`entrar-cartao overflow-hidden rounded-[1.5rem] border-[3px] border-ardosia bg-white shadow-[0_5px_0_var(--ardosia)] ${primeira ? "ring-4 ring-sol" : ""}`} style={{ animationDelay: `${posicao * 60}ms` }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ background: cor, color: textoChefao[d.categoria] }}>
        <p className="pixel text-[0.65rem]">
          {primeira ? "ALVO ATUAL · " : `#${posicao} · `}
          {nomeChefao[d.categoria].toUpperCase()}
        </p>
        <p className="pixel text-[0.65rem]">{nomeCategoria[d.categoria].toUpperCase()}{d.juroMes ? ` · ${d.juroMes}%/MÊS` : ""}</p>
      </div>
      <div className="flex items-center gap-4 p-4">
        <div className="relative shrink-0">
          <Chefao key={golpe?.id} categoria={d.categoria} tamanho={76} className={golpe ? "dano" : "mascote-idle"} />
          {golpe && (
            <span key={golpe.id} className="pontos-subindo pixel absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border-2 border-ardosia bg-white px-1.5 text-xs text-telha">
              -{reais(golpe.valor)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-extrabold">{d.credor}</h3>
          <BarraVida restante={falta} total={d.valorTotal} cor={cor} />
          <p className="pixel mt-1 text-[0.65rem] text-ardosia-suave">
            VIDA {reais(falta)} / {reais(d.valorTotal)}
          </p>
          {parcelas !== null && <p className="text-sm">Faltam {parcelas} {parcelas === 1 ? "golpe" : "golpes"} de {reais(d.parcela)}</p>}
        </div>
      </div>
      {primeira && <p className="mx-4 -mt-1 mb-2 rounded-lg bg-sol-claro px-3 py-1.5 text-sm font-bold">É o alvo de agora. Concentre aqui o que sobrar no mês.</p>}
      <form
        className="flex gap-2 border-t-[3px] border-ardosia bg-ceu-fundo p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const v = numero(pagamento);
          if (!v) return;
          pagar(d, v);
          setGolpe({ id: Date.now(), valor: v });
        }}
      >
        <label htmlFor={`pg-${d.id}`} className="sr-only">
          Valor pago para {d.credor}
        </label>
        <input id={`pg-${d.id}`} inputMode="decimal" className="campo" placeholder="Paguei R$" value={pagamento} onChange={(e) => setPagamento(e.target.value)} />
        <button type="submit" className="botao-jogo shrink-0 px-4">
          Registrar
        </button>
      </form>
      <button
        type="button"
        className="mx-4 mb-3 mt-1 text-sm text-ardosia-suave underline"
        onClick={() => atualizar((e) => ({ ...e, dividas: e.dividas.filter((x) => x.id !== d.id) }))}
      >
        Remover da lista
      </button>
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
        restituição, um acerto ou o saldo de aposta que o banco devolveu depois da proibição.
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
              <option>Saldo de aposta devolvido</option>
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
        {origem === "Saldo de aposta devolvido" && (
          <p className="rounded-xl bg-sol-claro p-3 text-sm">
            Esse dinheiro já esteve na aposta. Mandar para uma dívida ou para a reserva fecha esse ciclo e tira o valor de perto da
            próxima vontade.
          </p>
        )}
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
    <section className="overflow-hidden rounded-[1.75rem] border-[3px] border-ardosia bg-menta-claro p-5 shadow-[0_5px_0_var(--ardosia)]" aria-labelledby="titulo-desafio">
      <p className="pixel text-xs text-ardosia-suave">DESAFIO DE POUPANÇA · A CASINHA DO CARAMELO</p>
      <h2 id="titulo-desafio" className="text-2xl font-extrabold">
        {r.objetivo || "Meu objetivo"}
      </h2>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <Casinha pct={pct} />
        <div className="min-w-[10rem] flex-1">
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
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Marcos do desafio">
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
        <button type="submit" className="botao-jogo botao-jogo-azul shrink-0 px-4">
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

// A casinha do Caramelo é construída em etapas conforme a reserva cresce:
// 25% fundação e paredes, 50% telhado, 75% porta e janela, 100% o Caramelo se muda.
function Casinha({ pct }: { pct: number }) {
  const etapa = pct >= 100 ? 4 : pct >= 75 ? 3 : pct >= 50 ? 2 : pct >= 25 ? 1 : 0;
  const r = (x: number, y: number, w: number, h: number, fill: string, k?: string) => <rect key={k ?? `${x}-${y}-${fill}`} x={x} y={y} width={w} height={h} fill={fill} />;
  const nomes = ["Terreno pronto", "Paredes de pé", "Telhado no lugar", "Porta e janela", "O Caramelo se mudou!"];
  return (
    <figure className="shrink-0 text-center">
      <svg width="116" height="106" viewBox="0 0 22 20" className="pixelado" role="img" aria-label={`Casinha: ${nomes[etapa]}, ${Math.round(pct)}% da meta`}>
        {r(0, 0, 22, 17, "#e7ebff")}
        {r(16, 2, 3, 3, "#fcfc30")}
        {r(0, 17, 22, 3, "#17b07a")}
        {r(2, 16, 18, 1, "#46557e")}
        {etapa >= 1 && (
          <g className="surgir">
            {r(4, 9, 14, 7, "#d9893b")}
            {r(4, 9, 14, 1, "#3b2414")}
            {r(4, 9, 1, 7, "#3b2414")}
            {r(17, 9, 1, 7, "#3b2414")}
            {r(5, 12, 12, 1, "#c27630")}
          </g>
        )}
        {etapa < 1 && (
          <g>
            {r(5, 14, 2, 2, "#c27630")}
            {r(8, 15, 2, 1, "#c27630")}
          </g>
        )}
        {etapa >= 2 && (
          <g className="surgir">
            {r(9, 4, 4, 1, "#2537c4")}
            {r(7, 5, 8, 1, "#2537c4")}
            {r(5, 6, 12, 1, "#3b53f0")}
            {r(3, 7, 16, 1, "#3b53f0")}
            {r(2, 8, 18, 1, "#2537c4")}
          </g>
        )}
        {etapa >= 3 && (
          <g className="surgir">
            {r(9, 11, 4, 5, "#3b2414")}
            {r(10, 12, 2, 4, "#0b1f4d")}
            {r(5, 10, 3, 3, "#fcfc30")}
            {r(14, 10, 3, 3, "#fcfc30")}
            {r(6, 10, 1, 3, "#3b2414")}
            {r(15, 10, 1, 3, "#3b2414")}
          </g>
        )}
        {etapa >= 4 && (
          <g className="surgir">
            {r(10, 13, 2, 2, "#d9893b")}
            {r(10, 13, 1, 1, "#1b1b1b")}
            {r(11, 14, 1, 1, "#f27e8e")}
            {r(19, 3, 1, 6, "#3b2414")}
            {r(20, 3, 2, 2, "#fcfc30")}
          </g>
        )}
      </svg>
      <figcaption className="pixel mt-1 text-[0.6rem]">{nomes[etapa].toUpperCase()}</figcaption>
    </figure>
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
