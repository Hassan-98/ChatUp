/* eslint-disable */
self.addEventListener("push", e => {
  const notification = e.data.json();
  self.registration.showNotification(
      notification.title,
      {
          body: notification.body,
          icon: notification.image
      }
  );
});

self.addEventListener('notificationclick', function(e) {  
  console.log('On notification click: ', e.notification.tag);  
  e.notification.close();
  
  e.waitUntil(
    clients.matchAll({  
      type: "window"  
    })
    .then(function(clientList) {  
      for (var i = 0; i < clientList.length; i++) {  
        var client = clientList[i];  
        if (client.url == '/' && 'focus' in client)  
          return client.focus();  
      }  
      if (clients.openWindow) {
        return clients.openWindow('https://chatupapp.tk');  
      }
    })
  );
});

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("statics").then((cache) => {
      return cache.addAll(['./icon.png', './favicon.ico']);
    })
  );
})

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request)
    })
  );
})