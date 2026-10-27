# Recomeço

Protótipo para o hackathon Rolê que Rende (BB Digital Week 2026), desafio "Além da Aposta: caminhos para recomeçar".

Apoio no celular para quem quer parar ou diminuir as apostas e para quem está do lado:

- **Botão "Estou com vontade"**: respiração em que o céu nublado abre a cada respiração, seguida de uma atividade curta escolhida pelo gatilho (vontade, dinheiro, emoção, recuperar perdas, pressão social).
- **Trilha de missões**: pontos previsíveis por hábitos e missões. Missões feitas com o padrinho ou madrinha valem o dobro.
- **Desenrolando sua vida com você**: dívidas viram missões de pagamento, ordem de ataque, desafio de poupança com meta animada, caminhos oficiais (Superendividamento, Registrato) e alerta de golpes.
- **Família**: convite por código, compartilhamento escolhido pela pessoa, mensagens de apoio, sinais de alerta, roteiro de conversa e caminho de segurança.
- **Apoio**: CVV 188, SAMU 192, teleatendimento do SUS (Meu SUS Digital), CAPS, Jogadores Anônimos, Ligue 180, Procon e Defensoria.
- **Acessibilidade**: fonte Atkinson Hyperlegible, letra maior, contraste alto, menos movimento e leitura em voz alta.

O conteúdo se baseia em TCC e entrevista motivacional e em estudos como GamblingLess, Help on Demand, e-Estesia, revisão Cochrane (2012) e LENAD III. Não substitui atendimento profissional. Não usa dados de clientes nem marca de casas de aposta.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # opcional, para login com Supabase
npm run dev
```

Sem Supabase, use "Testar sem criar conta": os dados ficam só no navegador.

## Supabase

1. Crie um projeto no Supabase.
2. No SQL Editor, rode `supabase/schema.sql`.
3. Em Authentication > Providers > Email, desligue "Confirm email" se quiser entrar sem confirmar o e-mail durante o hackathon.
4. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no `.env.local` e nas variáveis de ambiente da Vercel.

## Stack

Next.js 16, React 19, Tailwind CSS 4, Supabase (Auth + Postgres com RLS).
