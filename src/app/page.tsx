import Link from "next/link";
import { Mascote } from "@/components/Mascote";

const pecas = [
  {
    titulo: "Para a hora da vontade",
    texto: "Um botão sempre à mão. Você respira até o céu abrir e recebe uma atividade de poucos minutos para o que está pesando.",
    dado: "A recaída costuma vir à noite, sozinho e pensando em dinheiro.",
    cor: "var(--mare)",
  },
  {
    titulo: "Desenrolando sua vida com você",
    texto: "As dívidas no papel, cada pagamento vira missão e um desafio de poupança com meta. Mais os caminhos oficiais, como o Registrato.",
    dado: "53% de quem aposta já atrasou contas para apostar.",
    cor: "var(--menta)",
  },
  {
    titulo: "Com um padrinho do lado",
    texto: "Quem apoia tem trilha própria, baseada no método CRAFT, e as missões feitas em dupla valem o dobro.",
    dado: "Apoio humano é o que mais aumenta o efeito de programas pela internet.",
    cor: "var(--coral)",
  },
];

export default function Inicio() {
  return (
    <div className="min-h-dvh bg-ceu-fundo">
      <section className="border-b-[3px] border-ardosia bg-sol">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-6 lg:pb-20">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 font-titulo text-xl font-extrabold">
              <Mascote tamanho={40} animacao="parado" rotulo="" />
              Recomeço
            </p>
            <Link href="/entrar" className="rounded-xl border-[3px] border-ardosia bg-white px-3 py-1.5 text-sm font-bold">
              Entrar
            </Link>
          </div>

          <div className="mt-8 grid items-center gap-8 lg:mt-14 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="pixel inline-block rounded-lg border-2 border-ardosia bg-white px-2 py-1 text-xs">GRÁTIS · SEM JULGAMENTO</p>
              <h1 className="mt-4 text-[2.4rem] font-extrabold leading-[1.02] sm:text-5xl lg:text-6xl">Sair das bets é uma trilha. A gente caminha junto.</h1>
              <p className="mt-4 max-w-xl text-lg">
                Missões curtas, check-in de um minuto e um caramelo que não te deixa sozinho. Para quem quer parar de apostar e para
                quem está do lado.
              </p>
            </div>
            <div className="relative mx-auto hidden w-full max-w-sm lg:block">
              <div className="relative rounded-[2rem] border-[3px] border-ardosia bg-white p-6 shadow-[0_8px_0_var(--ardosia)]">
                <Mascote tamanho={220} humor="feliz" className="mx-auto" />
                <p className="mt-2 text-center font-bold">Oi! Eu sou o Caramelo.</p>
                <p className="text-center text-sm">Vou te lembrar do check-in e comemorar cada passo.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-12">
            <Link
              href="/entrar?papel=apostador"
              className="group flex items-center gap-4 rounded-[1.5rem] border-[3px] border-ardosia bg-mare p-5 text-white shadow-[0_6px_0_var(--ardosia)] transition-transform hover:-translate-y-0.5 active:translate-y-1"
            >
              <Mascote tamanho={72} animacao="parado" rotulo="" className="shrink-0" />
              <span>
                <span className="block text-xl font-extrabold leading-tight">Quero parar de apostar</span>
                <span className="mt-1 block text-sm text-white/90">Trilha de 4 fases, botão de vontade e Desenrola para as dívidas</span>
              </span>
            </Link>
            <Link
              href="/entrar?papel=familiar"
              className="group flex items-center gap-4 rounded-[1.5rem] border-[3px] border-ardosia bg-white p-5 shadow-[0_6px_0_var(--ardosia)] transition-transform hover:-translate-y-0.5 active:translate-y-1"
            >
              <Mascote tamanho={72} humor="feliz" animacao="parado" rotulo="" className="shrink-0" />
              <span>
                <span className="block text-xl font-extrabold leading-tight">Quero ajudar alguém</span>
                <span className="mt-1 block text-sm text-ardosia-suave">Para família e amigos. Trilha de 5 fases baseada no CRAFT</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Três partes que funcionam juntas</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {pecas.map((p) => (
            <div key={p.titulo} className="rounded-[1.5rem] border-[3px] border-ardosia bg-white p-5 shadow-[0_5px_0_var(--ardosia)]">
              <span className="block h-2 w-12 rounded-full" style={{ background: p.cor }} aria-hidden="true" />
              <h3 className="mt-3 text-xl font-bold">{p.titulo}</h3>
              <p className="mt-2">{p.texto}</p>
              <p className="mt-3 text-sm font-bold text-ardosia-suave">{p.dado}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y-[3px] border-ardosia bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold">O que o Recomeço não é</h2>
            <p className="mt-3">
              Não substitui atendimento profissional. É um apoio para usar junto com o SUS, os Jogadores Anônimos e quem cuida de
              você. Em todas as telas há um caminho direto para ajuda de verdade.
            </p>
            <p className="mt-3">
              Não tem aposta, sorteio nem prêmio surpresa. Os pontos são fixos e você sempre sabe por que ganhou. Um deslize nunca
              apaga o seu progresso.
            </p>
          </div>
          <div className="self-start rounded-[1.5rem] border-[3px] border-ardosia bg-ceu p-5">
            <p className="font-bold">Se você está pensando em tirar a própria vida, ligue agora para o CVV.</p>
            <a href="tel:188" className="botao-jogo mt-3 bg-telha text-white shadow-[0_5px_0_#8a1f0d]">
              Ligar 188
            </a>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-ardosia-suave sm:px-6">
        <p>
          Protótipo criado para o hackathon Rolê que Rende, BB Digital Week 2026. Conteúdo baseado em pesquisas sobre tratamento do
          jogo problemático, como a revisão Cochrane de 2012, o programa GamblingLess, o método CRAFT para familiares e o LENAD III. Os
          dados digitados ficam na sua conta e não são compartilhados sem a sua escolha.
        </p>
      </footer>
    </div>
  );
}
