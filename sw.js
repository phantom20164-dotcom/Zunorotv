'use strict';
const CACHE='zunoro-shell-v2';
const APP_SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;
  event.respondWith(caches.match(request).then(cached=>{
    if(cached) return cached;
    return fetch(request).then(response=>{
      if(response.ok && (request.destination==='document'||request.destination==='script'||request.destination==='style'||request.destination==='image'||url.pathname.endsWith('.webmanifest'))){
        const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put(request,copy));
      }
      return response;
    }).catch(()=>caches.match('./index.html'));
  }));
});
