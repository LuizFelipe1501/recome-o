import Link from "next/link";

const pecas = [
  {
    titulo: "Para a hora da vontade",
    texto:
      "Um botão sempre à mão. Você respira até o céu abrir e recebe uma atividade de poucos minutos pensada para o que está pesando: vontade, aperto de dinheiro, solidão ou o impulso de recuperar o que perdeu.",
    dado: "A recaída costuma vir à noite, sozinho e pensando em dinheiro.",
    cor: "var(--mare)",
  },
  {
    titulo: "Desenrolando sua vida com você",
    texto:
      "Você coloca o que deve no papel, sem vergonha, e cada pagamento vira uma missão. Tem desafio de poupança com meta e os caminhos oficiais, como a Lei do Superendividamento e o Registrato do Banco Central.",
    dado: "53% de quem aposta já atrasou contas para apostar.",
    cor: "var(--coral)",
  },
  {
    titulo: "Com um padrinho do lado",
    texto:
      "A mãe, o parceiro, o irmão ou o amigo vira padrinho. Missões feitas em dupla valem o dobro de pontos, e quem apoia ganha um espaço próprio: como puxar a conversa sem brigar, sinais para prestar atenção e onde buscar ajuda para si.",
    dado: "Na Suécia, quase 1 em cada 5 pessoas convive com alguém que tem problema com aposta. Só 1 em cada 10 busca ajuda.",
    cor: "var(--menta)",
  },
];

export default function Inicio() {
  return (
    <div className="min-h-dvh bg-ceu-fundo">
      <section className="relative overflow-hidden bg-mare text-white">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <circle cx="360" cy="70" r="110" fill="var(--sol)" />
          <circle cx="410" cy="650" r="80" fill="var(--coral)" />
          <circle cx="300" cy="660" r="26" fill="var(--lima)" />
          <circle cx="70" cy="120" r="18" fill="var(--menta)" />
        </svg>
        <div className="relative mx-auto max-w-lg px-5 pb-24 pt-6">
          <p className="font-titulo text-xl font-extrabold">Recomeço</p>
          <h1 className="mt-20 text-[2.7rem] font-extrabold leading-[1.02] sm:text-5xl">Para os minutos em que a vontade de apostar aperta.</h1>
          <p className="mt-5 max-w-md text-lg">
            Um apoio no celular para quem quer parar ou diminuir as apostas, desenrolar as dívidas e ter a família por perto.
            Gratuito, sem julgamento.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/entrar" className="botao bg-white text-mare-escura hover:bg-ceu">
              Quero começar
            </Link>
            <Link href="/entrar?papel=familiar" className="botao-linha border-white text-white hover:bg-white/15">
              Quero ajudar alguém
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-lg px-5 py-12">
        <h2 className="text-2xl font-extrabold">Três partes que funcionam juntas</h2>
        <div className="mt-6 space-y-8">
          {pecas.map((p) => (
            <div key={p.titulo} className="border-l-[6px] pl-4" style={{ borderColor: p.cor }}>
              <h3 className="text-xl font-bold">{p.titulo}</h3>
              <p className="mt-2">{p.texto}</p>
              <p className="mt-2 text-sm font-bold text-ardosia-suave">{p.dado}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-lg px-5 py-12">
          <h2 className="text-2xl font-extrabold">O que o Recomeço não é</h2>
          <p className="mt-3">
            Não substitui atendimento profissional. É um apoio para usar junto com o SUS, os Jogadores Anônimos e quem
            cuida de você. Em todas as telas há um caminho direto para ajuda de verdade.
          </p>
          <p className="mt-3">
            Não tem aposta, sorteio nem prêmio. Você avança fazendo coisas concretas, e um deslize não apaga o seu progresso.
          </p>
          <div className="mt-6 rounded-2xl bg-ceu p-4">
            <p className="font-bold">Se você está pensando em tirar a própria vida, ligue agora para o CVV.</p>
            <a href="tel:188" className="botao mt-3 bg-telha hover:bg-telha">
              Ligar 188
            </a>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-lg px-5 py-10 text-sm text-ardosia-suave">
        <p>
          Protótipo criado para o hackathon Rolê que Rende, BB Digital Week 2026. Conteúdo baseado em pesquisas sobre
          tratamento do jogo problemático, como a revisão Cochrane de 2012, os programas GamblingLess e o LENAD III. Os
          dados digitados ficam na sua conta e não são compartilhados sem a sua escolha.
        </p>
      </footer>
    </div>
  );
}
