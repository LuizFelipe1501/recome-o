"use client";

import { useState } from "react";
import { useEstado } from "@/lib/estado";

const sugestoes = [
  "Tô do seu lado.",
  "Orgulho de você por estar tentando.",
  "Um dia ruim não apaga o caminho.",
  "Se precisar conversar, me chama.",
];

export function Mensagens({ titulo, vazio }: { titulo: string; vazio: string }) {
  const { mensagens, enviarMensagem, usuarioId } = useEstado();
  const [texto, setTexto] = useState("");

  return (
    <section className="bloco" aria-labelledby="titulo-msgs">
      <h2 id="titulo-msgs" className="text-xl font-bold">
        {titulo}
      </h2>
      {mensagens.length === 0 ? (
        <p className="mt-2 text-ardosia-suave">{vazio}</p>
      ) : (
        <ul className="mt-3 space-y-2" aria-live="polite">
          {mensagens.map((m) => {
            const minha = m.autor_id === usuarioId;
            return (
              <li key={m.id} className={`max-w-[85%] rounded-2xl px-4 py-2 ${minha ? "ml-auto bg-mare text-white" : "bg-ceu"}`}>
                <p>{m.texto}</p>
                <p className={`text-xs ${minha ? "text-white/80" : "text-ardosia-suave"}`}>
                  {minha ? "Você" : "Recebida"}, {new Date(m.criado).toLocaleDateString("pt-BR")}
                </p>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {sugestoes.map((s) => (
          <button key={s} type="button" className="rounded-full bg-ceu px-3 py-1.5 text-sm font-bold text-mare-escura" onClick={() => setTexto(s)}>
            {s}
          </button>
        ))}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await enviarMensagem(texto);
          setTexto("");
        }}
      >
        <label htmlFor="nova-msg" className="sr-only">
          Escrever mensagem
        </label>
        <input id="nova-msg" className="campo" maxLength={500} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva uma mensagem" />
        <button type="submit" className="botao shrink-0 px-4" disabled={!texto.trim()}>
          Enviar
        </button>
      </form>
    </section>
  );
}
