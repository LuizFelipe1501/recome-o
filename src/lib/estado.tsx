"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigurado } from "./supabase";
import { estadoInicial, type Estado, type Papel, type ResumoCompartilhado } from "./tipos";
import { resumoParaFamilia } from "./calculos";

const CHAVE_DEMO = "recomeco-demo";
const CHAVE_ESTADO_DEMO = "recomeco-estado-demo";

export type Modo = "carregando" | "anonimo" | "demo" | "conta";

export type Vinculo = {
  id: string;
  codigo: string;
  apostador_id: string;
  familiar_id: string | null;
  resumo: ResumoCompartilhado | Record<string, never>;
};

export type Mensagem = { id: string; autor_id: string; texto: string; criado: string };

type Contexto = {
  modo: Modo;
  estado: Estado | null;
  usuarioId: string | null;
  email: string | null;
  atualizar: (fn: (e: Estado) => Estado) => void;
  entrarDemo: (papel: Papel) => void;
  iniciarConta: (papel: Papel, nome: string) => Promise<void>;
  sair: () => Promise<void>;
  apagarTudo: () => Promise<void>;
  vinculo: Vinculo | null;
  mensagens: Mensagem[];
  criarConvite: () => Promise<string | null>;
  aceitarConvite: (codigo: string) => Promise<string | null>;
  enviarMensagem: (texto: string) => Promise<void>;
  encerrarVinculo: () => Promise<void>;
  recarregarFamilia: () => Promise<void>;
};

const Ctx = createContext<Contexto | null>(null);

const lerLocal = <T,>(chave: string): T | null => {
  try {
    const v = localStorage.getItem(chave);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
};

const gravarLocal = (chave: string, valor: unknown) => {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* armazenamento indisponível */
  }
};

// Completa campos novos em estados salvos por versões anteriores do app.
const normalizar = (e: Partial<Estado>): Estado => {
  const base = estadoInicial(e.perfil?.papel ?? "apostador", e.perfil?.nome ?? "");
  return {
    ...base,
    ...e,
    perfil: { ...base.perfil, ...e.perfil },
    familia: { ...base.familia, ...e.familia, compartilhar: { ...base.familia.compartilhar, ...e.familia?.compartilhar } },
    prefs: { ...base.prefs, ...e.prefs },
    trava: { ...base.trava, ...e.trava },
    reserva: { ...base.reserva, ...e.reserva },
    rotina: { ...base.rotina, ...e.rotina },
  } as Estado;
};

// Dados fictícios para o modo demonstração do familiar.
const vinculoDemo: Vinculo = {
  id: "demo",
  codigo: "DEMO42",
  apostador_id: "demo-apostador",
  familiar_id: "demo-familiar",
  resumo: {
    nome: "Rafa",
    diasNoRecomeco: 12,
    diasSemApostarNoMes: 9,
    faseAtual: "Conhecer os gatilhos",
    humorRecente: 4,
    dividasQuitadasPct: 18,
    pontos: 340,
    nivel: "Pé firme",
    ultimaMissao: "Limpar o celular",
    atualizado: new Date().toISOString(),
  },
};

export function ProvedorEstado({ children }: { children: ReactNode }) {
  const [modo, setModo] = useState<Modo>("carregando");
  const [estado, setEstado] = useState<Estado | null>(null);
  const [sessao, setSessao] = useState<Session | null>(null);
  const [vinculo, setVinculo] = useState<Vinculo | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const salvarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modoRef = useRef<Modo>("carregando");
  useEffect(() => {
    modoRef.current = modo;
  }, [modo]);

  const carregarFamilia = useCallback(async (uid: string) => {
    const sb = supabase();
    if (!sb) return;
    const { data } = await sb
      .from("vinculos")
      .select("*")
      .or(`apostador_id.eq.${uid},familiar_id.eq.${uid}`)
      .order("criado", { ascending: false })
      .limit(1);
    const v = (data?.[0] as Vinculo) ?? null;
    setVinculo(v);
    if (v) {
      const { data: msgs } = await sb
        .from("mensagens")
        .select("id, autor_id, texto, criado")
        .eq("vinculo_id", v.id)
        .order("criado", { ascending: true })
        .limit(100);
      setMensagens((msgs as Mensagem[]) ?? []);
    } else {
      setMensagens([]);
    }
  }, []);

  const carregarConta = useCallback(
    async (s: Session) => {
      const sb = supabase()!;
      const { data } = await sb.from("estados").select("dados").eq("user_id", s.user.id).maybeSingle();
      if (data?.dados) {
        setEstado(normalizar(data.dados as Estado));
      } else {
        const meta = s.user.user_metadata as { papel?: Papel; nome?: string };
        const novo = estadoInicial(meta?.papel ?? "apostador", meta?.nome ?? "");
        await sb.from("estados").upsert({ user_id: s.user.id, dados: novo });
        setEstado(novo);
      }
      modoRef.current = "conta";
      setModo("conta");
      carregarFamilia(s.user.id);
    },
    [carregarFamilia],
  );

  useEffect(() => {
    const demo = lerLocal<boolean>(CHAVE_DEMO);
    if (demo) {
      const e = lerLocal<Estado>(CHAVE_ESTADO_DEMO);
      // Leitura do armazenamento local só pode acontecer no navegador, depois da hidratação.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEstado(e ? normalizar(e) : estadoInicial());
      setModo("demo");
      return;
    }
    const sb = supabase();
    if (!sb) {
      setModo("anonimo");
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      if (data.session) carregarConta(data.session);
      else setModo("anonimo");
    });
    const { data: sub } = sb.auth.onAuthStateChange((evento, s) => {
      setSessao(s);
      if (evento === "SIGNED_IN" && s && modoRef.current !== "conta") carregarConta(s);
      if (evento === "SIGNED_OUT") {
        setEstado(null);
        setVinculo(null);
        setModo("anonimo");
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [carregarConta]);

  // Preferências de acessibilidade aplicadas na página inteira.
  useEffect(() => {
    const raiz = document.documentElement;
    const p = estado?.prefs;
    raiz.dataset.fonte = p?.fonte ?? "normal";
    raiz.dataset.contraste = p?.contraste ?? "normal";
    raiz.dataset.movimento = p?.movimento ?? "normal";
    raiz.dataset.daltonismo = p?.daltonismo ?? "nenhum";
  }, [estado?.prefs]);

  const pendente = useRef<Estado | null>(null);

  const enviarPendente = useCallback(async () => {
    const e = pendente.current;
    pendente.current = null;
    if (salvarTimer.current) clearTimeout(salvarTimer.current);
    const sb = supabase();
    if (!e || !sb || !sessao) return;
    await sb.from("estados").upsert({ user_id: sessao.user.id, dados: e, atualizado: new Date().toISOString() });
    if (vinculo && vinculo.apostador_id === sessao.user.id && e.perfil.papel === "apostador") {
      await sb.from("vinculos").update({ resumo: resumoParaFamilia(e) }).eq("id", vinculo.id);
    }
  }, [sessao, vinculo]);

  // No modo demonstração grava na hora. Com conta, junta as mudanças por meio segundo
  // e força o envio se a pessoa fechar ou trocar de aba.
  const persistir = useCallback(
    (e: Estado) => {
      if (modoRef.current === "demo") {
        gravarLocal(CHAVE_ESTADO_DEMO, e);
        gravarLocal(`${CHAVE_ESTADO_DEMO}-${e.perfil.papel}`, e);
        return;
      }
      pendente.current = e;
      if (salvarTimer.current) clearTimeout(salvarTimer.current);
      salvarTimer.current = setTimeout(enviarPendente, 500);
    },
    [enviarPendente],
  );

  useEffect(() => {
    const aoSair = () => {
      if (pendente.current) enviarPendente();
    };
    const aoOcultar = () => {
      if (document.visibilityState === "hidden") aoSair();
    };
    window.addEventListener("pagehide", aoSair);
    document.addEventListener("visibilitychange", aoOcultar);
    return () => {
      window.removeEventListener("pagehide", aoSair);
      document.removeEventListener("visibilitychange", aoOcultar);
    };
  }, [enviarPendente]);

  const atualizar = useCallback(
    (fn: (e: Estado) => Estado) => {
      setEstado((atual) => {
        if (!atual) return atual;
        const novo = fn(atual);
        persistir(novo);
        return novo;
      });
    },
    [persistir],
  );

  const entrarDemo = useCallback((papel: Papel) => {
    // Cada papel guarda o seu próprio teste, para dar para trocar sem perder nada
    const atual = lerLocal<Estado>(CHAVE_ESTADO_DEMO);
    if (atual) gravarLocal(`${CHAVE_ESTADO_DEMO}-${atual.perfil.papel}`, atual);
    const salvo = lerLocal<Estado>(`${CHAVE_ESTADO_DEMO}-${papel}`);
    const e = salvo && salvo.perfil.papel === papel ? normalizar(salvo) : estadoInicial(papel);
    gravarLocal(CHAVE_DEMO, true);
    gravarLocal(CHAVE_ESTADO_DEMO, e);
    setEstado(e);
    modoRef.current = "demo";
    setModo("demo");
    if (papel === "familiar") {
      setVinculo(vinculoDemo);
      setMensagens([]);
    }
  }, []);

  const vinculoVisivel = vinculo ?? (modo === "demo" && estado?.perfil.papel === "familiar" ? vinculoDemo : null);

  const iniciarConta = useCallback(
    async (papel: Papel, nome: string) => {
      const sb = supabase();
      if (!sb || !sessao) return;
      const novo = estadoInicial(papel, nome);
      await sb.from("estados").upsert({ user_id: sessao.user.id, dados: novo });
      setEstado(novo);
    },
    [sessao],
  );

  const sair = useCallback(async () => {
    if (modoRef.current === "demo") {
      try {
        localStorage.removeItem(CHAVE_DEMO);
      } catch {}
      setEstado(null);
      setVinculo(null);
      setModo(supabaseConfigurado ? "anonimo" : "anonimo");
      return;
    }
    await supabase()?.auth.signOut();
  }, []);

  const apagarTudo = useCallback(async () => {
    if (modoRef.current === "demo") {
      try {
        localStorage.removeItem(CHAVE_ESTADO_DEMO);
        localStorage.removeItem(CHAVE_DEMO);
      } catch {}
      setEstado(null);
      setModo("anonimo");
      return;
    }
    const sb = supabase();
    if (!sb || !sessao) return;
    await sb.from("vinculos").delete().or(`apostador_id.eq.${sessao.user.id},familiar_id.eq.${sessao.user.id}`);
    await sb.from("estados").delete().eq("user_id", sessao.user.id);
    await sb.auth.signOut();
  }, [sessao]);

  const criarConvite = useCallback(async () => {
    if (modoRef.current === "demo") return "Disponível só com conta. No modo demonstração o código é DEMO42.";
    const sb = supabase();
    if (!sb || !sessao || !estado) return "Entre na sua conta primeiro.";
    const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const codigo = Array.from({ length: 6 }, () => letras[Math.floor(Math.random() * letras.length)]).join("");
    const { data, error } = await sb
      .from("vinculos")
      .insert({ codigo, apostador_id: sessao.user.id, resumo: resumoParaFamilia(estado) })
      .select()
      .single();
    if (error) return "Não foi possível criar o convite. Tente de novo.";
    setVinculo(data as Vinculo);
    return null;
  }, [sessao, estado]);

  const aceitarConvite = useCallback(
    async (codigo: string) => {
      if (modoRef.current === "demo") {
        setVinculo(vinculoDemo);
        return null;
      }
      const sb = supabase();
      if (!sb || !sessao) return "Entre na sua conta primeiro.";
      const { error } = await sb.rpc("aceitar_convite", { p_codigo: codigo });
      if (error) return error.message.includes("não encontrado") ? "Código não encontrado ou já usado." : error.message;
      await carregarFamilia(sessao.user.id);
      return null;
    },
    [sessao, carregarFamilia],
  );

  const enviarMensagem = useCallback(
    async (texto: string) => {
      const limpo = texto.trim().slice(0, 500);
      if (!limpo) return;
      if (modoRef.current === "demo" || !vinculo) {
        setMensagens((m) => [...m, { id: String(Date.now()), autor_id: "eu", texto: limpo, criado: new Date().toISOString() }]);
        return;
      }
      const sb = supabase();
      if (!sb || !sessao) return;
      const { data } = await sb
        .from("mensagens")
        .insert({ vinculo_id: vinculo.id, autor_id: sessao.user.id, texto: limpo })
        .select("id, autor_id, texto, criado")
        .single();
      if (data) setMensagens((m) => [...m, data as Mensagem]);
    },
    [vinculo, sessao],
  );

  const encerrarVinculo = useCallback(async () => {
    if (modoRef.current !== "demo" && vinculo) await supabase()?.from("vinculos").delete().eq("id", vinculo.id);
    setVinculo(null);
    setMensagens([]);
  }, [vinculo]);

  const recarregarFamilia = useCallback(async () => {
    if (sessao) await carregarFamilia(sessao.user.id);
  }, [sessao, carregarFamilia]);

  const valor = useMemo<Contexto>(
    () => ({
      modo,
      estado,
      usuarioId: modo === "demo" ? "eu" : (sessao?.user.id ?? null),
      email: sessao?.user.email ?? null,
      atualizar,
      entrarDemo,
      iniciarConta,
      sair,
      apagarTudo,
      vinculo: vinculoVisivel,
      mensagens,
      criarConvite,
      aceitarConvite,
      enviarMensagem,
      encerrarVinculo,
      recarregarFamilia,
    }),
    [modo, estado, sessao, atualizar, entrarDemo, iniciarConta, sair, apagarTudo, vinculoVisivel, mensagens, criarConvite, aceitarConvite, enviarMensagem, encerrarVinculo, recarregarFamilia],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useEstado() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useEstado fora do ProvedorEstado");
  return c;
}
