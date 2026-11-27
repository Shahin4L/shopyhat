/* SHOPYHAT Dimension: opt-in, presentation-only. Never modifies pricing, stock, cart, checkout or products. */
(()=>{'use strict';
const MODES=['classic','premium','immersive','ultra'];
const defaults={enabled:false,mode:'classic',allow_customer_switch:true,ambient:true,intensity:42,category_modes:{},product_modes:{}};
let cfg={...defaults},customerMode='';
const safeMode=(m)=>MODES.includes(m)?m:'classic';
const safeHex=(c)=>/^#[0-9a-f]{6}$/i.test(String(c||''))?c:'#c9aa86';
const key=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const muted=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const lowPower=()=>typeof navigator.deviceMemory==='number'&&navigator.deviceMemory<3;
function normalize(input){
 const x=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
 const category_modes={};for(const [k,v] of Object.entries(x.category_modes||{})){if(k.length<80&&MODES.includes(v))category_modes[key(k)]=v;}
 const product_modes={};for(const [k,v] of Object.entries(x.product_modes||{})){if(/^[0-9]{1,12}$/.test(k)&&MODES.includes(v))product_modes[k]=v;}
 return {enabled:x.enabled===true,mode:safeMode(x.mode),allow_customer_switch:x.allow_customer_switch!==false,ambient:x.ambient!==false,intensity:Math.max(0,Math.min(100,Number(x.intensity)||0)),category_modes,product_modes};
}
function modeFor(p){
 if(!cfg.enabled)return 'classic';
 const productMode=cfg.product_modes[String(p?.id)]||'';
 const categoryMode=cfg.category_modes[key(p?.cat)]||cfg.category_modes[key(p?.catName)]||'';
 const chosen=customerMode||productMode||categoryMode||cfg.mode;
 if(chosen==='ultra')return 'immersive'; // Never fabricate a genuine 3D model from a single photograph.
 if((muted()||lowPower())&&chosen==='immersive')return 'premium';
 return safeMode(chosen);
}
function photoInfo(){
 try{if(typeof cur==='undefined'||!cur?.p)return null;
 const p=cur.p, variant=p.colors?.[cur.ci]||p.colors?.[0];
 return {p,color:safeHex(variant?.h),mode:modeFor(p)};
 }catch{return null;}
}
function cleanState(gal){
 gal.classList.remove('sh-dimension-premium','sh-dimension-immersive','sh-dimension-ambient');
 gal.style.removeProperty('--sh-dimension-color');
 gal.style.removeProperty('--sh-dimension-strength');
 gal.querySelector('.sh-dimension-toolbar')?.remove();
 delete gal.dataset.shDimensionSignature;
}
function updateGallery(){
 const gal=document.querySelector('#prodBox .pd .gal');if(!gal)return;
 const current=photoInfo();
 if(!current||!cfg.enabled){cleanState(gal);return;}
 const {mode,color}=current;
 const sig=[mode,color,cfg.ambient,cfg.intensity,cfg.allow_customer_switch,customerMode].join('|');
 if(gal.dataset.shDimensionSignature===sig && (!cfg.allow_customer_switch||gal.querySelector('.sh-dimension-toolbar')))return;
 cleanState(gal);
 gal.dataset.shDimensionSignature=sig;
 if(mode!=='classic')gal.classList.add('sh-dimension-'+mode);
 if(mode!=='classic'&&cfg.ambient){gal.classList.add('sh-dimension-ambient');gal.style.setProperty('--sh-dimension-color',color);gal.style.setProperty('--sh-dimension-strength',String(cfg.intensity/100));}
 if(cfg.allow_customer_switch){
   const bar=document.createElement('div');bar.className='sh-dimension-toolbar';bar.setAttribute('role','group');bar.setAttribute('aria-label','Product display mode');
   for(const [m,label] of [['classic','Classic'],['premium','Explore']]){
     const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.dimensionMode=m;
     button.setAttribute('aria-pressed',String(mode===m||(mode==='immersive'&&m==='premium')));
     button.addEventListener('click',()=>{customerMode=m;try{localStorage.setItem('sh_dimension_choice_v1',m)}catch{}updateGallery()});
     bar.append(button);
   }
   gal.prepend(bar);
 }
}
function scanCards(){
 for(const card of document.querySelectorAll('.pro-card')){
   const id=card.dataset.id,products=typeof PRODUCTS!=='undefined'?PRODUCTS:[];
   const p=products.find(x=>String(x.id)===id);
   const mode=p?modeFor(p):'classic';
   card.classList.toggle('sh-dimension-card',cfg.enabled&&mode!=='classic');
 }
}
let pending=false;
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;updateGallery();scanCards()});}
async function load(){
 if(new URLSearchParams(location.search).get('studio_preview')==='1')return;
 try{
   const r=await fetch(SH_DB_URL+'/rest/v1/sh_storefront_experience?id=eq.1&select=config',{headers:{apikey:SH_DB_KEY},cache:'no-store'});
   if(!r.ok)return;const rows=await r.json();cfg=normalize(rows?.[0]?.config?.product_dimension);schedule();
 }catch(e){console.info('Product visual settings unavailable; classic view preserved.')}
}
try{const stored=localStorage.getItem('sh_dimension_choice_v1');if(stored==='classic'||stored==='premium')customerMode=stored;}catch{}
if(new URLSearchParams(location.search).get('studio_preview')==='1'){
 window.addEventListener('message',event=>{
   if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='shopyhat:studio-preview')return;
   cfg=normalize(event.data.config?.product_dimension);schedule();
 });
}
const observer=new MutationObserver(records=>{
 if(records.some(r=>r.target.closest?.('#prodBox,#homeGrid,#shopGrid,#saleGrid,#rvGrid')))schedule();
});
window.addEventListener('DOMContentLoaded',()=>{
 const nodes=['prodBox','homeGrid','shopGrid','saleGrid','rvGrid'];
 for(const id of nodes){const n=document.getElementById(id);if(n)observer.observe(n,{childList:true,subtree:true});}
 schedule();load();
 if(new URLSearchParams(location.search).get('studio_preview')!=='1'){
   window.addEventListener('focus',load);document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});
 }
});
})();