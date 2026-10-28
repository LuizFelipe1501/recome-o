"use client";

import type { ReactNode } from "react";

// Cachorro caramelo em pixel art, com colete amarelo e gravata azul.
// Personagem original do NonBet, sem logotipo de nenhuma marca.
const BASE = [
  "........................",
  "......KKKKKKKKKKKK......",
  ".....KCCCCCCCCCCCCK.....",
  "..KKKCCCCCCCCCCCCCCKKK..",
  ".KNNNKCCCCCCCCCCCCKNNNK.",
  ".KNNNKCCCCCCCCCCCCKNNNK.",
  ".KNNKCCEECCCCCCEECCKNNK.",
  ".KNNKCCEWCCCCCCEWCCKNNK.",
  "..KNKCCCCCLLLLCCCCCKNK..",
  "..KNKCCCCLLLLLLCCCCKNK..",
  "...KKCCCLLLNNLLLCCCKK...",
  ".....KCCLLLNNLLLCCK.....",
  ".....KCLLLKLLKLLLCK.....",
  "......KLLLLKKLLLLK......",
  "......KKLLLPPLLLKK......",
  "........KKKPPKKK........",
  "......KBBYYYYYYBBK......",
  ".....KYYYYYBBYYYYYK.....",
  "....KCYYYYYBBYYYYYCK....",
  "....KCWYYYYBBYYYYWCK....",
  "....KCDDDDDDDDDDDDCK....",
  "....KLLKBBBBBBBBKLLK....",
  ".....KKK.KKKKKK.KKK.....",
  "........................",
];

const CORES: Record<string, string> = {
  K: "#3b2414",
  C: "#d9893b",
  L: "#f4c88f",
  E: "#1b1b1b",
  W: "#ffffff",
  N: "#2a1a10",
  P: "#f27e8e",
  Y: "#fcfc30",
  B: "#3b53f0",
  D: "#2537c4",
  R: "#e86a8a",
  T: "#5fb8ff",
  H: "#e8304a",
};

export type Humor =
  | "normal"
  | "feliz"
  | "preocupado"
  | "dormindo"
  | "desmaiado"
  | "triste"
  | "surpreso"
  | "apaixonado"
  | "emocionado"
  | "pensativo"
  | "animado"
  | "piscadinha";

// Nome de cada humor, para leitores de tela
export const nomeHumor: Record<Humor, string> = {
  normal: "atento",
  feliz: "feliz",
  preocupado: "preocupado",
  dormindo: "dormindo",
  desmaiado: "desmaiado de saudade",
  triste: "triste, com uma lágrima",
  surpreso: "surpreso",
  apaixonado: "com olhos de coração",
  emocionado: "emocionado, chorando de alegria",
  pensativo: "pensativo",
  animado: "animado",
  piscadinha: "dando uma piscadinha",
};

type Pixel = [number, number, string];

const LIMPA_OLHOS: Pixel[] = [
  [6, 7, "C"], [6, 8, "C"], [7, 7, "C"], [7, 8, "C"],
  [6, 15, "C"], [6, 16, "C"], [7, 15, "C"], [7, 16, "C"],
];
const OLHO_ESQ_FELIZ: Pixel[] = [[6, 7, "C"], [6, 8, "C"], [7, 7, "C"], [7, 8, "C"], [7, 6, "K"], [6, 7, "K"], [6, 8, "K"], [7, 9, "K"]];
const OLHO_DIR_FELIZ: Pixel[] = [[6, 15, "C"], [6, 16, "C"], [7, 15, "C"], [7, 16, "C"], [7, 14, "K"], [6, 15, "K"], [6, 16, "K"], [7, 17, "K"]];
const BOCHECHAS: Pixel[] = [[8, 6, "R"], [8, 17, "R"]];
const BOCA_FECHADA: Pixel[] = [[14, 11, "L"], [14, 12, "L"], [15, 11, "K"], [15, 12, "K"]];

const EXPRESSOES: Record<Humor, Pixel[]> = {
  normal: [],
  feliz: [...OLHO_ESQ_FELIZ, ...OLHO_DIR_FELIZ, ...BOCHECHAS],
  preocupado: [
    [5, 7, "K"], [5, 8, "K"], [4, 9, "K"],
    [4, 14, "K"], [5, 15, "K"], [5, 16, "K"],
    ...BOCA_FECHADA,
  ],
  // Olhos em X e língua para fora: desmaiou de saudade
  desmaiado: [
    [5, 6, "C"], [5, 7, "C"], [5, 8, "C"], [6, 6, "C"], [6, 7, "C"], [6, 8, "C"], [7, 6, "C"], [7, 7, "C"], [7, 8, "C"],
    [5, 15, "C"], [5, 16, "C"], [5, 17, "C"], [6, 15, "C"], [6, 16, "C"], [6, 17, "C"], [7, 15, "C"], [7, 16, "C"], [7, 17, "C"],
    [5, 6, "K"], [6, 7, "K"], [7, 8, "K"], [5, 8, "K"], [7, 6, "K"],
    [5, 15, "K"], [6, 16, "K"], [7, 17, "K"], [5, 17, "K"], [7, 15, "K"],
    [15, 11, "P"], [15, 12, "P"], [16, 11, "P"], [16, 12, "P"], [17, 11, "P"], [17, 12, "K"],
  ],
  dormindo: [
    [6, 7, "C"], [6, 8, "C"], [7, 7, "K"], [7, 8, "K"],
    [6, 15, "C"], [6, 16, "C"], [7, 15, "K"], [7, 16, "K"],
    ...BOCA_FECHADA,
  ],
  // Olhar para baixo, sobrancelha caída e uma lágrima
  triste: [
    ...LIMPA_OLHOS,
    [7, 7, "E"], [7, 8, "E"], [7, 15, "E"], [7, 16, "E"],
    [5, 6, "K"], [5, 7, "K"], [4, 8, "K"],
    [4, 15, "K"], [5, 16, "K"], [5, 17, "K"],
    [8, 8, "T"], [9, 8, "T"], [10, 8, "T"],
    ...BOCA_FECHADA,
  ],
  // Olhos arregalados e boca aberta
  surpreso: [
    [5, 7, "E"], [5, 8, "E"], [6, 7, "E"], [6, 8, "W"], [7, 7, "E"], [7, 8, "E"],
    [5, 15, "E"], [5, 16, "E"], [6, 15, "E"], [6, 16, "W"], [7, 15, "E"], [7, 16, "E"],
    [3, 7, "K"], [3, 8, "K"], [3, 15, "K"], [3, 16, "K"],
    [14, 11, "E"], [14, 12, "E"],
  ],
  // Olhos de coração
  apaixonado: [
    ...LIMPA_OLHOS,
    [5, 6, "H"], [5, 8, "H"], [6, 6, "H"], [6, 7, "H"], [6, 8, "H"], [7, 7, "H"],
    [5, 15, "H"], [5, 17, "H"], [6, 15, "H"], [6, 16, "H"], [6, 17, "H"], [7, 16, "H"],
    [8, 5, "R"], [8, 18, "R"],
  ],
  // Olhos fechados de alegria com lágrimas
  emocionado: [
    ...OLHO_ESQ_FELIZ, ...OLHO_DIR_FELIZ, ...BOCHECHAS,
    [8, 8, "T"], [9, 8, "T"], [8, 15, "T"], [9, 15, "T"], [10, 15, "T"],
  ],
  // Olhando para cima, boca fechada
  pensativo: [
    ...LIMPA_OLHOS,
    [6, 8, "E"], [5, 8, "E"], [6, 16, "E"], [5, 16, "E"],
    [4, 7, "K"], [4, 8, "K"], [4, 15, "K"], [4, 16, "K"],
    ...BOCA_FECHADA,
  ],
  animado: [...OLHO_ESQ_FELIZ, ...OLHO_DIR_FELIZ, ...BOCHECHAS, [4, 7, "K"], [4, 8, "K"], [4, 15, "K"], [4, 16, "K"]],
  piscadinha: [...OLHO_ESQ_FELIZ, ...BOCHECHAS],
};

// Humores em que o rabo abana
const ABANA: Humor[] = ["normal", "feliz", "surpreso", "apaixonado", "emocionado", "animado", "piscadinha"];

const PISCAR: Pixel[] = [
  [6, 7, "C"], [6, 8, "C"], [7, 7, "K"], [7, 8, "K"],
  [6, 15, "C"], [6, 16, "C"], [7, 15, "K"], [7, 16, "K"],
];

const RABO_A: Pixel[] = [[18, 20, "C"], [17, 21, "C"], [16, 22, "C"], [18, 21, "K"], [17, 22, "K"], [15, 22, "K"], [16, 23, "K"]];
const RABO_B: Pixel[] = [[19, 20, "C"], [19, 21, "C"], [19, 22, "C"], [18, 21, "K"], [18, 22, "K"], [20, 21, "K"], [20, 22, "K"], [19, 23, "K"]];

function Pixels({ lista }: { lista: Pixel[] }) {
  return (
    <>
      {lista.map(([y, x, c], i) => (
        <rect key={`${y}-${x}-${i}`} x={x} y={y} width="1.02" height="1.02" fill={CORES[c]} />
      ))}
    </>
  );
}

export function Mascote({
  tamanho = 96,
  humor = "normal",
  animacao = "idle",
  className = "",
  rotulo,
}: {
  tamanho?: number;
  humor?: Humor;
  animacao?: "idle" | "pula" | "parado" | "chacoalha" | "levanta";
  className?: string;
  rotulo?: string;
}) {
  const base: Pixel[] = [];
  BASE.forEach((linha, y) =>
    linha.split("").forEach((c, x) => {
      if (c !== ".") base.push([y, x, c]);
    }),
  );
  const classe =
    animacao === "chacoalha"
      ? "mascote-chacoalhando"
      : animacao === "levanta"
        ? "mascote-levantando"
        : humor === "desmaiado"
          ? animacao === "parado" ? "mascote-deitado" : "mascote-desmaiado"
          : animacao === "pula" || (animacao === "idle" && humor === "animado")
            ? "mascote-pula"
            : animacao === "idle"
              ? humor === "triste" ? "mascote-triste" : "mascote-idle"
              : "";

  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="-0.5 -0.5 25 25"
      className={`pixelado ${classe} ${className}`}
      role="img"
      aria-label={rotulo ?? `Caramelo, o mascote do NonBet, ${nomeHumor[humor]}`}
    >
      <Pixels lista={base} />
      <Pixels lista={EXPRESSOES[humor]} />
      {humor === "normal" && (
        <g className="piscar">
          <Pixels lista={PISCAR} />
        </g>
      )}
      {ABANA.includes(humor) ? (
        <>
          <g className="rabo-a">
            <Pixels lista={RABO_A} />
          </g>
          <g className="rabo-b">
            <Pixels lista={RABO_B} />
          </g>
        </>
      ) : (
        <Pixels lista={RABO_B} />
      )}
      {humor === "desmaiado" && (
        <g className="estrelas-tontas">
          <rect x="1" y="1" width="1" height="1" fill="#fcfc30" />
          <rect x="0" y="2" width="3" height="1" fill="#fcfc30" />
          <rect x="1" y="3" width="1" height="1" fill="#fcfc30" />
          <rect x="21" y="0" width="1" height="1" fill="#fcfc30" />
          <rect x="20" y="1" width="3" height="1" fill="#fcfc30" />
          <rect x="21" y="2" width="1" height="1" fill="#fcfc30" />
          <rect x="11" y="-0.5" width="1" height="1" fill="#ffffff" />
        </g>
      )}
      {humor === "apaixonado" && (
        <g className="coracao-flutuando">
          <Pixels lista={[[0, 20, "H"], [0, 22, "H"], [1, 20, "H"], [1, 21, "H"], [1, 22, "H"], [2, 21, "H"]]} />
        </g>
      )}
      {humor === "animado" && (
        <g className="brilhinhos">
          <Pixels lista={[[1, 2, "Y"], [0, 2, "W"], [2, 2, "W"], [1, 1, "W"], [1, 3, "W"], [2, 21, "Y"], [1, 21, "W"], [3, 21, "W"], [2, 20, "W"], [2, 22, "W"]]} />
        </g>
      )}
      {humor === "surpreso" && (
        <g>
          <rect x="21" y="-0.5" width="1.2" height="2.6" fill="#e8304a" />
          <rect x="21" y="2.6" width="1.2" height="1" fill="#e8304a" />
        </g>
      )}
      {humor === "pensativo" && (
        <g className="pensando">
          <rect x="20" y="2" width="1" height="1" fill="#3b53f0" />
          <rect x="21.5" y="0.8" width="1.3" height="1.3" fill="#3b53f0" />
          <rect x="23" y="-0.6" width="1.6" height="1.6" fill="#3b53f0" />
        </g>
      )}
      {humor === "dormindo" && (
        <text x="19" y="2" fontSize="4" fill="#3b53f0" className="pixel">
          z
        </text>
      )}
    </svg>
  );
}

// Balão de fala do mascote
export function Fala({
  children,
  humor = "normal",
  tamanho = 84,
  lado = "esquerda",
  nome,
}: {
  children: ReactNode;
  humor?: Humor;
  tamanho?: number;
  lado?: "esquerda" | "direita";
  nome?: string;
}) {
  return (
    <div className={`flex items-end gap-2 ${lado === "direita" ? "flex-row-reverse" : ""}`}>
      <Mascote tamanho={tamanho} humor={humor} className="shrink-0" rotulo={nome ? `${nome}, o mascote` : undefined} />
      <div className="relative mb-4 flex-1 rounded-2xl border-[3px] border-ardosia bg-white px-4 py-3 font-bold shadow-[4px_4px_0_var(--ardosia)]">
        {nome && <p className="pixel mb-0.5 text-xs text-mare-escura">{nome}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
