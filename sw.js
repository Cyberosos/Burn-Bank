// Minimal service worker so the app can be installed to the home screen.
// It always fetches from the network, so updates show up immediately.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
