/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

const BASE = import.meta.env.BASE_URL;

self.addEventListener('push', (event) => {
  const fallback = {
    title: 'Haushalt',
    body: 'Die Einkaufsliste wurde aktualisiert.',
    url: `${BASE}einkauf`,
  };

  let data = fallback;
  try {
    data = { ...fallback, ...event.data?.json() };
  } catch {
    // ungültiges JSON – Fallback nutzen
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: `${BASE}icons/icon-192.svg`,
      badge: `${BASE}icons/icon-192.svg`,
      data: { url: data.url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data?.url as string) ?? `${BASE}einkauf`;
  const absoluteUrl = targetUrl.startsWith('http')
    ? targetUrl
    : new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(BASE.replace(/\/$/, '')) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(absoluteUrl);
    }),
  );
});
