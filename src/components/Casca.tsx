"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEstado } from "@/lib/estado";
import { Mascote } from "./Mascote";
import { ProvedorRecompensa } from "./Jogo";
import { ResumoDiario } from "./ResumoDiario";
import { ProvedorDupla } from "@/lib/dupla";

const abasApostador = [
  { href: "/app", rotulo: "Hoje", icone: "sol" },
  { href: "/app/trilha", rotulo: "Trilha", icone: "trilha" },
  { href: "/app/dupla", rotulo: "Dupla", icone: "pessoas" },
  { href: "/app/dividas", rotulo: "Desenrola", icone: "carteira" },
  { href: "/app/apoio", rotulo: "Apoio", icone: "mao" },
] as const;

const abasFamiliar = [
  { href: "/app", rotulo: "Hoje", icone: "sol" },
  { href: "/app/dupla", rotulo: "Dupla", icone: "pessoas" },
  { href: "/app/trilha", rotulo: "Trilha", icone: "trilha" },
  { href: "/app/conversa", rotulo: "Conversar", icone: "balao" },
  { href: "/app/apoio", rotulo: "Apoio", icone: "mao" },
] as const;

function Icone({ nome }: { nome: string }) {
  const p = { stroke: "currentColor", strokeWidth: 2, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      {nome === "sol" && (
        <>
          <circle cx="12" cy="12" r="4" {...p} />
          <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" {...p} />
        </>
      )}
      {nome === "carteira" && (
        <>
          <rect x="3" y="6" width="18" height="13" rx="3" {...p} />
          <path d="M16 12.5h2M3 9h15a3 3 0 0 0-3-3" {...p} />
        </>
      )}
      {nome === "pessoas" && (
        <>
          <circle cx="9" cy="8" r="3.2" {...p} />
          <path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5" {...p} />
          <circle cx="17" cy="9" r="2.5" {...p} />
          <path d="M17 14c2.2.2 3.6 1.6 4 4" {...p} />
        </>
      )}
      {nome === "mao" && <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" {...p} />}
      {nome === "trilha" && (
        <>
          <path d="M5 21V4" {...p} />
          <path d="M5 4h11l-2 3.5L16 11H5" {...p} />
        </>
      )}
      {nome === "balao" && <path d="M4 5h16v11H9l-5 4V5Z" {...p} />}
      {nome === "ajustes" && (
        <>
          <circle cx="12" cy="12" r="3" {...p} />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" {...p} />
        </>
      )}
    </svg>
  );
}

export function Casca({ children }: { children: ReactNode }) {
  const caminho = usePathname();
  const { estado, modo } = useEstado();
  const familiar = estado?.perfil.papel === "familiar";
  const abas = familiar ? abasFamiliar : abasApostador;
  const naCrise = caminho.startsWith("/app/crise");
  const noInicio = caminho.startsWith("/app/comecar");
  const ativa = (href: string) => (href === "/app" ? caminho === "/app" : caminho.startsWith(href));

  const botaoVontade = (
    <Link
      href="/app/crise"
      className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-[3px] border-ardosia bg-ardosia px-6 font-titulo text-lg font-bold text-white shadow-[0_5px_0_#000] transition-transform active:translate-y-1 hover:bg-mare-escura"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 16a4 4 0 0 1 .5-8 5.5 5.5 0 0 1 10.6 1.5A3.5 3.5 0 0 1 17 16H6Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      Estou com vontade
    </Link>
  );

  return (
    <ProvedorRecompensa>
      <ProvedorDupla>
      <ResumoDiario />
      <div className={`min-h-dvh ${noInicio ? "" : "lg:grid lg:grid-cols-[17rem_1fr]"}`}>
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
          Pular para o conteúdo
        </a>

        {/* Menu lateral no computador */}
        {!noInicio && (
          <aside className="sticky top-0 hidden h-dvh flex-col border-r-[3px] border-ardosia bg-sol px-4 py-6 lg:flex">
            <Link href="/app" className="flex items-center gap-2">
              <Mascote tamanho={52} animacao="parado" />
              <span className="font-titulo text-2xl font-extrabold text-ardosia">NonBet</span>
            </Link>
            <nav aria-label="Seções" className="mt-8 flex-1">
              <ul className="space-y-2">
                {abas.map((a) => (
                  <li key={a.href}>
                    <Link
                      href={a.href}
                      aria-current={ativa(a.href) ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl border-[3px] px-3 py-2.5 font-bold transition-transform ${
                        ativa(a.href) ? "border-ardosia bg-white shadow-[0_4px_0_var(--ardosia)]" : "border-transparent hover:bg-white/50"
                      }`}
                    >
                      <Icone nome={a.icone} />
                      {a.rotulo}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/app/ajustes"
                    aria-current={ativa("/app/ajustes") ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl border-[3px] px-3 py-2.5 font-bold ${
                      ativa("/app/ajustes") ? "border-ardosia bg-white shadow-[0_4px_0_var(--ardosia)]" : "border-transparent hover:bg-white/50"
                    }`}
                  >
                    <Icone nome="ajustes" />
                    Ajustes
                  </Link>
                </li>
              </ul>
            </nav>
            {modo === "demo" && <p className="pixel mb-3 text-center text-xs">MODO DEMONSTRAÇÃO</p>}
            {!familiar && !naCrise && botaoVontade}
          </aside>
        )}

        <div className="flex min-h-dvh min-w-0 flex-col">
          <header className="flex items-center justify-between border-b-[3px] border-ardosia bg-sol px-4 py-2.5 lg:hidden">
            <Link href="/app" className="flex items-center gap-1.5">
              <Mascote tamanho={34} animacao="parado" />
              <span className="font-titulo text-xl font-extrabold text-ardosia">NonBet</span>
            </Link>
            <div className="flex items-center gap-2">
              {modo === "demo" && <span className="pixel rounded-md border-2 border-ardosia bg-white px-2 py-0.5 text-[0.65rem]">DEMO</span>}
              <Link
                href="/app/ajustes"
                aria-current={ativa("/app/ajustes") ? "page" : undefined}
                className={`flex min-h-11 items-center gap-1.5 rounded-xl border-[3px] border-ardosia px-3 font-bold shadow-[0_3px_0_var(--ardosia)] active:translate-y-0.5 ${
                  ativa("/app/ajustes") ? "bg-sol-claro" : "bg-white"
                }`}
              >
                <Icone nome="ajustes" />
                Ajustes
              </Link>
            </div>
          </header>

          <main id="conteudo" className={`mx-auto w-full flex-1 px-4 sm:px-5 lg:px-10 lg:pb-16 lg:pt-6 ${noInicio ? "max-w-5xl pb-10" : "max-w-lg pb-44 lg:max-w-4xl"}`}>
            {children}
          </main>
        </div>

        {/* Barra inferior no celular */}
        {!noInicio && (
          <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
            {!naCrise && !familiar && <div className="mx-auto mb-3 max-w-lg px-4">{botaoVontade}</div>}
            <nav aria-label="Seções" className="border-t-[3px] border-ardosia bg-white pb-[env(safe-area-inset-bottom)]">
              <ul className="mx-auto flex max-w-lg justify-around">
                {abas.map((a) => (
                  <li key={a.href} className="flex-1">
                    <Link
                      href={a.href}
                      aria-current={ativa(a.href) ? "page" : undefined}
                      className={`flex flex-col items-center gap-0.5 py-2 text-xs font-bold ${ativa(a.href) ? "text-ardosia" : "text-ardosia-suave"}`}
                    >
                      <span className={`grid h-9 w-12 place-items-center rounded-xl border-2 ${ativa(a.href) ? "border-ardosia bg-sol" : "border-transparent"}`}>
                        <Icone nome={a.icone} />
                      </span>
                      {a.rotulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
      </ProvedorDupla>
    </ProvedorRecompensa>
  );
}
