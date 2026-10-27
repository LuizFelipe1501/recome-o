import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { connection } from "next/server";
import { textoLembrete } from "@/lib/textoLembrete";
import type { Estado } from "@/lib/tipos";

// Chamado pelo agendador da Vercel (vercel.json). Manda o lembrete do dia para quem
// ainda não fez o check-in. Precisa das chaves VAPID e da chave de serviço do Supabase.
export async function GET(request: Request) {
  await connection(); // sempre roda na hora, nunca no build
  const segredo = process.env.CRON_SECRET;
  if (segredo && request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return new Response("Não autorizado", { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const servico = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privada = process.env.VAPID_PRIVATE_KEY;
  if (!url || !servico || !publica || !privada) {
    return Response.json({ enviados: 0, aviso: "Lembretes ainda não configurados" });
  }
  webpush.setVapidDetails("mailto:contato@recomeco.app", publica, privada);
  const sb = createClient(url, servico, { auth: { persistSession: false } });

  const { data: inscritos } = await sb.from("lembretes").select("user_id, inscricao").eq("ativo", true);
  let enviados = 0;
  for (const i of inscritos ?? []) {
    const { data } = await sb.from("estados").select("dados").eq("user_id", i.user_id).maybeSingle();
    if (!data?.dados) continue;
    const t = textoLembrete(data.dados as Estado);
    if (t.fez) continue;
    try {
      await webpush.sendNotification(i.inscricao, JSON.stringify({ titulo: t.titulo, corpo: t.corpo, url: t.url }));
      enviados++;
    } catch (erro) {
      const status = (erro as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) await sb.from("lembretes").update({ ativo: false }).eq("user_id", i.user_id);
    }
  }
  return Response.json({ enviados });
}
