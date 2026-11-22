/* Additive SHOPYHAT visual experience. Existing catalog, orders, search modal and routes remain canonical. */
(function(){
'use strict';
const configDefault={cinematic:true,video_url:'',hero_image_url:'',headline:'Your choice, our gift.',subtitle:'Sarees, three-piece sets, hijab and accessories, chosen with care.',show_ribbon:true,show_floating_cards:true,show_new_arrivals:true,show_categories:true,show_campaigns:true,announcement:'Free delivery on orders above ৳1500',campaign_text:'Discover our new arrivals'};
let cfg={...configDefault},lastNames='',featuredId='';
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n};
const safeMedia=(v)=>{try{const u=new URL(v,location.href);return u.protocol==='https:'?u.href:''}catch{return ''}};
const list=()=>typeof PRODUCTS!=='undefined'?PRODUCTS:[];
function image(p){try{return typeof storefrontCover==='function'?safeMedia(storefrontCover(p)):''}catch{return ''}}
function nav(){
 const header=document.querySelector('.site .hd'),main=document.getElementById('mainNav');
 if(!header||!main||document.getElementById('shMegaTrigger'))return;
 const shop=main.querySelector('a[data-p="shop"]');
 if(shop){const host=el('div','sh-menu-host'),trigger=el('button','sh-menu-trigger','Shop ⌄'),mega=el('div','sh-mega');
 trigger.id='shMegaTrigger';trigger.type='button';trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','shMegaGrid');mega.hidden=true;
 mega.innerHTML='<div class="sh-mega-title">Explore the collections</div><div class="sh-mega-grid" id="shMegaGrid"></div>';
 shop.replaceWith(host);host.append(trigger,mega);
 const open=val=>{mega.hidden=!val;trigger.setAttribute('aria-expanded',String(val));if(val)populateMega()};
 trigger.addEventListener('click',e=>{e.stopPropagation();open(mega.hidden)});
 host.addEventListener('keydown',e=>{if(e.key==='Escape'){open(false);trigger.focus()}});
 document.addEventListener('click',e=>{if(!host.contains(e.target))open(false)});
 window.addEventListener('hashchange',()=>open(false));
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
 // Prefer actual published subcategories. A lone root must not produce a huge tile.
 const children=roots.flatMap(root=>typeof activeChildren==='function'?activeChildren(root.id).map(c=>({name:c.name,match:c.slug,slug:root.slug+'/'+c.slug,parent:root.slug})):[]);
 const picks=(children.length?children:roots.length>1?roots.map(c=>({name:c.name,match:c.slug,slug:c.slug})):cats).slice(0,8);
 host.style.removeProperty('grid-template-columns');
 host.replaceChildren();
 picks.forEach(c=>{
  const a=el('a','sh-mega-card'),photo=el('div','sh-photo');
  const needle=String(c.match||'').toLowerCase(),parent=String(c.parent||'').toLowerCase();
  const p=list().find(x=>String(x.subcat||'').toLowerCase()===needle)||list().find(x=>
    String(x.cat||'').toLowerCase()===needle||
    String(x.catName||'').toLowerCase().includes(needle)||
    (parent&&String(x.cat||'').toLowerCase()===parent&&String(x.name||'').toLowerCase().includes(needle))
  );
  a.href='#shop/'+(c.slug||p?.cat||c.match).split('/').map(encodeURIComponent).join('/');
  if(p&&image(p)){const img=el('img');img.src=image(p);img.alt=c.name;img.loading='lazy';img.onerror=()=>{img.remove();photo.textContent=c.name};photo.append(img)}
  else photo.textContent=c.name;
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
/* Visual Design Studio: validated whitelist values, no arbitrary CSS injection. */
const FONT_UI={
 'Instrument Sans':'"Instrument Sans","Hind Siliguri",system-ui,sans-serif',
 'Inter':'Inter,"Hind Siliguri",system-ui,sans-serif',
 'Manrope':'Manrope,"Hind Siliguri",system-ui,sans-serif',
 'Plus Jakarta Sans':'"Plus Jakarta Sans","Hind Siliguri",system-ui,sans-serif'
};
const FONT_DISPLAY={
 'Bodoni Moda':'"Bodoni Moda",Georgia,serif',
 'Playfair Display':'"Playfair Display",Georgia,serif',
 'DM Serif Display':'"DM Serif Display",Georgia,serif',
 'Inter':'Inter,system-ui,sans-serif'
};
function validatedChoice(v,options,fallback){return options.includes(v)?v:fallback}
function clampNum(v,min,max,defaultValue){const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):defaultValue}
function applyDesign(){
 const root=document.documentElement.style;
 const ui=validatedChoice(cfg.ui_font,Object.keys(FONT_UI),'Instrument Sans');
 const display=validatedChoice(cfg.heading_font,Object.keys(FONT_DISPLAY),'Bodoni Moda');
 root.setProperty('--sh-ui-font',FONT_UI[ui]);
 root.setProperty('--sh-display-font',FONT_DISPLAY[display]);
 root.setProperty('--sh-base-font-size',clampNum(cfg.body_font_size,13,19,15)+'px');
 root.setProperty('--sh-headline-size',String(clampNum(cfg.heading_scale,0.7,1.3,1)));
 root.setProperty('--sh-section-space',String(clampNum(cfg.section_spacing,0.65,1.6,1)));
 root.setProperty('--sh-content-width',clampNum(cfg.content_width,1000,1540,1240)+'px');
 root.setProperty('--sh-hero-min-height',clampNum(cfg.hero_height,500,840,660)+'px');
 root.setProperty('--sh-category-columns',String(Math.round(clampNum(cfg.category_columns,3,5,5))));
 document.body.classList.toggle('sh-custom-category-cols',cfg.category_columns!=null);
 const accent=/^#[0-9a-f]{6}$/i.test(cfg.accent_color||'')?cfg.accent_color:'#f47721';
 root.setProperty('--sh-accent',accent);
 root.setProperty('--sh-hero-position',validatedChoice(cfg.hero_image_position,['center top','center center','center bottom','left center','right center'],'center center'));
 const hero=document.querySelector('#p-home .hero');
 if(hero){
  hero.classList.toggle('sh-layout-center',cfg.hero_alignment==='center');
  hero.classList.toggle('sh-layout-right',cfg.hero_alignment==='right');
  hero.classList.toggle('sh-vertical-top',cfg.hero_vertical==='top');
  hero.classList.toggle('sh-vertical-bottom',cfg.hero_vertical==='bottom');
  hero.classList.toggle('sh-card-left',cfg.product_card_side==='left');
  hero.classList.toggle('sh-card-hidden',cfg.product_card_side==='hidden');
 }
 // Reorder only homepage sections that have explicit editor controls.
 const home=document.querySelector('#p-home'),order=Array.isArray(cfg.section_order)?cfg.section_order:[];
 const ids=['trust','categories','arrivals','offers','story','recent'];
 const sections={
  trust:home?.querySelector('.facts'),
  categories:home?.querySelector('.collection-section'),
  arrivals:home?.querySelector('#newArrivals'),
  offers:home?.querySelector('#saleSec'),
  story:home?.querySelector('.band'),
  recent:home?.querySelector('#rvSec')
 };
 if(home){
  const present=Object.fromEntries(ids.map(id=>[id,sections[id]]));
  const after=home.querySelector('#shCampaign')||home.querySelector('.hero');
  // Only reorder when an explicit full safe order was saved; all other sections stay untouched.
  if(order.length===ids.length&&ids.every(id=>order.includes(id))){
   let target=after;
   for(const id of order){const node=present[id];if(node){target.after(node);target=node}}
  }
 }
}

function decorate(){
 applyDesign();
 const hero=document.querySelector('#p-home .hero');if(!hero)return;
 hero.classList.toggle('sh-cinematic',cfg.cinematic!==false);
 const imageURL=safeMedia(cfg.hero_image_url||'./assets/shopyhat-cinematic-art.svg');hero.classList.toggle('sh-has-image',!!imageURL);if(imageURL)hero.style.setProperty('--sh-hero-image','url("'+imageURL.replaceAll('"','%22')+'")');else hero.style.removeProperty('--sh-hero-image');
 hero.classList.toggle('sh-no-ribbon',!cfg.show_ribbon);hero.classList.toggle('sh-no-cards',!cfg.show_floating_cards);
 let video=hero.querySelector('.sh-hero-video');const videoURL=safeMedia(cfg.video_url);
 if(videoURL&&cfg.cinematic!==false&&!(window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {if(!video){video=el('video','sh-hero-video');video.muted=true;video.autoplay=true;video.loop=true;video.playsInline=true;hero.prepend(video)}if(video.src!==videoURL)video.src=videoURL}else video?.remove();
 const h=hero.querySelector('h1');if(h&&cfg.headline){const words=String(cfg.headline).split(',');h.innerHTML='';h.setAttribute('aria-label',cfg.headline);words.forEach((w,i)=>{const sp=el('span'),em=el('i','',w.trim()+(i<words.length-1?',':''));sp.append(em);h.append(sp)})}
 const desc=hero.querySelector('.wrap p');if(desc&&cfg.subtitle)desc.textContent=cfg.subtitle;
 if(!hero.querySelector('.sh-eyebrow')){const eyebrow=el('div','sh-eyebrow','PREMIUM FASHION COLLECTION');hero.querySelector('.wrap>div')?.prepend(eyebrow)}
 const candidate=list().find(p=>p.isNew&&image(p))||list().find(p=>image(p));
 let feature=hero.querySelector('.sh-featured');
 if(candidate&&cfg.show_floating_cards!==false){
  if(!feature){feature=el('button','sh-featured');feature.type='button';feature.setAttribute('aria-label','View featured product');hero.append(feature)}
  if(featuredId!==String(candidate.id)){
   feature.replaceChildren();
   const photo=el('img');photo.src=image(candidate);photo.alt=candidate.name;photo.loading='eager';photo.onerror=()=>{feature.hidden=true};
   const chip=el('span','sh-featured-badge',candidate.isNew?'New Arrival':'Featured');
   const title=el('span','sh-featured-title',candidate.name);
   const price=el('span','sh-featured-price',typeof money==='function'?money(candidate.price):'৳'+candidate.price);
   const arrow=el('span','sh-featured-arrow','↗');feature.append(photo,chip,title,arrow,price);
   feature.onclick=()=>typeof openProduct==='function'&&openProduct(candidate.id);
   featuredId=String(candidate.id);
  }
  feature.hidden=false;
 } else if(feature)feature.hidden=true;
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
