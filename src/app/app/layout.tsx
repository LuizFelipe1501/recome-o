"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Casca } from "@/components/Casca";
import { useEstado } from "@/lib/estado";

export default function LayoutApp({ children }: { children: ReactNode }) {
  const { modo, estado } = useEstado();
  const router = useRouter();
  const caminho = usePathname();

  useEffect(() => {
    if (modo === "anonimo") router.replace("/entrar");
    else if (estado && !estado.perfil.onboardingFeito && !caminho.startsWith("/app/comecar") && !caminho.startsWith("/app/crise")) {
      router.replace("/app/comecar");
    }
  }, [modo, estado, caminho, router]);

  if (modo === "carregando" || modo === "anonimo" || !estado) {
    return (
      <div className="grid min-h-dvh place-items-center text-ardosia-suave" role="status">
        Carregando...
      </div>
    );
  }

  return <Casca>{children}</Casca>;
}
