/* Additive SHOPYHAT visual experience. Existing catalog, orders, search modal and routes remain canonical. */
(function(){
'use strict';
const configDefault={cinematic:true,video_url:'',hero_image_url:'',headline:'Your choice, our gift.',subtitle:'Sarees, three-piece sets, hijab and accessories, chosen with care.',show_ribbon:true,show_floating_cards:true,show_new_arrivals:true,show_categories:true,show_campaigns:true,announcement:'Free delivery on orders above ৳1500',campaign_text:'Discover our new arrivals'};
let cfg={...configDefault},lastNames='',featuredId='';
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n};
const safeMedia=(v)=>{if(typeof v!=='string'||!v.trim())return '';try{const u=new URL(v,location.href);return u.protocol==='https:'?u.href:''}catch{return ''}};
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
 const arrival=el('a','','New Arrivals');arrival.href='#arrivals';arrival.setAttribute('data-sh-arrivals','');
 const sarees=main.querySelector('a[data-p="saree"]');
 if(sarees)sarees.after(arrival);else main.append(arrival);
 arrival.addEventListener('click',()=>setTimeout(()=>document.getElementById('newArrivals')?.scrollIntoView({behavior:'smooth',block:'start'}),80));
 const search=el('div','sh-header-search'),inp=el('input'),results=el('div','sh-suggestions');
 inp.type='search';inp.placeholder=cfg.search_placeholder||'Search for sarees...';inp.setAttribute('aria-label','Search SHOPYHAT products');inp.setAttribute('autocomplete','off');results.hidden=true;
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
  const candidates=list().filter(x=>image(x));
  const p=candidates.find(x=>String(x.subcat||'').toLowerCase()===needle)||candidates.find(x=>
    String(x.cat||'').toLowerCase()===needle||
    String(x.catName||'').toLowerCase().includes(needle)||
    (parent&&String(x.cat||'').toLowerCase()===parent&&String(x.name||'').toLowerCase().includes(needle))
  )||candidates[0]; // Use an existing product photo if this collection has no matching product yet.
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
 root.setProperty('--sans',FONT_UI[ui]);
 root.setProperty('--serif',FONT_DISPLAY[display]);
 root.setProperty('--sh-base-font-size',clampNum(cfg.body_font_size,13,19,15)+'px');
 root.setProperty('--sh-headline-size',String(clampNum(cfg.heading_scale,0.7,1.3,1)));
 root.setProperty('--sh-section-space',String(clampNum(cfg.section_spacing,0.65,1.6,1)));
 root.setProperty('--sh-content-width',clampNum(cfg.content_width,1000,1540,1240)+'px');
 root.setProperty('--sh-hero-min-height',clampNum(cfg.hero_height,500,840,660)+'px');
 root.setProperty('--sh-category-columns',String(Math.round(clampNum(cfg.category_columns,3,5,5))));
 document.body.classList.toggle('sh-custom-category-cols',cfg.category_columns!=null);
 const accent=/^#[0-9a-f]{6}$/i.test(cfg.accent_color||'')?cfg.accent_color:'#f47721';
 root.setProperty('--sh-accent',accent);
 root.setProperty('--ribbon',accent);
 const shade='#'+[1,3,5].map(i=>Math.round(parseInt(accent.slice(i,i+2),16)*.82).toString(16).padStart(2,'0')).join('');
 root.setProperty('--ribbon-d',shade);
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

/* Real image slideshow: accessible arrows/dots, interval control, reduced-motion support. */
const heroManualMedia=()=>matchMedia('(max-width: 820px), (prefers-reduced-motion: reduce)').matches||navigator.connection?.saveData===true;
let slideIndex=0,lastSlideSignature='',slideTimer=null,slidePointerPaused=false,slideFocusPaused=false;
let videoStartTimer=null;
let slideLoadSeq=0,stageActive=0,lastRenderedSlideURL='';
const configuredSlides=()=>{
 if(cfg.hero_media_mode==='video'&&cfg.cinematic!==false&&safeMedia(cfg.video_url))return [];
 const slides=Array.isArray(cfg.hero_slides)?cfg.hero_slides.filter(x=>x&&safeMedia(x.image_url)).slice(0,8):[];
 if(cfg.hero_media_mode==='mixed'&&cfg.cinematic!==false&&safeMedia(cfg.video_url))slides.push({kind:'video',video_url:cfg.video_url});
 return slides;
};
function setHeroTitle(node,title){
 if(!node||!title)return;
 node.replaceChildren();
 const parts=String(title).split(',');
 parts.forEach((part,i)=>{const span=el('span'),italic=el('i','',part.trim()+(i<parts.length-1?',':''));span.append(italic);node.append(span)});
 node.setAttribute('aria-label',title);
}
function setSlide(index,manual=false){
 const slides=configuredSlides(),hero=document.querySelector('#p-home .hero');
 if(!hero||!slides.length)return;
 const nextIndex=(index+slides.length)%slides.length;
 const changed=nextIndex!==slideIndex;
 slideIndex=nextIndex;
 const slide=slides[slideIndex],url=safeMedia(slide.kind==='video'?slide.video_url:slide.image_url);
 hero.classList.add('sh-has-image');
 const stage=hero.querySelector('.sh-slider-stage');
 const renderMedia=stage&&(changed||url!==lastRenderedSlideURL);
 if(renderMedia){
  clearTimeout(videoStartTimer);
  lastRenderedSlideURL=url;
  const movie=stage.querySelector('video');
  if(slide.kind==='video'){
   const seq=++slideLoadSeq;
   if(movie&&(manual||!heroManualMedia())&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const advance=()=>{if(seq===slideLoadSeq)scheduleAdvance(0)};
    const useFallback=()=>{
     if(seq!==slideLoadSeq)return;
     clearTimeout(videoStartTimer);
     movie.pause();
     movie.style.opacity='0';
     scheduleAdvance(photoInterval());
    };
    movie.onplaying=()=>{
     if(seq!==slideLoadSeq)return;
     clearTimeout(videoStartTimer);
     movie.style.opacity='1';
    };
    movie.onerror=useFallback;
    movie.onended=advance;
    if(movie.src!==url)movie.src=url;
    else movie.currentTime=0;
    videoStartTimer=setTimeout(useFallback,15000);
    movie.play().catch(useFallback);
   }
  } else {
  if(movie){
   movie.onplaying=movie.onerror=movie.onended=null;
   movie.pause();
   movie.style.opacity='0';
  }
  const pictures=[...stage.querySelectorAll('img')],prev=pictures[stageActive],nextIndex=1-stageActive,next=pictures[nextIndex];
  const seq=++slideLoadSeq;
  if(next){
   next.onload=()=>{if(seq!==slideLoadSeq)return;next.style.opacity='1';if(prev)prev.style.opacity='0';stageActive=nextIndex};
   next.onerror=()=>{if(seq!==slideLoadSeq)return;next.style.opacity='0'};
   if(next.src===url&&next.complete&&next.naturalWidth)next.onload();
   else next.src=url;
  }
  }
 }

 setHeroTitle(hero.querySelector('h1'),slide.headline||cfg.headline||'Your choice, our gift.');
 const p=hero.querySelector('.wrap p');if(p)p.textContent=slide.subtitle||cfg.subtitle||'Explore our collections.';
 const cta=hero.querySelector('.btns a');if(cta){
  const link=String(slide.cta_url||'').trim();
  cta.href=link.startsWith('#')||/^https:\/\//i.test(link)?link:'#shop/saree';
 }
 const dots=hero.querySelectorAll('.sh-slider-dot');
 dots.forEach((d,i)=>{d.classList.toggle('active',i===slideIndex);d.setAttribute('aria-current',i===slideIndex?'true':'false')});
 const announce=hero.querySelector('.sh-slider-live');if(announce&&manual)announce.textContent='Slide '+(slideIndex+1)+' of '+slides.length;
 if(renderMedia||changed||manual){
  if(slide.kind!=='video')scheduleAdvance(photoInterval());
  else if(renderMedia||changed){clearTimeout(slideTimer);slideTimer=null}
 }
}
function photoInterval(){
 return Math.max(3,Math.min(60,Number(cfg.hero_interval)||8))*1000;
}
function scheduleAdvance(delay){
 clearTimeout(slideTimer);
 slideTimer=null;
 if(configuredSlides().length<2||cfg.hero_autoplay===false||heroManualMedia())return;
 const currentSlide=slideIndex;
 slideTimer=setTimeout(()=>{
  if(currentSlide!==slideIndex||heroManualMedia())return;
  const home=document.getElementById('p-home');
  if(document.hidden||home?.classList.contains('hidden')||slidePointerPaused||slideFocusPaused){
   scheduleAdvance(250);
   return;
  }
  setSlide(slideIndex+1);
 },delay);
}
function syncSlider(){

 const hero=document.querySelector('#p-home .hero');if(!hero)return;
 const slides=configuredSlides();
 hero.classList.toggle('sh-has-rotation',slides.length>0);
 const sig=JSON.stringify([slides,cfg.hero_autoplay,cfg.hero_interval]);
 if(sig===lastSlideSignature){if(slides.length)setSlide(slideIndex);return}
 lastSlideSignature=sig;
 hero.querySelector('.sh-slider-controls')?.remove();
 const oldStage=hero.querySelector('.sh-slider-stage');
 oldStage?.querySelector('video')?.pause();
 oldStage?.remove();
 ++slideLoadSeq;
 clearTimeout(videoStartTimer);
 stageActive=0;lastRenderedSlideURL='';
 clearTimeout(slideTimer);slideTimer=null;
 slidePointerPaused=slideFocusPaused=false;
 if(!slides.length)return;
 const stage=el('div','sh-slider-stage');
 for(let i=0;i<2;i++){const pic=el('img','sh-slider-backdrop');pic.alt='';pic.setAttribute('aria-hidden','true');pic.decoding='async';pic.fetchPriority=i===1?'high':'auto';pic.style.opacity='0';stage.append(pic)}
 const movie=el('video','sh-slider-backdrop');movie.muted=true;movie.loop=false;movie.playsInline=true;movie.preload='none';movie.setAttribute('aria-hidden','true');movie.style.opacity='0';stage.append(movie);
 hero.prepend(stage);
 slideIndex=0;
 if(slides.length>1){
  const controls=el('div','sh-slider-controls'),prev=el('button','sh-slider-arrow','‹'),next=el('button','sh-slider-arrow','›'),dots=el('div','sh-slider-dots');
  controls.setAttribute('aria-label','Hero slideshow navigation');
  prev.type=next.type='button';prev.setAttribute('aria-label','Previous slide');next.setAttribute('aria-label','Next slide');
  prev.onclick=()=>setSlide(slideIndex-1,true);next.onclick=()=>setSlide(slideIndex+1,true);
  slides.forEach((_,i)=>{const dot=el('button','sh-slider-dot');dot.type='button';dot.setAttribute('aria-label','Go to slide '+(i+1));dot.onclick=()=>setSlide(i,true);dots.append(dot)});
  const live=el('span','sh-slider-live');live.setAttribute('aria-live','polite');live.setAttribute('aria-atomic','true');
  controls.append(prev,dots,next,live);hero.append(controls);
  if(!hero.dataset.sliderListeners){hero.dataset.sliderListeners='1';
   let touchStart=null;
   hero.addEventListener('touchstart',e=>{if(e.touches.length===1&&!e.target.closest('a,button'))touchStart=[e.touches[0].clientX,e.touches[0].clientY];else touchStart=null},{passive:true});
   hero.addEventListener('touchcancel',()=>{touchStart=null},{passive:true});
   hero.addEventListener('touchend',e=>{if(!touchStart)return;const t=e.changedTouches[0],dx=t.clientX-touchStart[0],dy=t.clientY-touchStart[1];touchStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)setSlide(slideIndex+(dx<0?1:-1),true)},{passive:true});
   hero.addEventListener('pointerover',e=>{if(e.pointerType==='mouse'&&hero.contains(e.target))slidePointerPaused=true});
   hero.addEventListener('pointerout',e=>{if(e.pointerType==='mouse'&&!hero.contains(e.relatedTarget))slidePointerPaused=false});
   hero.addEventListener('focusin',e=>{slideFocusPaused=true});
   hero.addEventListener('focusout',e=>{if(!hero.contains(e.relatedTarget))slideFocusPaused=false});
  }
 }
 setSlide(0);
}

let aboutPlaybackCleanup;
function getAboutVideos(config){
 const legacy=config.about_media_type==='video'?[{url:config.about_media_url,title:''}]:[];
 const list=Array.isArray(config.about_videos)&&config.about_videos.length?config.about_videos:legacy;
 return list.filter(v=>v&&safeMedia(v.url)).slice(0,6).map(v=>({
  url:safeMedia(v.url),
  title:typeof v.title==='string'?v.title.trim().slice(0,80):'',
  description:typeof v.description==='string'?v.description.trim().slice(0,1200):'',
 }));
}
function mountAboutVideo(media,videos,poster){
 const player=el('div','sh-about-player');
 media.controls=true;
 media.playsInline=true;
 media.muted=true;
 media.defaultMuted=true;
 media.loop=videos.length===1;
 media.preload='metadata';
 if(poster)media.poster=poster;
 const context=el('div');context.style.cssText='margin:0 0 18px;max-width:760px';const contextTitle=el('h3');const contextCopy=el('p');contextCopy.style.cssText='line-height:1.65;white-space:pre-line';context.append(contextTitle,contextCopy);player.append(context,media);

 const sound=el('button','btn line');
 sound.type='button';
 sound.style.marginTop='12px';
 player.append(sound);
 const syncSound=()=>{
  const audible=!media.muted&&media.volume>0;
  const bangla=document.documentElement.lang==='bn';
  sound.textContent=audible
   ?(bangla?'সাউন্ড বন্ধ করুন':'Mute sound')
   :(bangla?'সাউন্ড চালু করুন':'Play with sound');
 };
 sound.addEventListener('click',()=>{
  if(!media.muted&&media.volume>0){
   media.muted=true;
   syncSound();
   return;
  }
  if(media.volume===0)media.volume=1;
  media.muted=false;
  shouldPlay=false;
  syncSound();
  media.play().catch(error=>{
   // Keep muted playback available if the browser rejected the sound request.
   if(error.name!=='NotAllowedError'||media.muted)return;
   media.muted=true;
   syncSound();
   media.play().catch(()=>{});
  });
 });
 media.addEventListener('volumechange',syncSound);
 window.addEventListener('shopyhat:languagechange',syncSound);
 syncSound();

 let active=0;
 let shouldPlay=true;
 let inView=false;
 let select;
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const play=()=>{
  shouldPlay=false;
  media.play().catch(()=>{});
 };
 const showVideo=(index,manual=false)=>{
  active=(index+videos.length)%videos.length;
  contextTitle.textContent=videos[active].title||(active===0?'Discover Fashion. Discover SHOPYHAT.':'SHOPYHAT Film '+(active+1));
  contextCopy.textContent=videos[active].description||(active===0?'Fashion is more than what you wear — it is an expression of who you are. Since 2020, SHOPYHAT has been inspired by the beauty of tradition, contemporary fashion and individual style. Discover a world where elegance meets everyday living. Your Choice, Our Gift.':'');
  contextCopy.hidden=!contextCopy.textContent;
  media.src=videos[active].url;
  if(select)select.value=String(active);
  shouldPlay=true;
  if(manual||inView&&!document.hidden&&!reducedMotion.matches)play();
 };
 if(videos.length>1){
  const nav=el('div','sh-about-video-nav');
  const previous=el('button','btn line','Previous');
  const next=el('button','btn line','Next');
  select=el('select','sh-about-video-select');
  select.setAttribute('aria-label','Choose About Us video');
  previous.type=next.type='button';
  videos.forEach(({title},i)=>{
   const option=el('option','',title||'Video '+(i+1));
   option.value=String(i);
   select.append(option);
  });
  previous.addEventListener('click',()=>showVideo(active-1,true));
  next.addEventListener('click',()=>showVideo(active+1,true));
  select.addEventListener('change',()=>showVideo(Number(select.value),true));
  media.addEventListener('ended',()=>showVideo(active+1,inView&&!document.hidden));
  nav.append(previous,select,next);
  player.append(nav);
 }
 showVideo(0);
 const syncPlayback=()=>{
  if(!player.isConnected)return;
  if(!inView||document.hidden){
   if(!media.paused){shouldPlay=true;media.pause()}
   return;
  }
  if(shouldPlay&&!reducedMotion.matches)play();
 };
 const observer=new IntersectionObserver(([entry])=>{
  inView=entry.isIntersecting&&entry.intersectionRatio>=.35;
  syncPlayback();
 },{threshold:.35});
 observer.observe(media);
 document.addEventListener('visibilitychange',syncPlayback);
 aboutPlaybackCleanup=()=>{
  observer.disconnect();
  document.removeEventListener('visibilitychange',syncPlayback);
  window.removeEventListener('shopyhat:languagechange',syncSound);
  media.pause();
 };
 return player;
}
function decorate(){
 applyDesign();
 const aboutIntro=document.querySelector('#p-about .about-v2-intro');
 const profile=cfg.about_profile||{};
 const applyProfile=(selector,value)=>{const node=document.querySelector(selector);if(!node)return;if(!node.dataset.shOriginal)node.dataset.shOriginal=node.innerHTML;if(value){node.textContent=value;node.style.whiteSpace='pre-line'}else node.innerHTML=node.dataset.shOriginal};
 applyProfile('#p-about .about-v2-intro h2',profile.intro_title);
 applyProfile('#p-about .about-v2-intro p',profile.intro_body);
 applyProfile('#aboutHistoryTitle',profile.history_title);
 const history=document.querySelector('#p-about .about-v2-history-copy');if(history){const paragraphs=[...history.querySelectorAll('p:not(.sh-profile-history)')];let custom=history.querySelector('.sh-profile-history');if(!custom){custom=el('p','sh-profile-history');history.append(custom)}custom.textContent=profile.history_body||'';custom.style.whiteSpace='pre-line';custom.hidden=!profile.history_body;paragraphs.forEach(p=>p.hidden=!!profile.history_body)}
 ['vision','mission','goals'].forEach((key,i)=>applyProfile('#p-about .about-v2-purpose-grid article:nth-child('+(i+1)+') p',profile[key]));

 const videos=getAboutVideos(cfg);
 const aboutPhoto=cfg.about_media_type==='image'?safeMedia(cfg.about_media_url):'';
 let aboutMedia=document.getElementById('shAboutMedia');
 if(aboutIntro&&(videos.length||aboutPhoto)){
  if(!aboutMedia){aboutMedia=el('section');aboutMedia.id='shAboutMedia';aboutMedia.style.cssText='margin:28px auto 48px;max-width:1040px';aboutIntro.after(aboutMedia)}
  const sig=JSON.stringify([videos,aboutPhoto]);
  if(aboutMedia.dataset.signature!==sig){
   aboutPlaybackCleanup?.();
   aboutPlaybackCleanup=undefined;
   aboutMedia.replaceChildren();
   aboutMedia.dataset.signature=sig;
   const heading=el('h2','','Discover SHOPYHAT');heading.style.cssText='margin:0 0 18px;font-size:clamp(24px,4vw,38px)';
   const media=el(videos.length?'video':'img');
   media.style.cssText='display:block;width:100%;max-height:620px;aspect-ratio:16/9;object-fit:contain;background:#21150e;border-radius:16px';
   if(!videos.length){
    media.alt='SHOPYHAT fashion and brand story';
    media.loading='lazy';
    media.src=aboutPhoto;
   }
   const player=videos.length?mountAboutVideo(media,videos,aboutPhoto):media;
   aboutMedia.append(heading,player);
  }
 }else if(aboutMedia){
  aboutPlaybackCleanup?.();
  aboutPlaybackCleanup=undefined;
  aboutMedia.remove();
 }

 const storyAnchor=document.getElementById('shAboutMedia')||aboutIntro;
 const sample={title:'Rooted in Tradition. Styled for Today.',description:'Fashion is a personal expression of who we are. At SHOPYHAT, we celebrate the beauty of Bengali traditions alongside contemporary style. From elegant sarees to versatile three-piece sets and hijabs, our vision is to make discovering your own style a simple, enjoyable experience.',images:['saree','hijab','campaign'].map(x=>'/assets/hero/shopyhat-cinematic-'+x+'.png')};
 const stories=Array.isArray(cfg.about_stories)?cfg.about_stories:[sample];
 const photos=Array.isArray(cfg.about_photos)?cfg.about_photos:[];
 function renderAboutGallery(id,heading,items,anchor){
 if(!anchor)return null;
 let section=document.getElementById(id);
 if(!items.length){section?.remove();return null}
 if(!section){section=el('section');section.id=id;section.style.cssText='max-width:1040px;margin:36px auto 48px;padding:0 16px';anchor.after(section)}
 const sig=JSON.stringify(items);if(section.dataset.signature===sig)return section;section.dataset.signature=sig;section.replaceChildren(el('h2','',heading));
 for(const item of items){
 if(!item)continue;
 const article=el('article');article.style.cssText='border:1px solid #d8c6b5;border-radius:18px;overflow:hidden;margin:16px 0;padding:16px';
 if(item.title)article.append(el('h3','',item.title));if(item.description){const p=el('p','',item.description);p.style.whiteSpace='pre-line';article.append(p)}
 const images=(item.images||[item]).map(x=>typeof x==='string'?{url:x}:x).filter(x=>x&&safeMedia(x.url));
 if(images.length){let i=0;const frame=el('img');frame.loading='lazy';frame.style.cssText='display:block;width:100%;aspect-ratio:16/9;object-fit:contain;background:#21150e;border-radius:12px';
 const title=el('h4'),copy=el('p'),count=el('span');copy.style.whiteSpace='pre-line';count.setAttribute('aria-live','polite');
 const nav=el('div');nav.style.cssText='display:flex;align-items:center;justify-content:center;gap:16px;padding:8px';
 const prev=el('button','','‹'),next=el('button','','›');for(const btn of [prev,next]){btn.type='button';btn.style.cssText='width:44px;height:44px;border-radius:50%;background:#21150e;color:white;border:1px solid #a98a72'}prev.setAttribute('aria-label','Previous photo');next.setAttribute('aria-label','Next photo');
 const show=()=>{const x=images[i];frame.src=safeMedia(x.url);frame.alt=x.title||item.title||'SHOPYHAT';title.textContent=item.images?x.title||'':'';copy.textContent=item.images?x.description||'':'';title.hidden=!title.textContent;copy.hidden=!copy.textContent;count.textContent=(i+1)+' / '+images.length};
 prev.onclick=()=>{i=(i+images.length-1)%images.length;show()};next.onclick=()=>{i=(i+1)%images.length;show()};nav.append(prev,count,next);nav.hidden=images.length<2;article.append(frame,nav,title,copy);show()}
 section.append(article)}
 return section;
 }
 const gallery=renderAboutGallery('shAboutPhotos','Our Photo Gallery',photos,storyAnchor);

 const anchor=gallery||storyAnchor;
 if(anchor){
 let section=document.getElementById('shInsideStory');
 const slides=stories.filter(Boolean).flatMap(item=>{const images=(Array.isArray(item.images)?item.images:[]).map(x=>typeof x==='string'?{url:x}:x).filter(x=>x&&safeMedia(x.url));return images.length?images.map(photo=>({item,photo})):item.title||item.description?[{item,photo:null}]:[]});
 if(!slides.length)section?.remove();
 else {
 if(!section){section=el('section');section.id='shInsideStory';section.style.cssText='max-width:1040px;margin:36px auto 48px;padding:0 16px';anchor.after(section)}
 const sig='carousel-v2'+JSON.stringify(slides);
 if(section.dataset.signature!==sig){
 section.dataset.signature=sig;section.replaceChildren(el('h2','','Inside SHOPYHAT'),el('p','','Our stories. Our inspiration. Our identity.'));
 const article=el('article');article.style.cssText='border:1px solid #d8c6b5;border-radius:18px;padding:clamp(12px,3vw,28px);overflow:hidden';
 const title=el('h3'),body=el('p'),pt=el('h4'),pc=el('p'),counter=el('span');body.style.whiteSpace=pc.style.whiteSpace='pre-line';counter.setAttribute('aria-live','polite');

 const stage=el('div');stage.style.cssText='display:grid;grid-template-columns:clamp(32px,6vw,48px) minmax(0,1fr) clamp(32px,6vw,48px);align-items:center;gap:4px';
 const open=el('button');open.type='button';open.setAttribute('aria-label','Enlarge photo');open.style.cssText='position:relative;display:block;width:100%;padding:0;border:0;background:transparent;cursor:zoom-in;min-width:0';
 const img=el('img');img.style.cssText='display:block;width:100%;aspect-ratio:16/9;object-fit:contain;background:#21150e;border-radius:12px';
 const hint=el('span','','⤢');hint.style.cssText='position:absolute;right:8px;top:8px;background:#21150ed9;color:white;border-radius:50%;width:32px;height:32px;display:grid;place-items:center;font-size:22px';open.append(img,hint);
 const prev=el('button','','‹'),next=el('button','','›');for(const btn of [prev,next]){btn.type='button';btn.style.cssText='width:100%;aspect-ratio:1;border:1px solid #cbb5a3;border-radius:50%;background:#21150e;color:white;font-size:24px;padding:0;cursor:pointer'}prev.setAttribute('aria-label','Previous story');next.setAttribute('aria-label','Next story');
 const dialog=el('dialog');dialog.setAttribute('aria-label','Enlarged story photo');dialog.style.cssText='position:fixed;inset:0;margin:auto;width:min(96vw,1400px);max-width:96vw;max-height:94vh;padding:12px;border:0;border-radius:16px;background:#21150e;color:white;box-shadow:0 0 0 100vmax #000b;overflow:auto;z-index:99999';
 const close=el('button','','Close ×');close.type='button';close.style.cssText='display:block;margin:0 0 8px auto;padding:10px;border-radius:20px;background:#fff;color:#21150e;border:0';const large=el('img');large.style.cssText='display:block;width:100%;max-height:78vh;object-fit:contain';const cap=el('p');cap.style.cssText='text-align:center;margin:8px 0 0';dialog.append(close,large,cap);close.onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 let i=0;const show=()=>{const {item,photo}=slides[i];for(const [node,value] of [[title,item.title],[body,item.description],[pt,photo?.title],[pc,photo?.description]]){node.textContent=value||'';node.hidden=!value}open.style.visibility=photo?'visible':'hidden';if(photo){img.src=safeMedia(photo.url);img.alt=photo.title||item.title||'SHOPYHAT'}else img.removeAttribute('src');for(const btn of [prev,next])btn.style.visibility=slides.length<2?'hidden':'visible';stage.style.gridTemplateColumns=slides.length<2?'0 minmax(0,1fr) 0':'clamp(32px,6vw,48px) minmax(0,1fr) clamp(32px,6vw,48px)';stage.style.gap=slides.length<2?'0':'4px';counter.textContent=(i+1)+' / '+slides.length;counter.hidden=slides.length<2};
 const move=n=>{i=(i+n+slides.length)%slides.length;show()};prev.onclick=()=>move(-1);next.onclick=()=>move(1);
 let start=null,swiped=false;stage.style.touchAction='pan-y';stage.addEventListener('touchstart',e=>{start=e.touches[0].clientX;swiped=false},{passive:true});stage.addEventListener('touchend',e=>{if(start!==null){const dx=e.changedTouches[0].clientX-start;if(Math.abs(dx)>50){swiped=true;move(dx<0?1:-1)}}start=null},{passive:true});stage.addEventListener('touchcancel',()=>{start=null;swiped=false});
 open.onclick=()=>{if(swiped){swiped=false;return}const {item,photo}=slides[i];if(!photo)return;large.src=safeMedia(photo.url);large.alt=img.alt;cap.textContent=photo.title||item.title||'';if(typeof dialog.showModal==='function')dialog.showModal();else window.open(large.src,'_blank','noopener')};
 counter.style.cssText='display:block;text-align:center;margin:8px 0;color:inherit';stage.append(prev,open,next);article.append(title,body,stage,counter,pt,pc,el('p','','Your Choice, Our Gift.'),dialog);section.append(article);show();
 }
 }
 }

 const hero=document.querySelector('#p-home .hero');if(!hero)return;
 hero.classList.toggle('sh-cinematic',cfg.cinematic!==false);
 const imageURL=safeMedia(cfg.hero_image_url||'./assets/shopyhat-cinematic-art.svg');hero.classList.toggle('sh-has-image',!!imageURL);if(imageURL)hero.style.setProperty('--sh-hero-image','url("'+imageURL.replaceAll('"','%22')+'")');else hero.style.removeProperty('--sh-hero-image');
 hero.classList.toggle('sh-no-ribbon',!cfg.show_ribbon);hero.classList.toggle('sh-no-cards',!cfg.show_floating_cards);
 let video=hero.querySelector('.sh-hero-video');const videoURL=cfg.hero_media_mode==='slides'||configuredSlides().length?'':safeMedia(cfg.video_url);
 if(videoURL&&cfg.cinematic!==false&&!heroManualMedia()) {if(!video){video=el('video','sh-hero-video');video.muted=true;video.autoplay=true;video.loop=true;video.playsInline=true;hero.prepend(video)}if(video.src!==videoURL){video.style.opacity='0';video.onplaying=()=>{video.style.opacity='1'};video.onerror=()=>{video.style.opacity='0'};video.src=videoURL}}else video?.remove();
 const h=hero.querySelector('h1');if(h&&cfg.headline){const words=String(cfg.headline).split(',');h.innerHTML='';h.setAttribute('aria-label',cfg.headline);words.forEach((w,i)=>{const sp=el('span'),em=el('i','',w.trim()+(i<words.length-1?',':''));sp.append(em);h.append(sp)})}
 const desc=hero.querySelector('.wrap p');if(desc&&cfg.subtitle)desc.textContent=cfg.subtitle;
 const buttons=hero.querySelectorAll('.btns a');if(buttons[0]&&cfg.primary_cta)buttons[0].textContent=cfg.primary_cta;
 if(buttons[1]&&cfg.secondary_cta)buttons[1].textContent=cfg.secondary_cta;
 const searchField=document.querySelector('.sh-header-search input');if(searchField)searchField.placeholder=cfg.search_placeholder||'Search for sarees...';
 const replaceTitle=(selector,value)=>{const node=document.querySelector(selector);if(node&&typeof value==='string'&&value.trim())node.textContent=value.trim()};
 replaceTitle('#p-home .collection-section h2',cfg.categories_title);
 replaceTitle('#newArrivals h2',cfg.arrivals_title);
 replaceTitle('#saleSec h2',cfg.offers_title);
 replaceTitle('#p-home .band h2',cfg.story_title);
 if(!hero.querySelector('.sh-eyebrow')){const eyebrow=el('div','sh-eyebrow','PREMIUM FASHION COLLECTION');hero.querySelector('.wrap>div')?.prepend(eyebrow)}
 const eyebrow=hero.querySelector('.sh-eyebrow');if(eyebrow&&cfg.hero_eyebrow)eyebrow.textContent=cfg.hero_eyebrow;
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
 syncSlider();
}
async function load(){if(new URLSearchParams(location.search).get('studio_preview')==='1'){decorate();return}try{const r=await fetch(SH_DB_URL+'/rest/v1/sh_storefront_experience?id=eq.1&select=config',{headers:{apikey:SH_DB_KEY}});if(!r.ok)throw Error('settings unavailable');const rows=await r.json();if(rows[0]?.config)cfg={...cfg,...rows[0].config}}catch(e){console.info('Using default SHOPYHAT experience:',e.message)}decorate()}
// Preview messages run only when this storefront is framed by its same-origin Admin Studio.
// Never persist preview settings, alter backend records, or accept cross-origin messages.
if(new URLSearchParams(location.search).get('studio_preview')==='1'){
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==window.parent)return;
  if(event.data?.type!=='shopyhat:studio-preview'||!event.data.config||typeof event.data.config!=='object')return;
  const preview=event.data.config;
  const allowed=['announcement','headline','subtitle','hero_image_url','video_url','hero_media_mode','about_media_type','about_media_url','about_videos','about_photos','about_stories','campaign_text','hero_eyebrow','primary_cta','secondary_cta','search_placeholder','categories_title','arrivals_title','offers_title','story_title','cinematic','show_ribbon','show_floating_cards','show_new_arrivals','show_categories','show_campaigns','ui_font','heading_font','hero_alignment','hero_vertical','hero_image_position','product_card_side','body_font_size','heading_scale','content_width','section_spacing','hero_height','category_columns','accent_color','section_order','hero_slides','hero_autoplay','hero_interval'];
  for(const key of allowed){if(Object.prototype.hasOwnProperty.call(preview,key))cfg[key]=preview[key]}
  decorate();
  if(event.data.view==='about')location.hash='#about';
  const slideView=typeof event.data.view==='string'?event.data.view.match(/^slide:([0-7])$/):null;
  if(event.data.view==='home'||event.data.view==='video'||slideView)location.hash='#home';
  if(slideView)setSlide(Number(slideView[1]));
  if(event.data.view==='video'&&configuredSlides().at(-1)?.kind==='video')setSlide(configuredSlides().length-1);
 });
}

nav();decorate();load();
const watched=document.getElementById('homeGrid');
if(watched){let pending=false;const observer=new MutationObserver(()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;populateMega();decorate()})}});observer.observe(watched,{childList:true})}
window.addEventListener('hashchange',()=>setTimeout(()=>{if(location.hash.startsWith('#home'))decorate()},30));
})();

