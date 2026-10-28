import type { Estado } from "./tipos";
import { hoje } from "./calculos";

// Uma frase por dia, escolhida pelo momento da pessoa. Aparece no resumo diário,
// não a cada abertura: repetir demais vira ruído e perde o efeito.
// Tom de amigo. Nada de "você consegue tudo", nada de culpa.

const depoisDeDeslize = [
  "Um dia ruim não apaga os dias bons. Eles continuam contando.",
  "Quase toda recuperação tem idas e vindas. O que importa é voltar, e você voltou.",
  "Recuperar o que perdeu com outra aposta é a armadilha mais comum. Hoje, só não aposte.",
  "Errar não te leva de volta para o começo. Você já sabe mais do que sabia antes.",
  "Fala com você mesmo como falaria com um amigo que escorregou.",
  "Cair faz parte de aprender a andar. Ninguém desiste de andar porque caiu.",
  "A vergonha quer que você suma. O plano quer que você volte. Escuta o plano.",
  "Hoje você pode ser gentil com você. Amanhã fica mais fácil recomeçar.",
];

const vontadeAlta = [
  "A vontade sobe, chega no pico e desce. Em poucos minutos ela perde força.",
  "Você não precisa vencer a vontade para sempre. Só pelos próximos 15 minutos.",
  "Sentir vontade não é falhar. Obedecer a ela é que é opcional.",
  "Se apertar hoje, o botão Estou com vontade está ali. Já funcionou antes.",
  "Respira fundo três vezes. A vontade é uma onda, e você sabe surfar.",
  "A vontade mente: ela diz que dessa vez vai ser diferente. Não vai.",
  "Manda mensagem para alguém agora. Vontade dividida fica menor.",
];

const semanaBoa = [
  "Olha a semana que você fez. Isso é treino, e treino vira hábito.",
  "Cada dia sem aposta deixa a próxima vontade um pouco mais fraca.",
  "Você está fazendo a coisa difícil. Vale reconhecer isso hoje.",
  "Constância vale mais que perfeição. E você está sendo constante.",
  "Tem alguém em casa que já percebeu a diferença, mesmo sem falar.",
  "Você está provando para você mesmo que dá. Essa prova ninguém tira.",
  "O dinheiro que ficou no bolso esta semana tem nome: é seu.",
];

const geral = [
  "Hoje é um dia só. Não precisa resolver a vida inteira, só o dia de hoje.",
  "A casa de aposta foi feita para você perder. Sair dela é ganhar de volta seu tempo e seu dinheiro.",
  "Dinheiro guardado não some. Dinheiro apostado, quase sempre, sim.",
  "Oito em cada dez brasileiros não apostam. Viver sem bet é o normal.",
  "Pedir ajuda não é fraqueza. É a parte do plano que mais funciona.",
  "Pense em uma coisa que você quer comprar daqui a seis meses. É por ela também.",
  "Tédio é um gatilho comum. Que tal deixar uma coisa boa planejada para a noite?",
  "Um pagamento pequeno ainda é um chefão perdendo vida.",
  "Quem está do seu lado torce mais do que fala.",
  "O check-in de hoje leva um minuto e diz muito sobre o seu dia.",
  "Ninguém precisa ser perfeito para mudar. Precisa só continuar.",
  "Sua história não é a sua pior noite de aposta.",
  "Você merece um dinheiro que dura até o fim do mês.",
  "A sua família não precisa de um herói. Precisa de você presente.",
  "Coragem não é não sentir vontade. É sentir e escolher diferente.",
  "Cada real que não foi para a aposta é um tijolinho na sua casinha.",
  "O futebol fica mais gostoso quando o coração bate pelo time, não pela aposta.",
  "Você não está sozinho nessa. Milhões de brasileiros estão tentando o mesmo.",
  "Seja paciente com você. Mudar leva tempo, e o tempo está a seu favor.",
  "Hoje, escolha uma coisa pequena que te faça bem. Só uma.",
];

const familiar = [
  "Você não causou o problema e não consegue resolvê-lo sozinho. Mas faz diferença.",
  "Reconhecer um esforço pequeno ajuda mais do que apontar um erro grande.",
  "Cuidar de você também é cuidar de quem você apoia.",
  "Limite claro não é castigo. É proteção para os dois.",
  "Escolha a hora certa para conversar. Calma vale mais que pressa.",
  "Raiva e cansaço são reações normais. Você não precisa carregar isso calado.",
  "Pagar a dívida de aposta sem um plano costuma adiar o problema, não resolver.",
  "Um programa juntos, sem aposta, mostra que a vida sem ela é boa.",
  "Você está aprendendo a apoiar sem se perder. Isso é raro.",
  "Pequenas ações de apoio, repetidas, mudam o clima de uma casa.",
  "Seu cuidado aparece nos detalhes. Ele percebe, mesmo quando não diz.",
  "Você também merece descanso. Apoiar não é carregar tudo sozinho.",
  "Um abraço sem cobrança às vezes vale mais que uma conversa longa.",
];

function dia(n: number) {
  const d = hoje();
  let h = 0;
  for (const c of d) h = (h * 31 + c.charCodeAt(0)) % 9973;
  return h % n;
}

function recente(data: string, dias: number) {
  const diff = (new Date(hoje()).getTime() - new Date(data.slice(0, 10)).getTime()) / 86400000;
  return diff >= 0 && diff <= dias;
}

export function fraseDoDia(e: Estado): { texto: string; tom: "acolher" | "vontade" | "celebrar" | "geral" } {
  if (e.perfil.papel === "familiar") return { texto: familiar[dia(familiar.length)], tom: "geral" };

  const deslize = e.checkins.some((c) => c.apostou && recente(c.data, 2)) || e.crises.some((c) => c.resultado === "apostei" && recente(c.data, 2));
  if (deslize) return { texto: depoisDeDeslize[dia(depoisDeDeslize.length)], tom: "acolher" };

  const ultimos = [...e.checkins].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 3);
  if (ultimos.some((c) => c.vontade >= 7 && recente(c.data, 2))) return { texto: vontadeAlta[dia(vontadeAlta.length)], tom: "vontade" };

  const semana = e.checkins.filter((c) => recente(c.data, 6) && !c.apostou).length;
  if (semana >= 4) return { texto: semanaBoa[dia(semanaBoa.length)], tom: "celebrar" };

  return { texto: geral[dia(geral.length)], tom: "geral" };
}
