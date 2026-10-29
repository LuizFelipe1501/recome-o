"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useEstado } from "@/lib/estado";
import { falar, pararFala, vozSuportada } from "@/lib/voz";
import { IconeSom } from "./ui";

// Leitura de tela do próprio app: lê a tela atual em voz alta, bloco por bloco,
// destacando o que está sendo lido. Funciona sem instalar nada, com a voz do aparelho.
// Quem já usa TalkBack ou VoiceOver continua podendo usar: o app tem rótulos para isso.

const SELETOR = [
  "h1", "h2", "h3", "h4", "h5", "p", "li", "button", "a[href]", "label", "dt", "dd", "blockquote",
  "figcaption", "th", "td", "summary", "legend", "input:not([type=hidden])", "textarea", "select",
  '[role="status"]', '[role="alert"]', "[aria-live]", '[role="progressbar"]', "[data-ler]",
].join(",");

type Bloco = { el: HTMLElement; texto: string };

const limpar = (t: string) => t.replace(/\s+/g, " ").trim();

function rotuloDoCampo(el: HTMLElement) {
  const id = el.id;
  const label = id ? document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`) : null;
  return limpar(el.getAttribute("aria-label") ?? label?.innerText ?? el.getAttribute("placeholder") ?? "");
}

function textoDoBloco(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();
  const role = el.getAttribute("role");
  const aria = el.getAttribute("aria-label");
  // Sem pontuação no fim, para não falar ".." quando acrescentamos o ponto
  const proprio = limpar(aria ?? el.innerText ?? "").replace(/[.!?;:]+$/, "");

  if (tag === "input" || tag === "textarea" || tag === "select") {
    const campo = el as HTMLInputElement;
    if (campo.type === "checkbox" || campo.type === "radio") return `Caixa ${campo.checked ? "marcada" : "não marcada"}: ${rotuloDoCampo(el)}`;
    const valor = tag === "select" ? (el as HTMLSelectElement).selectedOptions[0]?.text : campo.value;
    return `Campo ${rotuloDoCampo(el)}. ${valor ? `Preenchido com ${valor}` : "Vazio"}.`;
  }
  if (!proprio) return "";
  if (!/^(h[1-5]|button|a)$/.test(tag) && (!role || role === "status" || role === "alert")) return limpar(aria ?? el.innerText ?? "");
  if (/^h[1-5]$/.test(tag)) return `Título. ${proprio}.`;
  if (role === "progressbar") return `${proprio}: ${el.getAttribute("aria-valuenow") ?? 0} por cento.`;
  if (role === "switch") return `Interruptor ${el.getAttribute("aria-checked") === "true" ? "ligado" : "desligado"}. ${proprio}.`;
  if (role === "radio") return `Opção ${el.getAttribute("aria-checked") === "true" ? "marcada" : ""}. ${proprio}.`;
  if (tag === "button" || role === "button") {
    const press = el.getAttribute("aria-pressed");
    return `Botão${press === "true" ? " ativo" : ""}. ${proprio}.`;
  }
  if (tag === "a") return `Link. ${proprio}.`;
  return proprio;
}

function visivel(el: HTMLElement) {
  if (!el.getClientRects().length) return false;
  const st = getComputedStyle(el);
  return st.visibility !== "hidden" && st.display !== "none";
}

// Junta os blocos da tela, de cima para baixo, sem repetir texto de elementos aninhados
function coletarBlocos(): Bloco[] {
  const raiz =
    document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]') ?? document.getElementById("conteudo");
  if (!raiz) return [];
  // Também pega textos soltos em div/span (ex.: falas do Caramelo), na ordem em que aparecem
  const soltos = Array.from(raiz.querySelectorAll<HTMLElement>("div, span, strong, em, small, b")).filter((el) =>
    Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim()),
  );
  const todos = [...new Set([...raiz.querySelectorAll<HTMLElement>(SELETOR), ...soltos])].sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  );
  const candidatos = todos.filter(
    (el) =>
      !el.closest('[aria-hidden="true"], [data-nao-ler]') &&
      visivel(el) &&
      // Item de lista ou parágrafo com botão dentro: lê o botão (que tem o rótulo certo), não o texto solto
      (interativo(el) || !el.querySelector(INTERATIVOS)),
  );
  const conjunto = new Set(candidatos);
  const blocos: Bloco[] = [];
  for (const el of candidatos) {
    let pai = el.parentElement;
    let dentro = false;
    while (pai && pai !== raiz) {
      if (conjunto.has(pai)) {
        dentro = true;
        break;
      }
      pai = pai.parentElement;
    }
    if (dentro) continue;
    const texto = textoDoBloco(el);
    if (texto) blocos.push({ el, texto: falavel(texto) });
  }
  return juntarCurtos(blocos);
}

const INTERATIVOS = 'button, a[href], input:not([type=hidden]), textarea, select, [role="button"], [role="switch"], [role="radio"]';
const interativo = (el: HTMLElement) => el.matches(INTERATIVOS);
const separado = (el: HTMLElement) => interativo(el) || /^(li|h[1-5]|dt|dd|label|legend)$/i.test(el.tagName);

// Números como "0/5" e "3/20" viram "0 de 5" e "3 de 20"
const falavel = (t: string) => t.replace(/(\d+)\s*\/\s*(\d+)/g, "$1 de $2");

// Textos curtos lado a lado no mesmo cartão (ex.: "0 de 5" e "dias na semana") são lidos juntos
function juntarCurtos(blocos: Bloco[]): Bloco[] {
  const saida: Bloco[] = [];
  for (const b of blocos) {
    const ant = saida[saida.length - 1];
    const curto = b.texto.length < 40 && !separado(b.el);
    if (ant && curto && ant.texto.length < 120 && !separado(ant.el) && b.el.parentElement && (ant.el === b.el.parentElement || ant.el.parentElement === b.el.parentElement)) {
      const pai = b.el.parentElement;
      saida[saida.length - 1] = { el: pai, texto: `${ant.texto} ${b.texto}` };
      continue;
    }
    saida.push(b);
  }
  return saida;
}

type Leitor = {
  disponivel: boolean;
  ativo: boolean;
  lendo: boolean;
  iniciar: () => void;
  parar: () => void;
};

const ContextoLeitor = createContext<Leitor>({ disponivel: false, ativo: false, lendo: false, iniciar: () => {}, parar: () => {} });

export function ProvedorLeitor({ children }: { children: ReactNode }) {
  const { estado } = useEstado();
  const caminho = usePathname();
  const [disponivel, setDisponivel] = useState(false);
  const [lendo, setLendo] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [atual, setAtual] = useState<{ texto: string; n: number; total: number } | null>(null);
  const [posicao, setPosicao] = useState(-1);
  const elAtual = useRef<HTMLElement | null>(null);
  const indiceAtual = useRef(0);
  const ativo = Boolean(estado?.prefs.leitorTela);
  const velocidade = estado?.prefs.velocidadeVoz ?? 1;
  const voz = estado?.prefs.voz || undefined;
  const legendas = estado?.prefs.legendas ?? true;
  const reduzido = estado?.prefs.movimento === "reduzido";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisponivel(vozSuportada());
  }, []);

  const marcar = (el: HTMLElement | null) => {
    elAtual.current?.removeAttribute("data-lendo");
    elAtual.current = el;
    el?.setAttribute("data-lendo", "");
  };

  const encerrar = useCallback(() => {
    pararFala();
    marcar(null);
    setLendo(false);
    setPausado(false);
    setAtual(null);
    setPosicao(-1);
  }, []);

  // Guarda a versão mais nova de lerRelativo para o avanço automático
  const lerRelativoRef = useRef<(deslocamento: number) => void>(() => {});

  // Lê o bloco na posição "deslocamento" a partir do bloco atual
  const lerRelativo = useCallback(
    (deslocamento: number) => {
      const blocos = coletarBlocos();
      if (!blocos.length) {
        falar("Não encontrei texto para ler nesta tela.", { velocidade, vozURI: voz });
        encerrar();
        return;
      }
      // Acha o bloco atual na tela (que pode ter mudado); se houver repetidos, fica com o mais perto de onde parou
      let i = -1;
      blocos.forEach((b, k) => {
        if (b.el === elAtual.current && (i === -1 || Math.abs(k - indiceAtual.current) < Math.abs(i - indiceAtual.current))) i = k;
      });
      if (i === -1 && deslocamento <= 0) i = 0;
      else i = Math.max(0, i + deslocamento);
      const bloco = blocos[i];
      if (!bloco) {
        falar("Fim da tela.", { velocidade, vozURI: voz });
        encerrar();
        return;
      }
      marcar(bloco.el);
      indiceAtual.current = i;
      bloco.el.scrollIntoView({ block: "center", behavior: reduzido ? "auto" : "smooth" });
      setAtual({ texto: bloco.texto, n: i + 1, total: blocos.length });
      setPosicao(0);
      setPausado(false);
      setLendo(true);
      falar(bloco.texto, {
        velocidade,
        vozURI: voz,
        aoLimite: setPosicao,
        aoFim: (interrompida) => {
          if (!interrompida) lerRelativoRef.current(1);
        },
      });
    },
    [encerrar, reduzido, velocidade, voz],
  );
  useEffect(() => {
    lerRelativoRef.current = lerRelativo;
  }, [lerRelativo]);

  const iniciar = useCallback(() => {
    marcar(null);
    lerRelativo(0);
  }, [lerRelativo]);

  // Trocou de tela: para a leitura
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    encerrar();
  }, [caminho, encerrar]);

  // Desligou nos ajustes: para a leitura
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!ativo) encerrar();
  }, [ativo, encerrar]);

  // Janela (diálogo) aberta cobre o botão Ler do topo: mostramos um botão Ler por cima dela
  const [dialogo, setDialogo] = useState(false);
  useEffect(() => {
    if (!ativo) return;
    const ver = () => setDialogo(Boolean(document.querySelector('[role="dialog"][aria-modal="true"]')));
    ver();
    const obs = new MutationObserver(ver);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [ativo]);

  useEffect(() => {
    if (!lendo) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") encerrar();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [lendo, encerrar]);

  const pausar = () => {
    // Pausar de verdade falha em vários celulares: paramos e, ao continuar, relemos o bloco
    pararFala();
    setPausado(true);
  };

  const palavras: { p: string; ini: number }[] = [];
  if (atual) {
    const re = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(atual.texto))) palavras.push({ p: m[0], ini: m.index });
  }
  const palavraAtual = palavras.findLastIndex((w) => w.ini <= posicao);

  return (
    <ContextoLeitor.Provider value={{ disponivel, ativo: ativo && disponivel, lendo, iniciar, parar: encerrar }}>
      {children}
      {ativo && disponivel && dialogo && !lendo && (
        <button
          type="button"
          data-nao-ler
          onClick={iniciar}
          className="fixed right-3 top-3 z-[61] flex min-h-12 items-center gap-1.5 rounded-xl border-[3px] border-ardosia bg-sol px-4 font-bold shadow-[0_4px_0_var(--ardosia)] active:translate-y-0.5"
        >
          <IconeSom />
          Ler
        </button>
      )}
      {lendo && atual && (
        <div
          data-nao-ler
          role="region"
          aria-label="Controles da leitura de tela"
          className="surgir fixed inset-x-2 top-2 z-[60] mx-auto max-w-lg rounded-2xl border-[3px] border-ardosia bg-white p-3 shadow-[0_5px_0_var(--ardosia)] lg:left-auto lg:right-6 lg:top-6 lg:w-[26rem]"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="pixel text-[0.65rem] text-ardosia-suave">
              {pausado ? "PAUSADO" : "LENDO A TELA"} · {atual.n} DE {atual.total}
            </p>
            <button type="button" onClick={encerrar} className="rounded-lg px-2 text-2xl leading-none hover:bg-ceu" aria-label="Fechar leitura de tela">
              ×
            </button>
          </div>
          {legendas && (
            <p className="mt-1 max-h-28 overflow-y-auto text-base leading-relaxed" aria-hidden="true">
              {palavras.map((w, i) => (
                <span key={i} className={i === palavraAtual && !pausado ? "legenda-palavra" : undefined}>
                  {w.p}{" "}
                </span>
              ))}
            </p>
          )}
          <div className="mt-2 grid grid-cols-4 gap-2">
            <BotaoControle rotulo="Voltar" aoClicar={() => lerRelativo(-1)} icone="M15 6l-6 6 6 6" />
            {pausado ? (
              <BotaoControle rotulo="Continuar" aoClicar={() => lerRelativo(0)} icone="M8 5l11 7-11 7Z" destaque />
            ) : (
              <BotaoControle rotulo="Pausar" aoClicar={pausar} icone="M8 5v14M16 5v14" destaque />
            )}
            <BotaoControle rotulo="Avançar" aoClicar={() => lerRelativo(1)} icone="M9 6l6 6-6 6" />
            <BotaoControle rotulo="Parar" aoClicar={encerrar} icone="M6 6h12v12H6Z" />
          </div>
        </div>
      )}
    </ContextoLeitor.Provider>
  );
}

function BotaoControle({ rotulo, aoClicar, icone, destaque }: { rotulo: string; aoClicar: () => void; icone: string; destaque?: boolean }) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl border-[3px] border-ardosia text-xs font-bold shadow-[0_3px_0_var(--ardosia)] active:translate-y-0.5 ${
        destaque ? "bg-sol" : "bg-white hover:bg-ceu"
      }`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d={icone} />
      </svg>
      {rotulo}
    </button>
  );
}

export function useLeitor() {
  return useContext(ContextoLeitor);
}

// Botão que começa a ler a tela. Só aparece com a leitura de tela ligada nos Ajustes.
export function BotaoLerTela({ compacto = false }: { compacto?: boolean }) {
  const { ativo, lendo, iniciar, parar } = useLeitor();
  if (!ativo) return null;
  return (
    <button
      type="button"
      onClick={lendo ? parar : iniciar}
      aria-pressed={lendo}
      className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-[3px] border-ardosia px-3 font-bold shadow-[0_3px_0_var(--ardosia)] active:translate-y-0.5 ${
        lendo ? "bg-sol-claro" : "bg-white"
      } ${compacto ? "" : "w-full py-2"}`}
    >
      <IconeSom />
      {lendo ? "Parar leitura" : compacto ? "Ler" : "Ler a tela"}
    </button>
  );
}
