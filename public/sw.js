// Service worker do NonBet: recebe os lembretes e abre o app no lugar certo.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (evento) => {
  let dados = {};
  try {
    dados = evento.data ? evento.data.json() : {};
  } catch {
    dados = { corpo: evento.data ? evento.data.text() : "" };
  }
  const titulo = dados.titulo || "Caramelo tá te esperando";
  evento.waitUntil(
    Promise.all([
      self.registration.showNotification(titulo, {
        body: dados.corpo || "Um minuto para o check-in de hoje?",
        icon: "/icone-192.png",
        badge: "/selo-96.png",
        tag: "lembrete-diario",
        renotify: true,
        data: { url: dados.url || "/app#checkin" },
        actions: [
          { action: "checkin", title: "Fazer check-in" },
          { action: "vontade", title: "Estou com vontade" },
        ],
      }),
      self.navigator.setAppBadge ? self.navigator.setAppBadge(1).catch(() => {}) : null,
    ]),
  );
});

self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  const url = evento.action === "vontade" ? "/app/crise" : (evento.notification.data && evento.notification.data.url) || "/app";
  evento.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((janelas) => {
      for (const j of janelas) {
        if ("focus" in j) {
          j.navigate(url);
          return j.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
