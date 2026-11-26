const fs=require('fs'),path=require('path');
const out='www';fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const f of ['index.html','manifest.webmanifest','sw.js','robots.txt','icon-192.png','icon-512.png','icon-maskable-512.png'])fs.copyFileSync(f,path.join(out,f));
console.log('www ready');
