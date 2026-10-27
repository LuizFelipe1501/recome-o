"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useEstado } from "@/lib/estado";
import { supabase, supabaseConfigurado } from "@/lib/supabase";
import type { Papel } from "@/lib/tipos";

function Formulario() {
  const router = useRouter();
  const { modo, entrarDemo } = useEstado();
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
    if (p === "familiar") setPapel("familiar");
  }, []);

  useEffect(() => {
    if (modo === "conta" || modo === "demo") router.replace("/app");
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
        options: { data: { papel, nome } },
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

  return (
    <div className="mx-auto max-w-lg px-5 py-6">
      <Link href="/" className="font-titulo text-xl font-extrabold text-mare-escura">
        Recomeço
      </Link>

      <h1 className="mt-10 text-3xl font-extrabold">{aba === "criar" ? "Vamos começar" : "Que bom te ver de novo"}</h1>

      <fieldset className="mt-6">
        <legend className="rotulo">Você está aqui para</legend>
        <div className="grid gap-2" role="radiogroup">
          <button type="button" role="radio" aria-checked={papel === "apostador"} className="opcao" onClick={() => setPapel("apostador")}>
            <strong>Parar ou diminuir as minhas apostas</strong>
          </button>
          <button type="button" role="radio" aria-checked={papel === "familiar"} className="opcao" onClick={() => setPapel("familiar")}>
            <strong>Ajudar alguém que aposta</strong>
            <span className="block text-sm text-ardosia-suave">Família, parceiro ou amigo</span>
          </button>
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
            <button type="submit" className="botao w-full" disabled={enviando}>
              {enviando ? "Aguarde..." : aba === "criar" ? "Criar conta" : "Entrar"}
            </button>
          </form>
        </>
      ) : (
        <p className="mt-8 rounded-2xl bg-sol-claro p-4">
          O login ainda não foi configurado neste endereço. Você pode testar tudo no modo demonstração.
        </p>
      )}

      <div className="mt-8 border-t border-nuvem pt-6">
        <p className="text-ardosia-suave">Quer só conhecer antes? Os dados ficam apenas neste aparelho.</p>
        <button type="button" onClick={demo} className="botao-linha mt-3 w-full">
          Testar sem criar conta
        </button>
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
