"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useEstado } from "@/lib/estado";
import { Fala, Mascote } from "@/components/Mascote";
import { supabase, supabaseConfigurado } from "@/lib/supabase";
import type { Papel } from "@/lib/tipos";

function Formulario() {
  const router = useRouter();
  const { modo, entrarDemo, estado } = useEstado();
  const [papel, setPapel] = useState<Papel>("apostador");
  const [aba, setAba] = useState<"criar" | "entrar">("criar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("papel");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (p === "familiar" || p === "apostador") setPapel(p);
  }, []);

  useEffect(() => {
    // Só pula esta tela para quem tem conta. Na demonstração, a pessoa escolhe o papel de novo.
    if (modo === "conta") router.replace("/app");
  }, [modo, router]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    const sb = supabase();
    if (!sb) return;
    setEnviando(true);
    if (aba === "criar") {
      const { data, error } = await sb.auth.signUp({
        email,
        password: senha,
        options: { data: { papel, nome }, emailRedirectTo: `${window.location.origin}/entrar` },
      });
      if (error) setErro(traduzir(error.message));
      else if (!data.session) setAviso("Conta criada. Confira seu e-mail para confirmar e depois entre por aqui.");
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password: senha });
      if (error) setErro(traduzir(error.message));
    }
    setEnviando(false);
  };

  const demo = () => {
    entrarDemo(papel);
    router.replace("/app");
  };

  const papelAtual = modo === "demo" ? estado?.perfil.papel : undefined;

  return (
    <div className="min-h-dvh bg-sol">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12 lg:py-16">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <Mascote tamanho={44} animacao="parado" />
            <span className="font-titulo text-2xl font-extrabold">Recomeço</span>
          </Link>
          <div className="mt-8 hidden lg:block">
            <Fala humor="feliz" tamanho={150}>
              Oi! Eu sou o Caramelo. Vou te acompanhar todo dia, seja para parar de apostar, seja para ajudar alguém querido.
            </Fala>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] border-[3px] border-ardosia bg-white p-5 shadow-[0_6px_0_var(--ardosia)] sm:p-7 lg:mt-0">
          <h1 className="text-3xl font-extrabold">{aba === "criar" ? "Vamos começar" : "Que bom te ver de novo"}</h1>

          {papelAtual && (
            <div className="mt-4 rounded-2xl border-[3px] border-ardosia bg-ceu p-4">
              <p className="font-bold">
                Você já tem uma demonstração aberta como {papelAtual === "familiar" ? "quem apoia" : "quem quer parar"}.
              </p>
              <button type="button" className="botao-jogo botao-jogo-azul mt-3 w-full" onClick={() => router.push("/app")}>
                Continuar de onde parei
              </button>
              <p className="mt-2 text-sm text-ardosia-suave">Ou escolha abaixo para começar outra.</p>
            </div>
          )}

          <fieldset className="mt-6">
            <legend className="rotulo">Você está aqui para</legend>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
              {([
                { p: "apostador", titulo: "Parar ou diminuir as minhas apostas", sub: "Trilha de 4 fases, desenrola de dívidas e botão para a hora da vontade", cor: "var(--mare)" },
                { p: "familiar", titulo: "Ajudar alguém que aposta", sub: "Família, parceiro ou amigo. Trilha de 5 fases baseada no método CRAFT", cor: "var(--menta)" },
              ] as const).map((o) => (
                <button
                  key={o.p}
                  type="button"
                  role="radio"
                  aria-checked={papel === o.p}
                  onClick={() => setPapel(o.p)}
                  className={`relative rounded-2xl border-[3px] border-ardosia p-4 text-left transition-transform ${
                    papel === o.p ? "translate-y-1 bg-sol shadow-[0_1px_0_var(--ardosia)]" : "bg-white shadow-[0_5px_0_var(--ardosia)] hover:-translate-y-0.5"
                  }`}
                >
                  <span className="mb-2 block h-2 w-10 rounded-full" style={{ background: o.cor }} aria-hidden="true" />
                  <strong className="block text-lg leading-tight">{o.titulo}</strong>
                  <span className="mt-1 block text-sm text-ardosia-suave">{o.sub}</span>
                  {papel === o.p && <span className="pixel absolute right-3 top-3 text-xs">✔</span>}
                </button>
              ))}
            </div>
          </fieldset>

      {supabaseConfigurado ? (
        <>
          <div className="mt-8 flex gap-2" role="tablist">
            {(["criar", "entrar"] as const).map((a) => (
              <button
                key={a}
                type="button"
                role="tab"
                aria-selected={aba === a}
                onClick={() => setAba(a)}
                className={`rounded-full px-4 py-2 font-bold ${aba === a ? "bg-ardosia text-white" : "text-ardosia-suave hover:bg-ceu"}`}
              >
                {a === "criar" ? "Criar conta" : "Já tenho conta"}
              </button>
            ))}
          </div>

          <form onSubmit={enviar} className="mt-5 space-y-4">
            {aba === "criar" && (
              <div>
                <label className="rotulo" htmlFor="nome">
                  Como quer ser chamado
                </label>
                <input id="nome" className="campo" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="nickname" />
                <p className="mt-1 text-sm text-ardosia-suave">Pode ser um apelido.</p>
              </div>
            )}
            <div>
              <label className="rotulo" htmlFor="email">
                E-mail
              </label>
              <input id="email" type="email" required className="campo" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <label className="rotulo" htmlFor="senha">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                required
                minLength={6}
                className="campo"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete={aba === "criar" ? "new-password" : "current-password"}
              />
            </div>
            {erro && (
              <p role="alert" className="font-bold text-telha">
                {erro}
              </p>
            )}
            {aviso && (
              <p role="status" className="font-bold text-mare-escura">
                {aviso}
              </p>
            )}
            <button type="submit" className="botao-jogo botao-jogo-azul w-full" disabled={enviando}>
              {enviando ? "Aguarde..." : aba === "criar" ? "Criar conta" : "Entrar"}
            </button>
          </form>
        </>
      ) : (
        <p className="mt-8 rounded-2xl bg-sol-claro p-4">
          O login ainda não foi configurado neste endereço. Você pode testar tudo no modo demonstração.
        </p>
      )}

          <div className="mt-8 border-t-2 border-nuvem pt-6">
            <p className="text-ardosia-suave">Quer só conhecer antes? Os dados ficam apenas neste aparelho.</p>
            <button type="button" onClick={demo} className="botao-jogo mt-3 w-full text-lg">
              Testar sem criar conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function traduzir(msg: string) {
  if (msg.includes("Invalid login")) return "E-mail ou senha não conferem.";
  if (msg.includes("already registered")) return "Esse e-mail já tem conta. Use a aba Já tenho conta.";
  if (msg.includes("Password should")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (msg.includes("Email not confirmed")) return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  return "Não deu certo. Confira os dados e tente de novo.";
}

export default function Entrar() {
  return (
    <Suspense>
      <Formulario />
    </Suspense>
  );
}
