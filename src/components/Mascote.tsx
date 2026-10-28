"use client";

import type { ReactNode } from "react";

// Cachorro caramelo em pixel art, com colete amarelo e gravata azul.
// Personagem original do Recomeço, sem logotipo de nenhuma marca.
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
};

export type Humor = "normal" | "feliz" | "preocupado" | "dormindo" | "desmaiado";

type Pixel = [number, number, string];

const EXPRESSOES: Record<Humor, Pixel[]> = {
  normal: [],
  feliz: [
    [6, 7, "C"], [6, 8, "C"], [7, 7, "C"], [7, 8, "C"],
    [6, 15, "C"], [6, 16, "C"], [7, 15, "C"], [7, 16, "C"],
    [7, 6, "K"], [6, 7, "K"], [6, 8, "K"], [7, 9, "K"],
    [7, 14, "K"], [6, 15, "K"], [6, 16, "K"], [7, 17, "K"],
    [8, 6, "R"], [8, 17, "R"],
  ],
  preocupado: [
    [5, 7, "K"], [5, 8, "K"], [4, 9, "K"],
    [4, 14, "K"], [5, 15, "K"], [5, 16, "K"],
    [14, 11, "L"], [14, 12, "L"], [15, 11, "K"], [15, 12, "K"],
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
    [14, 11, "L"], [14, 12, "L"], [15, 11, "K"], [15, 12, "K"],
  ],
};

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
  rotulo = "Caramelo, o mascote do Recomeço",
}: {
  tamanho?: number;
  humor?: Humor;
  animacao?: "idle" | "pula" | "parado";
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
    humor === "desmaiado" ? (animacao === "parado" ? "mascote-deitado" : "mascote-desmaiado") : animacao === "pula" ? "mascote-pula" : animacao === "idle" ? "mascote-idle" : "";

  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="-0.5 -0.5 25 25"
      className={`pixelado ${classe} ${className}`}
      role="img"
      aria-label={rotulo}
    >
      <Pixels lista={base} />
      <Pixels lista={EXPRESSOES[humor]} />
      {humor === "normal" && (
        <g className="piscar">
          <Pixels lista={PISCAR} />
        </g>
      )}
      {humor !== "dormindo" && humor !== "preocupado" && humor !== "desmaiado" ? (
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
