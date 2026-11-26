import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const html=readFileSync('index.html','utf8');
const css=readFileSync('storefront-experience.css','utf8');
const js=readFileSync('storefront-experience.js','utf8');
const admin=readFileSync('admin/app.js','utf8');
const promos=readFileSync('admin/promotions.js','utf8');
const experience=readFileSync('admin/experience.js','utf8');

let inlineCount=0;
for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
 const attrs=match[1]||'',code=match[2]||'';
 if(/\bsrc\s*=|application\/ld\+json/i.test(attrs)||!code.trim())continue;
 try{new Function(code)}catch(error){throw new Error('Inline storefront script parse failed: '+error.message)}
 inlineCount++;
}
assert(inlineCount>=2,'Expected auth routing and storefront scripts');
new Function(js);
assert(html.includes('sh_promo_quote'),'Storefront needs secure promotion endpoint');
assert(html.includes('kPromoBtn'),'Checkout needs visible promo application');
assert(admin.includes("promos.mount()"),'Admin promotion portal is not wired');
assert(promos.includes("sh_promotions"),'Admin promo table binding missing');
assert(experience.includes("config.hero_slides"),'Slide collection not saved in experience config');
assert(js.includes('prev.onclick=()=>setSlide(')&&js.includes('next.onclick=()=>setSlide('),'Manual carousel controls missing');
assert(js.includes('scheduleAdvance(photoInterval())')&&/slideTimer=setTimeout\([\s\S]*?setSlide\(slideIndex\+1\)/.test(js),'Automatic carousel advance missing');
assert(css.includes("sh-slider-backdrop"),'Carousel slide transition styling missing');
assert(css.includes("sh-checkout-promo"),'Checkout promo responsive styling missing');
console.log('SHOPYHAT static integration checks passed ('+inlineCount+' inline scripts).');
