"use client";

import { useEffect, useState } from "react";

// Mostra "+N pontos" subindo por um instante quando algo é registrado.
export function useCelebracao() {
  const [festa, setFesta] = useState<{ id: number; texto: string } | null>(null);
  useEffect(() => {
    if (!festa) return;
    const t = setTimeout(() => setFesta(null), 1700);
    return () => clearTimeout(t);
  }, [festa]);
  return {
    festa,
    celebrar: (texto: string) => setFesta({ id: Date.now(), texto }),
  };
}

export function Celebracao({ festa }: { festa: { id: number; texto: string } | null }) {
  return (
    <div aria-live="polite" className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center">
      {festa && (
        <span key={festa.id} className="pontos-subindo rounded-full bg-lima px-4 py-1.5 font-titulo text-lg font-extrabold text-ardosia shadow-lg">
          {festa.texto}
        </span>
      )}
    </div>
  );
}
