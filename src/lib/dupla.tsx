"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useEstado } from "./estado";
import { supabase } from "./supabase";
import { hoje } from "./calculos";
import { missoesDupla, type MissaoDupla } from "./duplaDados";
import type { ResumoCompartilhado } from "./tipos";
import { useRecompensa } from "@/components/Jogo";

// Uma linha por missão combinada entre as duas pessoas. Mesmo formato da tabela public.dupla.
export type LinhaDupla = {
  missao_id: string;
  proposto_por: string;
  aceito_em: string | null;
  feito_apostador: string | null;
  feito_familiar: string | null;
};

export type SituacaoDupla = "livre" | "esperando-aceite" | "convite" | "combinada" | "esperando-outro" | "falta-voce" | "concluida";

const PARCEIRO_DEMO = "parceiro";

type Contexto = {
  ativa: boolean;
  demo: boolean;
  parceiro: string;
  linhas: Record<string, LinhaDupla>;
  situacao: (id: string) => SituacaoDupla;
  propor: (id: string) => Promise<void>;
  aceitar: (id: string) => Promise<void>;
  recusar: (id: string) => Promise<void>;
  confirmar: (id: string) => Promise<void>;
  feitas: number;
  pendente: { missao: MissaoDupla; situacao: SituacaoDupla } | null;
};

const Ctx = createContext<Contexto | null>(null);

export function useDupla() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDupla fora do ProvedorDupla");
  return c;
}

export function ProvedorDupla({ children }: { children: ReactNode }) {
  const { modo, estado, usuarioId, vinculo, atualizar, enviarMensagem } = useEstado();
  const recompensar = useRecompensa();
  const [linhas, setLinhas] = useState<Record<string, LinhaDupla>>({});
  const papel = estado?.perfil.papel ?? "apostador";
  const demo = modo === "demo";
  const chaveDemo = `recomeco-dupla-demo-${papel}`;
  const eu = demo ? "eu" : (usuarioId ?? "");
  const vinculoId = vinculo?.id;
  const ativa = demo || Boolean(vinculo?.familiar_id && vinculoId);

  const parceiro = useMemo(() => {
    if (papel === "familiar") return (vinculo?.resumo as ResumoCompartilhado | undefined)?.nome || "a pessoa que você apoia";
    const pessoa = estado?.trava.pessoaConfianca?.split(",")[0]?.trim();
    return pessoa || (demo ? "Bia" : "seu padrinho");
  }, [papel, vinculo, estado?.trava.pessoaConfianca, demo]);

  // ------------------------------------------------------------ carregar
  const gravarDemo = useCallback(
    (novas: Record<string, LinhaDupla>) => {
      try {
        localStorage.setItem(chaveDemo, JSON.stringify(novas));
      } catch {}
    },
    [chaveDemo],
  );

  const carregar = useCallback(async () => {
    if (demo || !vinculoId) return;
    const { data } = await supabase()?.from("dupla").select("missao_id, proposto_por, aceito_em, feito_apostador, feito_familiar").eq("vinculo_id", vinculoId) ?? { data: null };
    const mapa: Record<string, LinhaDupla> = {};
    (data as LinhaDupla[] | null)?.forEach((l) => (mapa[l.missao_id] = l));
    setLinhas(mapa);
  }, [demo, vinculoId]);

  useEffect(() => {
    if (!estado) return;
    if (demo) {
      let salvas: Record<string, LinhaDupla> | null = null;
      try {
        salvas = JSON.parse(localStorage.getItem(chaveDemo) ?? "null");
      } catch {}
      // Na demonstração, a outra pessoa já chega com um convite para a primeira missão
      const iniciais = salvas ?? {
        [missoesDupla[0].id]: { missao_id: missoesDupla[0].id, proposto_por: PARCEIRO_DEMO, aceito_em: null, feito_apostador: null, feito_familiar: null },
      };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLinhas(iniciais);
      if (!salvas) gravarDemo(iniciais);
      return;
    }
    if (!vinculoId) return;
    carregar();
    const sb = supabase();
    if (!sb) return;
    const canal = sb
      .channel(`dupla-${vinculoId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "dupla", filter: `vinculo_id=eq.${vinculoId}` }, () => carregar())
      .subscribe();
    const aoVoltar = () => document.visibilityState === "visible" && carregar();
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      sb.removeChannel(canal);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, vinculoId, chaveDemo, Boolean(estado)]);

  // ------------------------------------------------------------ situação
  const colunaMinha = papel === "familiar" ? "feito_familiar" : "feito_apostador";
  const colunaOutro = papel === "familiar" ? "feito_apostador" : "feito_familiar";

  const situacao = useCallback(
    (id: string): SituacaoDupla => {
      const l = linhas[id];
      if (!l) return "livre";
      if (l.feito_apostador && l.feito_familiar) return "concluida";
      if (!l.aceito_em) return l.proposto_por === eu ? "esperando-aceite" : "convite";
      if (l[colunaMinha] && !l[colunaOutro]) return "esperando-outro";
      if (!l[colunaMinha] && l[colunaOutro]) return "falta-voce";
      return "combinada";
    },
    [linhas, eu, colunaMinha, colunaOutro],
  );

  // ------------------------------------------------------------ ações
  const mudarDemo = useCallback(
    (fn: (atual: Record<string, LinhaDupla>) => Record<string, LinhaDupla>) => {
      setLinhas((atual) => {
        const novas = fn(atual);
        gravarDemo(novas);
        return novas;
      });
    },
    [gravarDemo],
  );

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const depois = useCallback((fn: () => void, ms = 1800) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const propor = useCallback(
    async (id: string) => {
      const m = missoesDupla.find((x) => x.id === id);
      if (demo) {
        mudarDemo((a) => ({ ...a, [id]: { missao_id: id, proposto_por: "eu", aceito_em: null, feito_apostador: null, feito_familiar: null } }));
        // a outra pessoa aceita logo em seguida
        depois(() => mudarDemo((a) => (a[id] ? { ...a, [id]: { ...a[id], aceito_em: new Date().toISOString() } } : a)));
        return;
      }
      if (!vinculoId) return;
      await supabase()?.from("dupla").insert({ vinculo_id: vinculoId, missao_id: id, proposto_por: eu });
      if (m) await enviarMensagem(`Bora fazer a missão "${m.titulo}" comigo na Trilha da dupla?`);
      await carregar();
    },
    [demo, vinculoId, eu, mudarDemo, enviarMensagem, carregar, depois],
  );

  const aceitar = useCallback(
    async (id: string) => {
      const agora = new Date().toISOString();
      if (demo) return mudarDemo((a) => ({ ...a, [id]: { ...a[id], aceito_em: agora } }));
      if (!vinculoId) return;
      await supabase()?.from("dupla").update({ aceito_em: agora }).eq("vinculo_id", vinculoId).eq("missao_id", id);
      await carregar();
    },
    [demo, vinculoId, mudarDemo, carregar],
  );

  const recusar = useCallback(
    async (id: string) => {
      if (demo)
        return mudarDemo((a) => {
          const resto = { ...a };
          delete resto[id];
          return resto;
        });
      if (!vinculoId) return;
      await supabase()?.from("dupla").delete().eq("vinculo_id", vinculoId).eq("missao_id", id);
      await carregar();
    },
    [demo, vinculoId, mudarDemo, carregar],
  );

  const confirmar = useCallback(
    async (id: string) => {
      const agora = new Date().toISOString();
      if (demo) {
        mudarDemo((a) => ({ ...a, [id]: { ...a[id], [colunaMinha]: agora } }));
        // a outra pessoa confirma a parte dela
        depois(() => mudarDemo((a) => (a[id] && !a[id][colunaOutro] ? { ...a, [id]: { ...a[id], [colunaOutro]: new Date().toISOString() } } : a)));
        return;
      }
      if (!vinculoId) return;
      await supabase()?.from("dupla").update({ [colunaMinha]: agora }).eq("vinculo_id", vinculoId).eq("missao_id", id);
      await carregar();
    },
    [demo, vinculoId, colunaMinha, colunaOutro, mudarDemo, carregar, depois],
  );

  // ------------------------------------------------------------ conclusão
  // Quando as duas partes confirmam, cada aparelho guarda a conquista e mostra a recompensa.
  useEffect(() => {
    if (!estado) return;
    const novas = missoesDupla.filter((m) => situacao(m.id) === "concluida" && !estado.missoes[`dupla-${m.id}`]);
    if (!novas.length) return;
    atualizar((e) => {
      const missoes = { ...e.missoes };
      for (const m of novas) {
        missoes[`dupla-${m.id}`] = { data: hoje(), comPadrinho: true };
        const par = m.vincula?.[e.perfil.papel];
        if (par && !missoes[par]) missoes[par] = { data: hoje(), comPadrinho: true };
      }
      return { ...e, missoes };
    });
    const m = novas[0];
    recompensar({ pontos: m.pontos, titulo: `Missão da dupla: ${m.titulo}`, texto: `Você e ${parceiro} confirmaram. Pontos em dobro para os dois.` });
  }, [estado, situacao, atualizar, recompensar, parceiro]);

  // ------------------------------------------------------------ resumo
  const feitas = missoesDupla.filter((m) => situacao(m.id) === "concluida").length;
  const ordem: SituacaoDupla[] = ["convite", "falta-voce", "combinada", "esperando-outro", "esperando-aceite"];
  let pendente: Contexto["pendente"] = null;
  for (const s of ordem) {
    const m = missoesDupla.find((x) => situacao(x.id) === s);
    if (m) {
      pendente = { missao: m, situacao: s };
      break;
    }
  }
  if (!pendente) {
    const livre = missoesDupla.find((x) => situacao(x.id) === "livre");
    if (livre) pendente = { missao: livre, situacao: "livre" };
  }

  const valor: Contexto = { ativa, demo, parceiro, linhas, situacao, propor, aceitar, recusar, confirmar, feitas, pendente };
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}
