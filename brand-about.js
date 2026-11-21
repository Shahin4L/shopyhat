/* SHOPYHAT brand logo settings + About Us live catalog gallery.
   Reads only the public brand record. A failing request preserves the existing default logo. */
(()=>{
  'use strict';
  const supabase='https://xwfqgmgiunlxzvzoermn.supabase.co';
  const key='sb_publishable_Tk-PzYsM3YxnDsjicnMdzQ_mQsREdkP';
  function applyBrandUrl(url,stamp){
    if(!url||!/^https:\/\/xwfqgmgiunlxzvzoermn\.supabase\.co\/storage\/v1\/object\/public\/shopyhat-branding\//i.test(url))return;
    const fresh=url+(url.includes('?')?'&':'?')+'v='+encodeURIComponent(stamp||'1');
    document.querySelectorAll('img[data-logo]').forEach(img=>{
      const previous=img.src;
      img.onerror=()=>{img.onerror=null;img.src=previous};
      img.src=fresh;
    });
  }
  async function loadBrandLogo(){
    try{
      const endpoint=supabase+'/rest/v1/sh_brand_settings?select=logo_url,updated_at&id=eq.primary&limit=1';
      const response=await fetch(endpoint,{headers:{apikey:key},cache:'no-store'});
      if(!response.ok)throw Error('Brand setting not reachable');
      const rows=await response.json();
      if(rows?.[0]?.logo_url)applyBrandUrl(rows[0].logo_url,rows[0].updated_at);
    }catch(e){console.warn('Using default SHOPYHAT logo:',e.message)}
  }
  function getProductImages(){
    const collection=(typeof PRODUCTS!=='undefined'&&Array.isArray(PRODUCTS))?PRODUCTS:[];
    const result=[],used=new Set();
    for(const p of collection){
      let url='';
      try{if(typeof shImgCandidates==='function')url=(shImgCandidates(p,null)||[])[0]||''}catch{}
      if(!url||used.has(url))continue;
      used.add(url);
      result.push({url,id:p.id,name:p.name,category:p.cat||''});
      if(result.length>=6)break;
    }
    return result;
  }
  function refreshGallery(){
    const gallery=document.getElementById('aboutRealGallery');
    if(!gallery)return;
    const items=getProductImages();
    if(!items.length){
      gallery.innerHTML='<div class="about-v2-gallery-empty">Explore our collection as new product photos become available. <a href="#shop">Browse products</a></div>';
      return;
    }
    gallery.replaceChildren();
    for(const item of items.slice(0,3)){
      const a=document.createElement('a');
      a.href='#p/'+encodeURIComponent(item.id);
      a.className='about-v2-gallery-card about-reveal';
      const img=document.createElement('img');
      img.src=item.url;
      img.alt=item.name;
      img.loading='lazy';
      img.onerror=()=>{a.remove()};
      const caption=document.createElement('div');caption.className='about-v2-gallery-caption';
      const title=document.createElement('b');title.textContent=item.name;
      const small=document.createElement('small');small.textContent='View product ↗';
      caption.append(title,small);
      a.append(img,caption);gallery.append(a);
    }
    reveal();
  }
  let observer;
  function reveal(){
    const nodes=[...document.querySelectorAll('#p-about .about-reveal:not(.is-visible)')];
    if(!nodes.length)return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)){
      nodes.forEach(node=>node.classList.add('is-visible'));return;
    }
    if(!observer)observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting){
        entry.target.classList.add('is-visible');observer.unobserve(entry.target);
      }
    },{threshold:0.06,rootMargin:'0px 0px 45px 0px'});
    nodes.forEach(node=>observer.observe(node));
  }
  const gallery=document.getElementById('aboutRealGallery');
  if(gallery){
    // Catalog is asynchronous; wait for the current product grid instead of showing fake imagery.
    const source=document.getElementById('homeGrid');
    if(source)new MutationObserver(()=>{refreshGallery()}).observe(source,{childList:true});
    window.addEventListener('hashchange',()=>{if(location.hash==='#about'){refreshGallery();reveal()}});
  }
  loadBrandLogo();
  refreshGallery();
  reveal();
})();