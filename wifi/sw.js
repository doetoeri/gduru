var CACHE_NAME = "doyoung-summer-2026-v4";
var APP_SHELL = ["./", "./index.html", "./manifest.webmanifest"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key !== CACHE_NAME) { return caches.delete(key); }
        return null;
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") { return; }
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var update = fetch(event.request).then(function (response) {
        if (response && response.ok) {
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, response.clone());
          });
        }
        return response;
      });
      if (cached) {
        event.waitUntil(update.catch(function () {}));
        return cached;
      }
      return update.catch(function () {
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
        return caches.match(event.request);
      });
    })
  );
});
