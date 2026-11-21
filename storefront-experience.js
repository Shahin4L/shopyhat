/* Additive SHOPYHAT visual experience. Existing catalog, orders, search modal and routes remain canonical. */
(function(){
'use strict';
const configDefault={cinematic:true,video_url:'',hero_image_url:'',headline:'Your choice, our gift.',subtitle:'Sarees, three-piece sets, hijab and accessories, chosen with care.',show_ribbon:true,show_floating_cards:true,show_new_arrivals:true,show_categories:true,show_campaigns:true,announcement:'Free delivery on orders above ৳1500',campaign_text:'Discover our new arrivals'};
let cfg={...configDefault},lastNames='';
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n};
const safeMedia=(v)=>{try{const u=new URL(v,location.href);return u.protocol==='https:'?u.href:''}catch{return ''}};
const list=()=>typeof PRODUCTS!=='undefined'?PRODUCTS:[];
function image(p){try{return typeof storefrontCover==='function'?safeMedia(storefrontCover(p)):''}catch{return ''}}
function nav(){
 const header=document.querySelector('.site .hd'),main=document.getElementById('mainNav');
 if(!header||!main||document.getElementById('shMegaTrigger'))return;
 const shop=main.querySelector('a[data-p="shop"]');
 if(shop){const host=el('div','sh-menu-host'),trigger=el('button','sh-menu-trigger','Shop ⌄'),mega=el('div','sh-mega');
 trigger.id='shMegaTrigger';trigger.type='button';trigger.setAttribute('aria-expanded','false');mega.hidden=true;
 mega.innerHTML='<div class="sh-mega-title">Explore the collections</div><div class="sh-mega-grid" id="shMegaGrid"></div>';
 shop.replaceWith(host);host.append(trigger,mega);
 const open=val=>{mega.hidden=!val;trigger.setAttribute('aria-expanded',String(val));if(val)populateMega()};
 trigger.addEventListener('click',()=>open(mega.hidden));host.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover)').matches)open(true)});
 host.addEventListener('mouseleave',()=>open(false));host.addEventListener('keydown',e=>{if(e.key==='Escape'){open(false);trigger.focus()}});
 document.addEventListener('click',e=>{if(!host.contains(e.target))open(false)});
 }
 const arrival=el('a','','New Arrivals');arrival.href='#home';arrival.setAttribute('data-sh-arrivals','');
 arrival.addEventListener('click',()=>setTimeout(()=>document.getElementById('newArrivals')?.scrollIntoView({behavior:'smooth'}),40));
 main.append(arrival);
 const search=el('div','sh-header-search'),inp=el('input'),results=el('div','sh-suggestions');
 inp.type='search';inp.placeholder='Search for sarees...';inp.setAttribute('aria-label','Search SHOPYHAT products');inp.setAttribute('autocomplete','off');results.hidden=true;
 search.append(inp,results);header.insertBefore(search,header.querySelector('.icons'));
 inp.addEventListener('input',()=>suggest(inp.value,results));
 inp.addEventListener('focus',()=>suggest(inp.value,results));
 inp.addEventListener('keydown',e=>{if(e.key==='Escape')results.hidden=true;if(e.key==='Enter'){e.preventDefault();const q=inp.value.trim();if(q){results.hidden=true;typeof openSearch==='function'&&openSearch();const overlay=document.getElementById('sIn');if(overlay){overlay.value=q;renderSearch(q)}}}});
 document.addEventListener('click',e=>{if(!search.contains(e.target))results.hidden=true});
}
function populateMega(){
 const host=document.getElementById('shMegaGrid');if(!host)return;
 const roots=typeof activeRoots==='function'?activeRoots():[];
 const cats=[{name:'Sarees',match:'saree'},{name:'Three-piece',match:'three'},{name:'Hijab',match:'hijab'},{name:'Accessories',match:'accessor'}];
 const dynamic=roots.length?roots.map(c=>({name:c.name,match:c.slug,slug:c.slug})):cats;
 const picks=dynamic.slice(0,8);
 host.style.gridTemplateColumns='repeat('+Math.min(4,picks.length)+',minmax(0,1fr))';
 host.replaceChildren();
 picks.forEach(c=>{
  const a=el('a','sh-mega-card'),photo=el('div','sh-photo'),p=list().find(x=>String(x.cat||'').toLowerCase().includes(c.match)||String(x.catName||'').toLowerCase().includes(c.match));
  a.href='#shop/'+encodeURIComponent(c.slug||p?.cat||c.match);if(p&&image(p)){const img=el('img');img.src=image(p);img.alt=c.name;img.loading='lazy';photo.append(img)}else photo.textContent=c.name;
  a.append(photo,el('span','',c.name));host.append(a);
 });
}
function suggest(q,host){q=q.trim().toLowerCase();host.replaceChildren();
 if(q.length<2){host.hidden=true;return}
 const matches=list().filter(p=>[p.name,p.catName,p.nameBn,p.desc].filter(Boolean).join(' ').toLowerCase().includes(q)).slice(0,6);
 matches.forEach(p=>{const b=el('button','sh-suggest');b.type='button';const url=image(p);if(url){const im=el('img');im.src=url;im.alt='';b.append(im)}
 const d=el('span');d.append(el('strong','',p.name),el('small','',typeof money==='function'?money(p.price):'৳'+p.price));b.append(d);
 b.addEventListener('click',()=>{host.hidden=true;typeof openProduct==='function'&&openProduct(p.id)});host.append(b)});
 if(!matches.length)host.append(el('div','sh-suggest','No matching products'));host.hidden=false;
}
function decorate(){
 const hero=document.querySelector('#p-home .hero');if(!hero)return;
 hero.classList.toggle('sh-cinematic',cfg.cinematic!==false);
 const imageURL=safeMedia(cfg.hero_image_url);hero.classList.toggle('sh-has-image',!!imageURL);if(imageURL)hero.style.setProperty('--sh-hero-image','url("'+imageURL.replaceAll('"','%22')+'")');else hero.style.removeProperty('--sh-hero-image');
 hero.classList.toggle('sh-no-ribbon',!cfg.show_ribbon);hero.classList.toggle('sh-no-cards',!cfg.show_floating_cards);
 let video=hero.querySelector('.sh-hero-video');const videoURL=safeMedia(cfg.video_url);
 if(videoURL&&cfg.cinematic!==false){if(!video){video=el('video','sh-hero-video');video.muted=true;video.autoplay=true;video.loop=true;video.playsInline=true;hero.prepend(video)}if(video.src!==videoURL)video.src=videoURL}else video?.remove();
 const h=hero.querySelector('h1');if(h&&cfg.headline){const words=String(cfg.headline).split(',');h.innerHTML='';h.setAttribute('aria-label',cfg.headline);words.forEach((w,i)=>{const sp=el('span'),em=el('i','',w.trim()+(i<words.length-1?',':''));sp.append(em);h.append(sp)})}
 const desc=hero.querySelector('.wrap p');if(desc&&cfg.subtitle)desc.textContent=cfg.subtitle;
 if(!hero.querySelector('.sh-eyebrow')){const eyebrow=el('div','sh-eyebrow','PREMIUM FASHION COLLECTION');hero.querySelector('.wrap>div')?.prepend(eyebrow)}
 let float=hero.querySelector('.sh-cards');if(!float){float=el('div','sh-cards');hero.append(float)}
 const found=list().filter(p=>image(p)).slice(0,3),signature=found.map(p=>p.id).join(',');
 if(signature!==lastNames){float.replaceChildren();found.forEach((p,i)=>{const img=el('img');img.src=image(p);img.alt='';img.style.setProperty('--tilt',[-8,7,-6][i]+'deg');float.append(img)});lastNames=signature}
 const arrivals=document.getElementById('newArrivals'),mosaic=document.getElementById('mosaic');
 if(arrivals)arrivals.classList.toggle('hidden',cfg.show_new_arrivals===false);
 if(mosaic?.closest('section'))mosaic.closest('section').classList.toggle('hidden',cfg.show_categories===false);
 let campaign=document.getElementById('shCampaign');
 if(!campaign){campaign=el('section','sh-campaign');campaign.id='shCampaign';hero.after(campaign)}
 campaign.replaceChildren(el('b','',cfg.campaign_text||'Discover our new arrivals'));campaign.classList.toggle('hidden',cfg.show_campaigns===false);
 let ann=document.getElementById('shAnnouncement');
 if(!ann){ann=el('div','sh-announcement');ann.id='shAnnouncement';document.querySelector('.ann')?.after(ann)}
 ann.textContent=cfg.announcement||'';ann.hidden=!cfg.announcement;
}
async function load(){try{const r=await fetch(SH_DB_URL+'/rest/v1/sh_storefront_experience?id=eq.1&select=config',{headers:{apikey:SH_DB_KEY}});if(!r.ok)throw Error('settings unavailable');const rows=await r.json();if(rows[0]?.config)cfg={...cfg,...rows[0].config}}catch(e){console.info('Using default SHOPYHAT experience:',e.message)}decorate()}
nav();decorate();load();
const watched=document.getElementById('homeGrid');
if(watched){let pending=false;const observer=new MutationObserver(()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;populateMega();decorate()})}});observer.observe(watched,{childList:true})}
window.addEventListener('hashchange',()=>setTimeout(()=>{if(location.hash.startsWith('#home'))decorate()},30));
})();
