"use client";

import Link from "next/link";
import { useState } from "react";
import { Atividade } from "@/components/Atividade";
import { MiniGrafico } from "@/components/ui";
import { BarraVida, Chefao, corChefao } from "@/components/Chefao";
import { Hud, useRecompensa } from "@/components/Jogo";
import { Fala, Mascote, type Humor } from "@/components/Mascote";
import { PainelFamiliar } from "@/components/PainelFamiliar";
import { FraseDoDia } from "@/components/FraseDoDia";
import { CartaoDuplaHoje } from "@/components/Dupla";
import { atividades, atividadesLivres } from "@/lib/conteudo";
import { estaDesmaiado, pontosHabito, proximaMissao } from "@/lib/missoes";
import { falaDoCaramelo } from "@/lib/falas";
import { Medalhas } from "@/components/Medalhas";
import { CartaoRotinaHoje } from "@/components/Rotina";
import { useEstado } from "@/lib/estado";
import { diasEntre, diasSemApostarNoMes, hoje, ordenarDividas, progressoDividas, reais, restante } from "@/lib/calculos";
import type { Checkin } from "@/lib/tipos";

export default function Hoje() {
  const { estado } = useEstado();
  if (!estado) return null;
  if (estado.perfil.papel === "familiar") return <PainelFamiliar />;
  return <HojeApostador />;
}

function HojeApostador() {
  const { estado, mensagens, usuarioId } = useEstado();
  const [aberta, setAberta] = useState<string | null>(null);
  if (!estado) return null;

  const dia = diasEntre(estado.perfil.inicio);
  const checkinHoje = estado.checkins.find((c) => c.data === hoje());
  const ultimos = [...estado.checkins].sort((a, b) => a.data.localeCompare(b.data)).slice(-14);
  const recebidas = mensagens.filter((m) => m.autor_id !== usuarioId);
  const ultimaMsg = recebidas[recebidas.length - 1];
  const ordemAtividades = [...estado.favoritas, ...atividadesLivres.filter((a) => !estado.favoritas.includes(a))];
  const prox = proximaMissao(estado);
  const atividadeHoje = ordemAtividades.find((id) => !(estado.atividadesFeitas[id] ?? []).some((d) => d.slice(0, 10) === hoje())) ?? ordemAtividades[0];
  const fezAtividadeHoje = Object.values(estado.atividadesFeitas).some((l) => l.some((d) => d.slice(0, 10) === hoje()));
  const { texto: fala, humor } = falaDoCaramelo(estado);
  const porque = estado.trava.motivo || estado.anotacoes["meu-porque"];

  return (
    <div className="space-y-6 pt-4">
      <Hud
        fala={
          <>
            {fala}
            {!checkinHoje && humor !== "desmaiado" && <span className="mt-1 block text-sm font-normal text-ardosia-suave">Dia {dia} da nossa caminhada. Bora fazer o check-in?</span>}
          </>
        }
        humor={humor}
      />

      <FraseDoDia />

      {porque && (
        <section className="flex items-center gap-3 rounded-2xl border-[3px] border-ardosia bg-white p-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-[3px] border-ardosia bg-coral-claro text-telha" aria-hidden="true">
            <IconePixel nome="coracao" />
          </span>
          <div className="min-w-0">
            <p className="pixel text-[0.6rem] text-ardosia-suave">LEMBRA POR QUE VOCÊ COMEÇOU</p>
            <p className="font-titulo text-lg font-bold leading-snug">“{porque}”</p>
          </div>
        </section>
      )}

      {ultimaMsg && (
        <section className="rounded-2xl border-[3px] border-ardosia bg-sol-claro p-4">
          <p className="pixel text-xs">MENSAGEM DE QUEM TORCE POR VOCÊ</p>
          <p className="mt-1 font-titulo text-lg">“{ultimaMsg.texto}”</p>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <CheckinJogo />

        <section aria-labelledby="titulo-dia" className="space-y-3">
          <h2 id="titulo-dia" className="text-2xl font-extrabold">
            Missões de hoje
          </h2>
          <MissaoDia feita={Boolean(checkinHoje)} titulo="Check-in do dia" texto="Um minuto para contar como foi." pontos={pontosHabito.checkin} cor="var(--mare)" href="#checkin" icone="sol" />
          <MissaoDia
            feita={fezAtividadeHoje}
            titulo={atividades[atividadeHoje]?.titulo ?? "Uma atividade curta"}
            texto={`${atividades[atividadeHoje]?.minutos ?? 3} minutos, fora da hora da vontade.`}
            pontos={pontosHabito.atividade}
            cor="var(--menta)"
            icone="raio"
            aoTocar={() => setAberta(atividadeHoje)}
          />
          {prox && (
            <MissaoDia
              feita={false}
              titulo={prox.titulo}
              texto="Próxima parada da sua trilha."
              pontos={prox.pontos}
              dobro={prox.compartilhavel}
              cor="var(--coral)"
              icone="bandeira"
              href="/app/trilha"
            />
          )}
        </section>
      </div>

      <CartaoRotinaHoje />

      <Medalhas />

      <CartaoDuplaHoje />

      <CartaoDesenrola />

      <section aria-labelledby="titulo-atividades">
        <h2 id="titulo-atividades" className="text-2xl font-extrabold">
          Caixa de ferramentas
        </h2>
        <p className="mt-1 text-ardosia-suave">Atividades curtas. Marque as que funcionam com a estrela para elas virem primeiro.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ordemAtividades.map((id) => {
            const a = atividades[id];
            if (!a) return null;
            const feitas = estado.atividadesFeitas[id]?.length ?? 0;
            return (
              <button
                key={id}
                type="button"
                aria-expanded={aberta === id}
                onClick={() => setAberta(aberta === id ? null : id)}
                className={`flex min-h-28 flex-col justify-between rounded-2xl border-[3px] border-ardosia p-3 text-left shadow-[0_5px_0_var(--ardosia)] transition-transform active:translate-y-1 ${
                  aberta === id ? "bg-sol" : "bg-white hover:-translate-y-0.5"
                }`}
              >
                <span className="font-bold leading-tight">
                  {estado.favoritas.includes(id) && <span aria-label="Favorita">★ </span>}
                  {a.titulo}
                </span>
                <span className="pixel mt-2 text-[0.65rem] text-ardosia-suave">
                  {a.minutos} MIN{feitas ? ` · ${feitas}X` : ""}
                </span>
              </button>
            );
          })}
        </div>
        {aberta && atividades[aberta] && (
          <div className="mt-4 rounded-2xl border-[3px] border-ardosia bg-white p-1">
            <Atividade id={aberta} />
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {ultimos.length >= 2 && (
          <section className="rounded-2xl border-[3px] border-ardosia bg-white p-5">
            <h2 className="text-xl font-bold">Sua vontade nos últimos dias</h2>
            <MiniGrafico pontos={ultimos.map((c) => ({ data: c.data, valor: c.vontade }))} rotulo="Nível de vontade de apostar em cada check-in, de 0 a 10" />
            <p className="text-sm">
              Quanto mais tempo longe das apostas, mais fraca a vontade costuma ficar. Neste mês, {diasSemApostarNoMes(estado)} dias
              registrados sem apostar.
            </p>
          </section>
        )}
        <section className="rounded-2xl border-[3px] border-ardosia bg-white p-5">
          <h2 className="text-xl font-bold">Meu combinado</h2>
          <p className="mt-1">
            {estado.trava.ativa
              ? `Você fez um combinado de ${estado.trava.dias} dias. Ele está de pé.`
              : "Um compromisso seu, com prazo e com alguém sabendo. Desfazer não é instantâneo, e isso é de propósito."}
          </p>
          <Link href="/app/combinado" className="botao-jogo botao-jogo-azul mt-4 w-full">
            {estado.trava.ativa ? "Ver meu combinado" : "Fazer meu combinado"}
          </Link>
        </section>
      </div>
    </div>
  );
}

function MissaoDia({
  feita,
  titulo,
  texto,
  pontos,
  cor,
  href,
  aoTocar,
  dobro,
  icone,
}: {
  icone: "sol" | "raio" | "bandeira";
  feita: boolean;
  titulo: string;
  texto: string;
  pontos: number;
  cor: string;
  href?: string;
  aoTocar?: () => void;
  dobro?: boolean;
}) {
  const corpo = (
    <>
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border-[3px] border-ardosia ${feita ? "bg-sol text-ardosia" : "text-white"}`}
        style={feita ? undefined : { background: cor }}
        aria-hidden="true"
      >
        {feita ? <IconePixel nome="estrela" /> : <IconePixel nome={icone} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold leading-tight">{titulo}</span>
        <span className="block text-sm text-ardosia-suave">{texto}</span>
      </span>
      <span className="pixel shrink-0 rounded-lg border-2 border-ardosia bg-sol px-2 py-1 text-[0.65rem]">{feita ? "FEITO" : `+${pontos}${dobro ? "/x2" : ""}`}</span>
    </>
  );
  const classe = `flex w-full items-center gap-3 rounded-2xl border-[3px] border-ardosia bg-white p-3 text-left transition-transform ${
    feita ? "opacity-80" : "shadow-[0_5px_0_var(--ardosia)] active:translate-y-1 hover:-translate-y-0.5"
  }`;
  if (href) {
    return (
      <Link href={href} className={classe}>
        {corpo}
      </Link>
    );
  }
  return (
    <button type="button" onClick={aoTocar} className={classe}>
      {corpo}
    </button>
  );
}

// ------------------------------------------------------------ check-in como conversa

type Pergunta = {
  campo: keyof Checkin;
  texto: string;
  opcoes: { rotulo: string; valor: number | boolean; cor: string; humor?: Humor }[];
};

const perguntas: Pergunta[] = [
  {
    campo: "humor",
    texto: "Como você está agora?",
    opcoes: [
      { rotulo: "Muito mal", valor: 1, cor: "var(--escala-1)", humor: "triste" },
      { rotulo: "Mal", valor: 2, cor: "var(--escala-2)", humor: "preocupado" },
      { rotulo: "Mais ou menos", valor: 3, cor: "var(--escala-3)" },
      { rotulo: "Bem", valor: 4, cor: "var(--escala-4)", humor: "feliz" },
      { rotulo: "Muito bem", valor: 5, cor: "var(--escala-5)", humor: "animado" },
    ],
  },
  {
    campo: "vontade",
    texto: "E a vontade de apostar hoje?",
    opcoes: [
      { rotulo: "Nenhuma", valor: 0, cor: "var(--escala-5)", humor: "feliz" },
      { rotulo: "Pouca", valor: 3, cor: "var(--escala-4)" },
      { rotulo: "Média", valor: 5, cor: "var(--escala-3)" },
      { rotulo: "Forte", valor: 8, cor: "var(--escala-2)", humor: "preocupado" },
      { rotulo: "Muito forte", valor: 10, cor: "var(--escala-1)", humor: "preocupado" },
    ],
  },
  {
    campo: "estresse",
    texto: "Quanto estresse teve hoje?",
    opcoes: [
      { rotulo: "Tranquilo", valor: 2, cor: "var(--escala-5)" },
      { rotulo: "Normal", valor: 5, cor: "var(--escala-3)" },
      { rotulo: "No limite", valor: 9, cor: "var(--escala-1)", humor: "triste" },
    ],
  },
  {
    campo: "sono",
    texto: "Como você dormiu?",
    opcoes: [
      { rotulo: "Mal", valor: 2, cor: "var(--escala-2)", humor: "dormindo" },
      { rotulo: "Mais ou menos", valor: 3, cor: "var(--escala-3)" },
      { rotulo: "Bem", valor: 5, cor: "var(--escala-5)", humor: "feliz" },
    ],
  },
  {
    campo: "confianca",
    texto: "Quanta confiança você tem para não apostar hoje?",
    opcoes: [
      { rotulo: "Pouca", valor: 2, cor: "var(--escala-2)" },
      { rotulo: "Média", valor: 5, cor: "var(--escala-3)" },
      { rotulo: "Muita", valor: 9, cor: "var(--escala-5)", humor: "animado" },
    ],
  },
  {
    campo: "apostou",
    texto: "Teve aposta hoje? Pode falar a verdade, ninguém perde XP.",
    opcoes: [
      { rotulo: "Não apostei", valor: false, cor: "var(--escala-5)", humor: "emocionado" },
      { rotulo: "Apostei", valor: true, cor: "var(--ceu)", humor: "apaixonado" },
    ],
  },
];

function CheckinJogo() {
  const { estado, atualizar } = useEstado();
  const recompensar = useRecompensa();
  const existente = estado?.checkins.find((c) => c.data === hoje());
  const [passo, setPasso] = useState(existente ? -1 : 0);
  const [rascunho, setRascunho] = useState<Checkin>(
    existente ?? { data: hoje(), humor: 0, vontade: 0, estresse: 0, sono: 0, confianca: 0, apostou: false, valor: 0 },
  );
  const [desmaiadoNoInicio] = useState(() => (estado ? estaDesmaiado(estado) : false));
  const [humor, setHumor] = useState<Humor>(desmaiadoNoInicio ? "desmaiado" : "normal");
  const [pedindoValor, setPedindoValor] = useState(false);
  if (!estado) return null;

  const salvar = (final: Checkin) => {
    const primeiro = !existente;
    atualizar((e) => ({ ...e, checkins: [...e.checkins.filter((c) => c.data !== hoje()), { ...final, data: hoje() }] }));
    setPasso(-1);
    setPedindoValor(false);
    if (primeiro) {
      recompensar({
        pontos: pontosHabito.checkin + (estado.checkins.length === 0 ? 20 : 0),
        acordou: desmaiadoNoInicio,
        titulo: desmaiadoNoInicio ? "O Caramelo acordou!" : final.apostou ? "Check-in honesto" : "Check-in feito",
        texto: final.apostou ? "Contar a verdade é o que faz o plano funcionar." : desmaiadoNoInicio ? "Bastou você voltar. Mais um dia contado." : "Mais um dia contado.",
      });
    }
  };

  const responder = (p: Pergunta, valor: number | boolean, h?: Humor) => {
    const novo = { ...rascunho, [p.campo]: valor } as Checkin;
    setRascunho(novo);
    setHumor(h ?? "normal");
    if (p.campo === "apostou") {
      if (valor) setPedindoValor(true);
      else salvar({ ...novo, valor: 0 });
      return;
    }
    setPasso(passo + 1);
  };

  if (passo === -1 && existente) {
    return (
      <section id="checkin" className="rounded-[1.75rem] border-[3px] border-ardosia bg-white p-5 shadow-[0_5px_0_var(--ardosia)]">
        <div className="flex items-center gap-3">
          <Mascote tamanho={64} humor={existente.apostou ? "preocupado" : "feliz"} animacao="parado" />
          <div className="flex-1">
            <p className="pixel text-xs text-menta">CHECK-IN FEITO ★</p>
            <h2 className="text-xl font-bold">Hoje está registrado</h2>
            <p className="text-sm text-ardosia-suave">
              Vontade {existente.vontade}/10 · confiança {existente.confianca}/10
            </p>
          </div>
        </div>
        {existente.apostou && (
          <div className="mt-4 rounded-2xl bg-ceu p-4">
            <p className="font-bold">Hoje teve aposta. Isso não apaga o que você já fez.</p>
            <p className="mt-1">Deslizes fazem parte de quase toda recuperação. Vale entender o que puxou a aposta hoje.</p>
            {existente.valor > 0 && <p className="mt-1 text-sm">Valor registrado: {reais(existente.valor)}.</p>}
            <Link href="/app/crise" className="botao-jogo botao-jogo-azul mt-3 w-full">
              Entender o que aconteceu
            </Link>
          </div>
        )}
        <button
          type="button"
          className="mt-3 text-sm font-bold text-mare-escura underline"
          onClick={() => {
            setRascunho(existente);
            setPasso(0);
          }}
        >
          Refazer o check-in
        </button>
      </section>
    );
  }

  const p = perguntas[Math.max(0, passo)];

  return (
    <section id="checkin" aria-labelledby="titulo-checkin" className="rounded-[1.75rem] border-[3px] border-ardosia bg-white p-5 shadow-[0_5px_0_var(--ardosia)]">
      <div className="flex items-center justify-between gap-2">
        <h2 id="titulo-checkin" className="pixel text-sm">
          CHECK-IN
        </h2>
        <p className="pixel text-xs text-ardosia-suave">
          {Math.min(passo + 1, perguntas.length)}/{perguntas.length}
        </p>
      </div>
      <div className="mt-2 flex gap-1" aria-hidden="true">
        {perguntas.map((_, i) => (
          <span key={i} className={`h-2.5 flex-1 rounded-sm border-2 border-ardosia ${i < passo || pedindoValor ? "bg-menta" : i === passo ? "bg-sol" : "bg-ceu"}`} />
        ))}
      </div>

      <div className="mt-4">
        <Fala humor={humor} tamanho={72}>
          <span key={passo} className="surgir block">
            {pedindoValor
              ? "Obrigado por contar. Quanto foi, mais ou menos? Isso ajuda a ver o tamanho do prejuízo."
              : humor === "desmaiado" && passo === 0
                ? "Psiu... desmaiei de saudade. Me acorda respondendo: como você está agora?"
                : p.texto}
          </span>
        </Fala>
      </div>

      {pedindoValor ? (
        <div className="mt-4 space-y-3">
          <label className="rotulo" htmlFor="valor-apostado">
            Valor aproximado
          </label>
          <input
            id="valor-apostado"
            inputMode="numeric"
            className="campo"
            placeholder="R$"
            value={rascunho.valor || ""}
            onChange={(e) => setRascunho({ ...rascunho, valor: Number(e.target.value.replace(/\D/g, "")) })}
          />
          <button type="button" className="botao-jogo w-full text-lg" onClick={() => salvar(rascunho)}>
            Terminar check-in
          </button>
        </div>
      ) : (
        <div className={`mt-4 grid gap-2 ${p.opcoes.length > 3 ? "grid-cols-2 sm:grid-cols-5 lg:grid-cols-3" : p.opcoes.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {p.opcoes.map((o) => (
            <button
              key={o.rotulo}
              type="button"
              onClick={() => responder(p, o.valor, o.humor)}
              className="surgir min-h-16 rounded-xl border-[3px] border-ardosia px-2 py-3 font-bold leading-tight shadow-[0_4px_0_var(--ardosia)] transition-transform active:translate-y-1 hover:-translate-y-0.5 last:odd:col-span-2 sm:last:odd:col-span-1"
              style={{ background: o.cor }}
            >
              <SimboloEscala cor={o.cor} />
              {o.rotulo}
            </button>
          ))}
        </div>
      )}

      {passo > 0 && !pedindoValor && (
        <button type="button" className="mt-3 text-sm font-bold text-ardosia-suave underline" onClick={() => setPasso(passo - 1)}>
          Voltar
        </button>
      )}
    </section>
  );
}

const DESENHOS: Record<string, string[]> = {
  sol: ["...X...", ".X.X.X.", "..XXX..", "XXXXXXX", "..XXX..", ".X.X.X.", "...X..."],
  raio: ["....XX.", "...XX..", "..XX...", ".XXXXX.", "...XX..", "..XX...", ".XX...."],
  bandeira: ["XXXXXX.", "XXXXX..", "XXXXXX.", "X......", "X......", "X......", "X......"],
  estrela: ["...X...", "..XXX..", "XXXXXXX", ".XXXXX.", "..XXX..", ".XX.XX.", "XX...XX"],
  coracao: [".......", ".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."],
};

function IconePixel({ nome }: { nome: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 7 7" className="pixelado" aria-hidden="true">
      {DESENHOS[nome].flatMap((linha, y) =>
        linha.split("").map((c, x) => (c === "X" ? <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill="currentColor" /> : null)),
      )}
    </svg>
  );
}

// Desenrola direto na tela inicial: o chefão da vez e a reserva
function CartaoDesenrola() {
  const { estado } = useEstado();
  if (!estado) return null;
  const ativas = ordenarDividas(estado.dividas, estado.estrategia);
  const alvo = ativas[0];
  const total = estado.dividas.reduce((s, d) => s + restante(d), 0);
  const derrotados = estado.dividas.filter((d) => d.valorTotal > 0 && restante(d) === 0).length;
  const r = estado.reserva;
  const pctReserva = r.meta ? Math.min(100, Math.round((r.guardado / r.meta) * 100)) : 0;

  return (
    <section aria-labelledby="titulo-desenrola-hoje" className="overflow-hidden rounded-[1.75rem] border-[3px] border-ardosia bg-white shadow-[0_5px_0_var(--ardosia)]">
      <div className="flex items-center justify-between gap-3 bg-ardosia px-5 py-3 text-white">
        <div>
          <p className="pixel text-[0.65rem] text-sol">DESENROLA</p>
          <h2 id="titulo-desenrola-hoje" className="text-xl font-extrabold">
            Desenrolando sua vida
          </h2>
        </div>
        {estado.dividas.length > 0 && (
          <p className="text-right text-sm font-bold">
            {derrotados}/{estado.dividas.length} chefões
            <span className="block text-white/80">falta {reais(total)}</span>
          </p>
        )}
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        {alvo ? (
          <div className="flex items-center gap-3">
            <Chefao categoria={alvo.categoria} tamanho={64} className="mascote-idle shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="pixel text-[0.6rem] text-ardosia-suave">ALVO ATUAL</p>
              <p className="truncate font-extrabold">{alvo.credor}</p>
              <BarraVida restante={restante(alvo)} total={alvo.valorTotal} cor={corChefao[alvo.categoria]} />
              <p className="mt-1 text-xs">
                Vida {reais(restante(alvo))} · {progressoDividas(estado.dividas)}% de tudo já pago
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-bold">{estado.dividas.length ? "Todos os chefões derrotados!" : "Ainda não tem dívida no papel."}</p>
            <p className="text-sm text-ardosia-suave">
              {estado.dividas.length ? "Agora o foco é a reserva." : "Anotar tira o peso da cabeça e vale +40 XP na trilha."}
            </p>
          </div>
        )}
        <div className="rounded-xl bg-menta-claro p-3">
          <p className="pixel text-[0.6rem] text-ardosia-suave">CASINHA DO CARAMELO</p>
          <p className="font-extrabold">
            {reais(r.guardado)} <span className="text-sm font-bold">de {reais(r.meta)}</span>
          </p>
          <div className="mt-1 h-3 overflow-hidden rounded border-2 border-ardosia bg-white">
            <div className="h-full bg-menta transition-[width] duration-700" style={{ width: `${pctReserva}%` }} />
          </div>
          <p className="mt-1 truncate text-xs">{r.objetivo}</p>
        </div>
      </div>
      <div className="px-5 pb-5">
        <Link href="/app/dividas" className="botao-jogo w-full">
          {alvo ? "Registrar um pagamento" : estado.dividas.length ? "Guardar na reserva" : "Colocar dívidas no papel"}
        </Link>
      </div>
    </section>
  );
}

// Símbolo que acompanha a cor nas respostas, para quem tem daltonismo:
// triângulo para baixo é ruim, círculo é meio, triângulo para cima é bom.
function SimboloEscala({ cor }: { cor: string }) {
  const n = Number(cor.match(/escala-(\d)/)?.[1] ?? 0);
  if (!n) return null;
  const forma = n <= 2 ? "M4 6h16L12 19Z" : n === 3 ? "M12 5a7 7 0 1 1 0 14a7 7 0 0 1 0-14Z" : "M4 18h16L12 5Z";
  const vezes = n === 1 || n === 5 ? 2 : 1;
  return (
    <span className="simbolo-escala mb-1 w-full justify-center" aria-hidden="true">
      {Array.from({ length: vezes }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24">
          <path d={forma} fill="var(--ardosia)" />
        </svg>
      ))}
    </span>
  );
}
