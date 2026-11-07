// Usage:  node _source/build.js https://yourdomain.com
// Reads template.html and writes every page, sitemap.xml and robots.txt into the folder above.
const fs=require('fs'),path=require('path');
const SITE=(process.argv[2]||'https://YOURDOMAIN.com').replace(/\/+$/,'');
const SRC=__dirname,OUT=path.join(SRC,'..');
const tpl=fs.readFileSync(path.join(SRC,'template.html'),'utf8');
const js=tpl.split('<script>')[1];
const {PG,CATS}=new Function(js.slice(js.indexOf('/* ===== Artwork data'),js.indexOf('/* ===== Views'))+';return{PG,CATS}')();
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const lc=s=>s.toLowerCase(),li=(h,t)=>`<li><a href="${h}">${esc(t)}</a></li>`;
const steps=p=>{const n=p.d.split(/(?=M)/).length,sz=Math.ceil(n/Math.min(6,n));return Math.ceil(n/sz)};
const urls=[];
function write(file,o){
  const r='../'.repeat(file.split('/').length-1),url=SITE+'/'+(file==='index.html'?'':file);
  const ld=JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'WebSite',name:'Splash Studio',url:SITE+'/'},{'@type':'BreadcrumbList',itemListElement:o.crumbs.map(([n,u],i)=>({'@type':'ListItem',position:i+1,name:n,item:SITE+'/'+u}))}]});
  const head=`<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website"><meta property="og:site_name" content="Splash Studio"><meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.desc)}"><meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
<script type="application/ld+json">${ld}</script>`;
  const boot=JSON.stringify({...o.boot,r});
  const h=tpl.replace(/\{\{R\}\}/g,()=>r).replace(/<title>[\s\S]*?<\/title>/,()=>'').replace(/<meta name="description"[^>]*>/,()=>head)
    .replace('<script>',()=>`<script>window.BOOT=${boot};</script>\n<script>`).replace('<main id="app"></main>',()=>`<main id="app">${o.body}</main>`);
  fs.mkdirSync(path.dirname(path.join(OUT,file)),{recursive:true});
  fs.writeFileSync(path.join(OUT,file),h);urls.push(url);
}
const home=[['Home','']];
write('index.html',{title:'Free Online Colouring Pages for Kids and Adults | Splash Studio',desc:'Colour online with a tap. Free colouring pages for kids and detailed mandalas for adults, plus draw-along lessons. No download, no sign-up.',boot:{v:'home'},crumbs:home,
  body:`<h1>Free colouring pages for kids</h1><p>Pick a picture and colour it online. Nothing to download and no sign-up.</p><ul>${Object.keys(CATS).map(k=>li(`c/${k}.html`,CATS[k][0]+' colouring pages')).join('')}</ul>`});
for(const k of Object.keys(CATS)){const l=PG.filter(p=>p.c===k),n=CATS[k][0];
  write(`c/${k}.html`,{title:`${n} Colouring Pages – Free to Colour Online | Splash Studio`,desc:`Colour ${l.length} free ${lc(n)} pictures online. ${CATS[k][2]} No download or sign-up.`,boot:{v:'c',k},crumbs:[...home,[n,`c/${k}.html`]],
    body:`<h1>${n}</h1><p>${CATS[k][2]}</p><ul>${l.map(p=>li(`../p/${p.id}.html`,p.t+' colouring page')).join('')}</ul>`});}
for(const p of PG){const n=CATS[p.c][0],N=steps(p);
  write(`p/${p.id}.html`,{title:`${p.t} Colouring Page – Colour Online Free | Splash Studio`,desc:`Colour this ${lc(p.t)} picture online with a tap, or print it to colour on paper. Free, no sign-up.`,boot:{v:'p',id:p.id},crumbs:[...home,[n,`c/${p.c}.html`],[p.t,`p/${p.id}.html`]],
    body:`<h1>${p.t} colouring page</h1><p>Tap an area to fill it with colour, or draw with the brush. <a href="../learn/${p.id}.html">Learn to draw ${lc(p.t)} step by step</a>.</p>`});
  write(`learn/${p.id}.html`,{title:`How to Draw ${p.t} Step by Step – Easy Drawing Lesson | Splash Studio`,desc:`Learn to draw ${lc(p.t)} in ${N} easy steps. Follow the guide and draw on your own canvas. Free drawing lesson for kids.`,boot:{v:'lesson',id:p.id},crumbs:[...home,['Draw along','learn.html'],[p.t,`learn/${p.id}.html`]],
    body:`<h1>Draw ${p.t} step by step</h1><p>Follow ${N} easy steps and draw along on your own canvas.</p>`});}
write('p/free.html',{title:'Free Online Drawing Canvas – Draw and Paint | Splash Studio',desc:'Draw and paint on a blank canvas online. Brush, rainbow pen, spray and eraser. Free, no sign-up.',boot:{v:'p',id:'free'},crumbs:[...home,['Free canvas','p/free.html']],body:'<h1>Free canvas colouring page</h1><p>Draw anything with the brush, rainbow pen or spray can.</p>'});
write('learn.html',{title:'Draw Along – Easy Step by Step Drawing Lessons for Kids | Splash Studio',desc:`${PG.length} easy drawing lessons. Follow the steps and draw along on your own canvas.`,boot:{v:'learn'},crumbs:[...home,['Draw along','learn.html']],
  body:`<h1>Draw along lessons</h1><ul>${PG.map(p=>li(`learn/${p.id}.html`,'Draw '+p.t)).join('')}</ul>`});
write('about.html',{title:'About Splash Studio | Free Colouring and Drawing',desc:'Splash Studio is a free place to colour and draw online. Every picture is drawn by us.',boot:{v:'info',k:'about'},crumbs:[...home,['About','about.html']],body:'<h1>About</h1><p>Splash Studio is a free place to colour and draw online. Every picture is drawn by us.</p>'});
write('privacy.html',{title:'Privacy Policy | Splash Studio',desc:'How Splash Studio handles cookies, ads and your drawings.',boot:{v:'info',k:'privacy'},crumbs:[...home,['Privacy','privacy.html']],body:'<h1>Privacy</h1><p>We do not ask for names, emails or accounts. Your pictures stay in your browser and are never uploaded.</p>'});
fs.writeFileSync(path.join(OUT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
if(!fs.existsSync(path.join(OUT,'ads.txt')))fs.writeFileSync(path.join(OUT,'ads.txt'),'# Replace with the exact line AdSense shows you (Sites > your site > ads.txt)\ngoogle.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0\n');
fs.writeFileSync(path.join(OUT,'404.html'),`<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page not found</title><p>That page does not exist. <a href="${SITE}/">Go to Splash Studio</a>.</p>`);
console.log(urls.length+' pages written for '+SITE);
