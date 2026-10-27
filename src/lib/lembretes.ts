"use client";

import { supabase } from "./supabase";

const CHAVE_PUBLICA = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function lembretesSuportados() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "Notification" in window;
}

export function ehIOSsemInstalar() {
  if (typeof window === "undefined") return false;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const instalado = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
  return ios && !instalado;
}

export function permissaoAtual(): NotificationPermission | "indisponivel" {
  if (!lembretesSuportados()) return "indisponivel";
  return Notification.permission;
}

export async function registrarSW() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
  } catch {
    return null;
  }
}

function base64ParaBytes(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const bruto = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bruto, (c) => c.charCodeAt(0));
}

// Pede permissão, inscreve no push (se o servidor estiver configurado) e guarda a inscrição.
export async function ativarLembretes(horario: string, usuarioId: string | null) {
  if (!lembretesSuportados()) return "indisponivel" as const;
  const permissao = await Notification.requestPermission();
  if (permissao !== "granted") return "negado" as const;
  const reg = (await registrarSW()) ?? (await navigator.serviceWorker.ready);
  if (CHAVE_PUBLICA && usuarioId && usuarioId !== "eu") {
    try {
      const inscricao =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ParaBytes(CHAVE_PUBLICA) }));
      await supabase()
        ?.from("lembretes")
        .upsert({ user_id: usuarioId, inscricao: JSON.parse(JSON.stringify(inscricao)), horario, ativo: true });
      return "push" as const;
    } catch {
      return "local" as const;
    }
  }
  return "local" as const;
}

export async function desativarLembretes(usuarioId: string | null) {
  const reg = await navigator.serviceWorker?.getRegistration();
  await (await reg?.pushManager.getSubscription())?.unsubscribe();
  if (usuarioId && usuarioId !== "eu") await supabase()?.from("lembretes").update({ ativo: false }).eq("user_id", usuarioId);
}

// Mostra uma notificação agora, igual à que chega no horário. Serve para testar e para a demonstração.
export async function mostrarLembrete(titulo: string, corpo: string, url = "/app#checkin") {
  const reg = (await navigator.serviceWorker?.getRegistration()) ?? (await registrarSW());
  if (!reg || Notification.permission !== "granted") return false;
  await reg.showNotification(titulo, {
    body: corpo,
    icon: "/icone-192.png",
    badge: "/selo-96.png",
    tag: "lembrete-diario",
    data: { url },
  });
  return true;
}

// Bolinha no ícone do app instalado quando falta o check-in do dia
export function atualizarSelo(pendente: boolean) {
  const n = navigator as Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
  try {
    if (pendente) n.setAppBadge?.(1)?.catch(() => {});
    else n.clearAppBadge?.()?.catch(() => {});
  } catch {}
}
