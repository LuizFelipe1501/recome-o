import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { connection } from "next/server";
import { textoLembrete } from "@/lib/textoLembrete";
import type { Estado } from "@/lib/tipos";

// Chamado pelo agendador da Vercel (vercel.json). Manda o lembrete do dia para quem
// ainda não fez o check-in. A leitura passa por funções do banco protegidas pela
// mesma senha do agendador (CRON_SECRET), sem precisar da chave de serviço.
export async function GET(request: Request) {
  await connection(); // sempre roda na hora, nunca no build
  const segredo = process.env.CRON_SECRET;
  if (!segredo || request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return new Response("Não autorizado", { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const publica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privada = process.env.VAPID_PRIVATE_KEY;
  if (!url || !chave || !publica || !privada) {
    return Response.json({ enviados: 0, aviso: "Lembretes ainda não configurados" });
  }
  webpush.setVapidDetails("mailto:luizfelipeccarneiro@gmail.com", publica, privada);
  const sb = createClient(url, chave, { auth: { persistSession: false } });

  const { data: inscritos, error } = await sb.rpc("lembretes_pendentes", { p_segredo: segredo });
  if (error) return Response.json({ enviados: 0, erro: error.message }, { status: 500 });

  let enviados = 0;
  for (const i of (inscritos ?? []) as { user_id: string; inscricao: webpush.PushSubscription; dados: Estado }[]) {
    const t = textoLembrete(i.dados);
    if (t.fez) continue;
    try {
      await webpush.sendNotification(i.inscricao, JSON.stringify({ titulo: t.titulo, corpo: t.corpo, url: t.url }));
      enviados++;
    } catch (erro) {
      const status = (erro as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) await sb.rpc("desativar_lembrete", { p_segredo: segredo, p_user: i.user_id });
    }
  }
  return Response.json({ enviados });
}
