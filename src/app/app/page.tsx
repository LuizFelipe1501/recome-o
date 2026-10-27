"use client";

import Link from "next/link";
import { useState } from "react";
import { Atividade } from "@/components/Atividade";
import { Carinhas, Escala, MiniGrafico } from "@/components/ui";
import { Celebracao, useCelebracao } from "@/components/Pontos";
import { PainelFamiliar } from "@/components/PainelFamiliar";
import { atividades, atividadesLivres } from "@/lib/conteudo";
import { placar, pontosHabito, proximaMissao } from "@/lib/missoes";
import { useEstado } from "@/lib/estado";
import { diasEntre, diasSemApostarNoMes, hoje, reais } from "@/lib/calculos";
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
  const ultimos = [...estado.checkins].sort((a, b) => a.data.localeCompare(b.data)).slice(-14);
  const recebidas = mensagens.filter((m) => m.autor_id !== usuarioId);
  const ultimaMsg = recebidas[recebidas.length - 1];
  const ordemAtividades = [...estado.favoritas, ...atividadesLivres.filter((a) => !estado.favoritas.includes(a))];

  return (
    <div className="space-y-8 pt-2">
      <section>
        <p className="text-ardosia-suave">Dia {dia} no Recomeço</p>
        <h1 className="text-3xl font-extrabold">Oi{estado.perfil.nome ? `, ${estado.perfil.nome}` : ""}.</h1>
      </section>

      {ultimaMsg && (
        <section className="rounded-2xl bg-sol-claro p-4">
          <p className="text-sm font-bold">Mensagem de quem torce por você</p>
          <p className="mt-1 font-titulo text-lg">“{ultimaMsg.texto}”</p>
        </section>
      )}

      <CheckinDoDia />

      <CartaoTrilha />

      {ultimos.length >= 2 && (
        <section className="bloco">
          <h2 className="text-xl font-bold">Sua vontade nos últimos dias</h2>
          <MiniGrafico pontos={ultimos.map((c) => ({ data: c.data, valor: c.vontade }))} rotulo="Nível de vontade de apostar em cada check-in, de 0 a 10" />
          <p className="text-sm">
            Quanto mais tempo longe das apostas, mais fraca a vontade costuma ficar. Neste mês, foram {diasSemApostarNoMes(estado)} dias
            registrados sem apostar.
          </p>
        </section>
      )}

      <section aria-labelledby="titulo-atividades">
        <h2 id="titulo-atividades" className="text-2xl font-extrabold">
          Atividades curtas
        </h2>
        <p className="mt-1 text-ardosia-suave">Para fazer com calma, fora da hora da vontade. Marque as que funcionam com a estrela.</p>
        <div className="mt-4 space-y-2">
          {ordemAtividades.map((id) => {
            const a = atividades[id];
            if (!a) return null;
            const feitas = estado.atividadesFeitas[id]?.length ?? 0;
            return (
              <div key={id}>
                <button
                  type="button"
                  className="opcao flex items-center justify-between gap-3"
                  aria-expanded={aberta === id}
                  onClick={() => setAberta(aberta === id ? null : id)}
                >
                  <span>
                    <strong>{a.titulo}</strong>
                    <span className="block text-sm text-ardosia-suave">
                      {a.minutos} min{feitas ? `, feita ${feitas} ${feitas === 1 ? "vez" : "vezes"}` : ""}
                    </span>
                  </span>
                  {estado.favoritas.includes(id) && (
                    <span className="text-sol" aria-label="Favorita">
                      ★
                    </span>
                  )}
                </button>
                {aberta === id && (
                  <div className="mt-2">
                    <Atividade id={id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="bloco">
        <h2 className="text-xl font-bold">Meu combinado</h2>
        <p className="mt-1">
          {estado.trava.ativa
            ? `Você fez um combinado de ${estado.trava.dias} dias. Ele está de pé.`
            : "Um compromisso com você mesmo, com prazo e com alguém de confiança. Desfazer não é instantâneo, e isso é de propósito."}
        </p>
        <Link href="/app/combinado" className="botao-linha mt-3 w-full">
          {estado.trava.ativa ? "Ver meu combinado" : "Fazer meu combinado"}
        </Link>
      </section>
    </div>
  );
}

function CartaoTrilha() {
  const { estado } = useEstado();
  if (!estado) return null;
  const p = placar(estado);
  const prox = proximaMissao(estado);
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] bg-mare p-5 text-white" aria-labelledby="titulo-trilha">
      <svg className="pointer-events-none absolute -right-8 -top-8 h-32 w-32" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="42" fill="var(--sol)" />
      </svg>
      <div className="relative">
        <h2 id="titulo-trilha" className="font-bold text-white/90">
          Sua trilha
        </h2>
        <p className="font-titulo text-5xl font-extrabold leading-none">
          {p.total} <span className="text-xl">pontos</span>
        </p>
        <p className="mt-2 inline-block rounded-full bg-lima px-3 py-0.5 text-sm font-bold text-ardosia">{p.nivel.nome}</p>
        {prox && (
          <div className="mt-4 rounded-2xl bg-white p-4 text-ardosia">
            <p className="text-sm font-bold text-ardosia-suave">Próxima missão</p>
            <p className="font-bold">{prox.titulo}</p>
            <p className="text-sm">
              +{prox.pontos} pontos{prox.compartilhavel ? `, ou +${prox.pontos * 2} com o padrinho` : ""}
            </p>
          </div>
        )}
        <Link href="/app/trilha" className="botao mt-4 w-full bg-white text-mare-escura hover:bg-ceu">
          Ver todas as missões
        </Link>
      </div>
    </section>
  );
}

function CheckinDoDia() {
  const { estado, atualizar } = useEstado();
  const existente = estado?.checkins.find((c) => c.data === hoje());
  const { festa, celebrar } = useCelebracao();
  const [editando, setEditando] = useState(!existente);
  const [rascunho, setRascunho] = useState<Checkin>(
    existente ?? { data: hoje(), humor: 0, vontade: 3, estresse: 3, sono: 0, confianca: 6, apostou: false, valor: 0 },
  );
  if (!estado) return null;

  const salvar = () => {
    atualizar((e) => ({ ...e, checkins: [...e.checkins.filter((c) => c.data !== hoje()), { ...rascunho, data: hoje() }] }));
    if (!existente) celebrar(`+${pontosHabito.checkin} pontos`);
    setEditando(false);
  };

  if (!editando && existente) {
    return (
      <section className="bloco relative">
        <Celebracao festa={festa} />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Check-in de hoje feito</h2>
            <p className="text-ardosia-suave">
              Vontade {existente.vontade} de 10, confiança {existente.confianca} de 10.
            </p>
          </div>
          <button type="button" className="text-sm font-bold text-mare-escura underline" onClick={() => setEditando(true)}>
            Mudar
          </button>
        </div>
        {existente.apostou && (
          <div className="mt-4 rounded-2xl bg-ceu p-4">
            <p className="font-bold">Hoje teve aposta. Isso não apaga o que você já fez.</p>
            <p className="mt-1">
              Deslizes fazem parte de quase toda recuperação. O importante é o que vem agora. Que tal entender o que puxou a
              aposta hoje?
            </p>
            {existente.valor > 0 && <p className="mt-1 text-sm">Valor registrado: {reais(existente.valor)}.</p>}
            <Link href="/app/crise" className="botao-linha mt-3 w-full">
              Entender o que aconteceu
            </Link>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="bloco space-y-6" aria-labelledby="titulo-checkin">
      <div>
        <h2 id="titulo-checkin" className="text-xl font-bold">
          Como foi o seu dia?
        </h2>
        <p className="text-sm text-ardosia-suave">Menos de um minuto. Horário combinado: {estado.perfil.horarioCheckin}.</p>
      </div>
      <Carinhas legenda="Seu humor" valor={rascunho.humor || undefined} aoMudar={(v) => setRascunho({ ...rascunho, humor: v })} />
      <Escala legenda="Vontade de apostar" valor={rascunho.vontade} aoMudar={(v) => setRascunho({ ...rascunho, vontade: v })} extremos={["Nenhuma", "Muito forte"]} />
      <Escala legenda="Estresse" valor={rascunho.estresse} aoMudar={(v) => setRascunho({ ...rascunho, estresse: v })} extremos={["Tranquilo", "No limite"]} />
      <Carinhas legenda="Como você dormiu" valor={rascunho.sono || undefined} aoMudar={(v) => setRascunho({ ...rascunho, sono: v })} />
      <Escala
        legenda="Confiança para resistir hoje"
        valor={rascunho.confianca}
        aoMudar={(v) => setRascunho({ ...rascunho, confianca: v })}
        extremos={["Nenhuma", "Total"]}
      />
      <fieldset>
        <legend className="rotulo">Apostou hoje?</legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup">
          <button type="button" role="radio" aria-checked={!rascunho.apostou} className="opcao text-center" onClick={() => setRascunho({ ...rascunho, apostou: false, valor: 0 })}>
            Não
          </button>
          <button type="button" role="radio" aria-checked={rascunho.apostou} className="opcao text-center" onClick={() => setRascunho({ ...rascunho, apostou: true })}>
            Sim
          </button>
        </div>
      </fieldset>
      {rascunho.apostou && (
        <div>
          <label className="rotulo" htmlFor="valor-apostado">
            Quanto, mais ou menos
          </label>
          <input
            id="valor-apostado"
            inputMode="numeric"
            className="campo"
            placeholder="R$"
            value={rascunho.valor || ""}
            onChange={(e) => setRascunho({ ...rascunho, valor: Number(e.target.value.replace(/\D/g, "")) })}
          />
          <p className="mt-1 text-sm text-ardosia-suave">Ser honesto aqui é o que faz o app te ajudar de verdade.</p>
        </div>
      )}
      <button type="button" className="botao w-full" onClick={salvar} disabled={!rascunho.humor}>
        Salvar check-in
      </button>
    </section>
  );
}
