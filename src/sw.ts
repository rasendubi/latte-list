import { precacheAndRoute } from 'workbox-precaching/precacheAndRoute';
import { createHandlerBoundToURL } from 'workbox-precaching/createHandlerBoundToURL';
import { CacheableResponsePlugin } from 'workbox-cacheable-response/CacheableResponsePlugin';
import { CacheFirst } from 'workbox-strategies/CacheFirst';
import { NetworkOnly } from 'workbox-strategies/NetworkOnly';
import { StaleWhileRevalidate } from 'workbox-strategies/StaleWhileRevalidate';
import { ExpirationPlugin } from 'workbox-expiration/ExpirationPlugin';
import { NavigationRoute } from 'workbox-routing/NavigationRoute';
import { registerRoute } from 'workbox-routing/registerRoute';

declare global {
  interface ServiceWorkerGlobalScope {
    __WB_MANIFEST: any;
  }
}
declare const self: ServiceWorkerGlobalScope;

self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('push', (event) => {
  event.waitUntil(
    (async function () {
      const options = {
        body: 'You Latte List review is ready',
        tag: 'review',
        renotify: true,
        icon: '/icon.svg',
        data: {
          dateOfArrival: Date.now(),
        },
      };
      await self.registration.showNotification('Review is ready', options);
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.waitUntil(
    (async function () {
      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      let reviewClient =
        clients.find((c) => new URL(c.url).pathname === '/review') ||
        clients.find((c) => c.visibilityState === 'visible') ||
        null;

      if (reviewClient) {
        reviewClient.navigate('/review');
        reviewClient.focus();
      } else {
        reviewClient = await self.clients.openWindow('/review');
      }

      const notifs = await self.registration.getNotifications();
      notifs.forEach((notification) => notification.close());
    })()
  );
});

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/__\//],
  })
);

// registerRoute(
//   ({ url }) => url.origin === 'https://firestore.googleapis.com',
//   new NetworkOnly()
// );

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

// Cache the underlying font files with a cache-first strategy for 1 year.
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  })
);
