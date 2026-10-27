import type { Estado } from "./tipos";
import { diasNaSemana, dinheiroPoupado, placar, proximaMissao } from "./missoes";
import { diasEntre, hoje, reais } from "./calculos";

// Texto do lembrete diário. Varia todo dia e sempre mostra um avanço concreto.
// Tom de amigo, sem culpa: nada de "você vai perder tudo" ou contagem regressiva.
export function textoLembrete(e: Estado, agora = new Date()) {
  const p = placar(e);
  const semana = diasNaSemana(e);
  const nome = e.perfil.nome ? `${e.perfil.nome}, ` : "";
  const dia = diasEntre(e.perfil.inicio);
  const prox = proximaMissao(e);
  const familiar = e.perfil.papel === "familiar";
  const fez = familiar ? e.familia.meuCheckin.some((c) => c.data === hoje()) : e.checkins.some((c) => c.data === hoje());
  const poupado = familiar ? 0 : dinheiroPoupado(e);

  const opcoes = familiar
    ? [
        { titulo: "Caramelo quer saber de você", corpo: `${nome}como você está hoje? Quem apoia também precisa de cuidado.` },
        { titulo: `Nível ${p.numeroNivel}: ${p.nivel.nome}`, corpo: p.proximo ? `Faltam ${p.faltam} XP para ${p.proximo.nome}. Uma ação de apoio hoje já ajuda.` : "Você chegou no nível máximo. Valeu por estar junto." },
        { titulo: `${semana} de 5 dias nesta semana`, corpo: prox ? `Próxima missão: ${prox.titulo}.` : "Trilha completa. Passa aqui para o check-in." },
      ]
    : [
        { titulo: "Caramelo tá te esperando", corpo: `${nome}dia ${dia} da caminhada. Um minuto para o check-in?` },
        { titulo: `${semana} de 5 dias nesta semana`, corpo: semana >= 5 ? "Meta da semana batida! Bora manter o ritmo." : `Faltam ${5 - semana} para bater a meta da semana.` },
        { titulo: `${p.total} XP e contando`, corpo: p.proximo ? `Faltam ${p.faltam} XP para ${p.proximo.nome}.` : "Nível máximo. Que caminhada!" },
        ...(poupado > 0 ? [{ titulo: `${reais(poupado)} longe da aposta`, corpo: "É o que deixou de ir para as bets nos dias sem aposta. Conta mais um hoje?" }] : []),
        ...(prox ? [{ titulo: "Missão nova na trilha", corpo: `${prox.titulo}: vale +${prox.pontos} XP${prox.compartilhavel ? ", o dobro com o padrinho" : ""}.` }] : []),
      ];

  const escolhido = opcoes[(agora.getDate() + agora.getMonth()) % opcoes.length];
  return { ...escolhido, fez, url: familiar ? "/app" : "/app#checkin" };
}
