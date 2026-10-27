"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEstado } from "@/lib/estado";

const abasApostador = [
  { href: "/app", rotulo: "Hoje", icone: "sol" },
  { href: "/app/trilha", rotulo: "Trilha", icone: "trilha" },
  { href: "/app/dividas", rotulo: "Desenrola", icone: "carteira" },
  { href: "/app/familia", rotulo: "Família", icone: "pessoas" },
  { href: "/app/apoio", rotulo: "Apoio", icone: "mao" },
] as const;

const abasFamiliar = [
  { href: "/app", rotulo: "Hoje", icone: "sol" },
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

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Pular para o conteúdo
      </a>
      <header className="flex items-center justify-between px-5 pb-2 pt-5">
        <Link href="/app" className="font-titulo text-xl font-extrabold text-mare-escura">
          Recomeço
        </Link>
        <div className="flex items-center gap-2">
          {modo === "demo" && <span className="rounded-full bg-sol-claro px-3 py-1 text-xs font-bold">Demonstração</span>}
          <Link href="/app/ajustes" className="rounded-full px-3 py-1.5 text-sm font-bold text-ardosia-suave hover:bg-ceu">
            Ajustes
          </Link>
        </div>
      </header>

      <main id="conteudo" className={`flex-1 px-5 ${noInicio ? "pb-10" : "pb-44"}`}>
        {children}
      </main>

      {!noInicio && (
        <div className="fixed inset-x-0 bottom-0 z-30">
          <div className="mx-auto max-w-lg px-4">
            {!naCrise && !familiar && (
              <Link
                href="/app/crise"
                className="mb-3 flex min-h-14 items-center justify-center gap-2 rounded-full bg-ardosia px-6 font-titulo text-lg font-bold text-white shadow-[0_10px_24px_-8px_rgba(20,27,61,0.55)] hover:bg-mare-escura"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 16a4 4 0 0 1 .5-8 5.5 5.5 0 0 1 10.6 1.5A3.5 3.5 0 0 1 17 16H6Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                Estou com vontade
              </Link>
            )}
          </div>
          <nav aria-label="Seções" className="border-t border-nuvem bg-white/95 backdrop-blur">
            <ul className="mx-auto flex max-w-lg justify-around">
              {abas.map((a) => {
                const ativa = a.href === "/app" ? caminho === "/app" : caminho.startsWith(a.href);
                return (
                  <li key={a.href} className="flex-1">
                    <Link
                      href={a.href}
                      aria-current={ativa ? "page" : undefined}
                      className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-bold ${ativa ? "text-mare-escura" : "text-ardosia-suave"}`}
                    >
                      <Icone nome={a.icone} />
                      {a.rotulo}
                      <span className={`mt-0.5 h-1 w-6 rounded-full ${ativa ? "bg-sol" : "bg-transparent"}`} aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
