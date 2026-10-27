"use client";

import { Mensagens } from "@/components/Mensagens";
import { Base, Ouvir, Titulo } from "@/components/ui";
import { roteiroConversa } from "@/lib/conteudo";
import { useEstado } from "@/lib/estado";

export default function Conversa() {
  const { vinculo } = useEstado();
  return (
    <div className="space-y-6 pt-2">
      <Titulo sub="Confronto costuma gerar defesa. Estes passos ajudam a abrir a conversa sem briga.">Como puxar a conversa</Titulo>
      <div className="flex justify-end">
        <Ouvir texto={roteiroConversa.map((p) => `${p.titulo}. ${p.texto}`).join(" ")} rotulo="Ouvir o roteiro" />
      </div>
      <ol className="space-y-3">
        {roteiroConversa.map((p, i) => (
          <li key={p.titulo} className="bloco flex gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ceu font-titulo font-bold" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <h2 className="font-bold">{p.titulo}</h2>
              <p className="mt-1">{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>
      <Base>
        Roteiro baseado na TCC para familiares (Magnusson e colegas, 2015), que usa conceitos da entrevista motivacional: pedir
        permissão, evitar gerar resistência e escolher o momento em que a pessoa está mais aberta.
      </Base>

      {vinculo ? (
        <Mensagens titulo="Mensagens de apoio" vazio="Mande a primeira. Algo curto e sem cobrança funciona melhor." />
      ) : (
        <p className="bloco text-ardosia-suave">
          Quando você se conectar com a pessoa pelo código de convite, as mensagens de apoio aparecem aqui.
        </p>
      )}
    </div>
  );
}
