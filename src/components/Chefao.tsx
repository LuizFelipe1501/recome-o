"use client";

import type { CategoriaDivida } from "@/lib/tipos";

// Cada dívida vira um chefão em pixel art. A vida dele é o quanto ainda falta pagar.
// Visual de videogame, sem nada de cassino: nada de moeda, roleta ou caça-níquel.
const FORMAS: Record<CategoriaDivida, string[]> = {
  // Agiota: espinhudo e vermelho, o mais perigoso
  risco: [
    "..X..XX..X..",
    "..XX.XX.XX..",
    "...XXXXXX...",
    "..XXXXXXXX..",
    ".XXWWXXWWXX.",
    ".XXWEXXEWXX.",
    "XXXXXXXXXXXX",
    "XXXEXEEXEXXX",
    "XXXXEXXEXXXX",
    ".XXXXXXXXXX.",
    "..XX.XX.XX..",
    ".XX..XX..XX.",
  ],
  // Conta da casa: uma casinha brava
  sobrevivencia: [
    ".....XX.....",
    "....XXXX....",
    "...XXXXXX...",
    "..XXXXXXXX..",
    ".XXXXXXXXXX.",
    "XXXXXXXXXXXX",
    ".XWWXXXXWWX.",
    ".XWEXXXXEWX.",
    ".XXXXXXXXXX.",
    ".XXXEEEEXXX.",
    ".XXXXXXXXXX.",
    ".XX......XX.",
  ],
  // Juros altos (cartão, cheque especial): um cartão com dentes
  cara: [
    "............",
    "XXXXXXXXXXXX",
    "XEEEEEEEEEEX",
    "XXXXXXXXXXXX",
    "XWWXXXXXWWXX",
    "XWEXXXXXEWXX",
    "XXXXXXXXXXXX",
    "XEXEXEXEXEXX",
    "XXEXEXEXEXEX",
    "XXXXXXXXXXXX",
    ".X........X.",
    "XX........XX",
  ],
  // Outras: uma gosminha
  outra: [
    "............",
    "............",
    "....XXXX....",
    "..XXXXXXXX..",
    ".XXXXXXXXXX.",
    ".XWWXXXXWWX.",
    "XXWEXXXXEWXX",
    "XXXXXXXXXXXX",
    "XXXXEEEEXXXX",
    "XXXXXXXXXXXX",
    ".XXXXXXXXXX.",
    "X.XX.XX.XX.X",
  ],
};

export const corChefao: Record<CategoriaDivida, string> = {
  risco: "#d7263d",
  sobrevivencia: "#17b07a",
  cara: "#e0832f",
  outra: "#7b5cf0",
};

export const nomeChefao: Record<CategoriaDivida, string> = {
  risco: "Chefão perigoso",
  sobrevivencia: "Chefão da casa",
  cara: "Chefão dos juros",
  outra: "Chefão",
};

export function Chefao({ categoria, tamanho = 72, derrotado = false, className = "" }: { categoria: CategoriaDivida; tamanho?: number; derrotado?: boolean; className?: string }) {
  const cor = derrotado ? "#c9d0f2" : corChefao[categoria];
  return (
    <svg width={tamanho} height={tamanho} viewBox="-0.5 -0.5 13 13" className={`pixelado ${className}`} aria-hidden="true">
      {FORMAS[categoria].flatMap((linha, y) =>
        linha.split("").map((c, x) => {
          if (c === ".") return null;
          const fill = c === "X" ? cor : c === "W" ? "#fff" : derrotado ? "#46557e" : "#0b1f4d";
          return <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={fill} />;
        }),
      )}
      {derrotado && (
        <g>
          <rect x="3" y="5" width="2" height="1" fill="#0b1f4d" />
          <rect x="8" y="5" width="2" height="1" fill="#0b1f4d" />
        </g>
      )}
    </svg>
  );
}

// Barra de vida em blocos, estilo fliperama
export function BarraVida({ restante, total, cor }: { restante: number; total: number; cor: string }) {
  const pct = total > 0 ? Math.max(0, Math.min(1, restante / total)) : 0;
  const blocos = 12;
  const cheios = Math.ceil(pct * blocos);
  return (
    <div
      className="flex gap-0.5 rounded-md border-[3px] border-ardosia bg-ardosia p-0.5"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct * 100)}
      aria-label="Vida do chefão: quanto ainda falta pagar"
    >
      {Array.from({ length: blocos }).map((_, i) => (
        <span key={i} className="h-3 flex-1 rounded-[2px] transition-colors duration-500" style={{ background: i < cheios ? cor : "#2a3a6a", transitionDelay: `${(blocos - i) * 25}ms` }} />
      ))}
    </div>
  );
}
