export function setupExperienceStudio({db,roleCan,notify}){
 let ready=false,currentConfig={};
 const defaults={cinematic:true,video_url:'',hero_image_url:'',headline:'Your choice, our gift.',subtitle:'Sarees, three-piece sets, hijab and accessories, chosen with care.',show_ribbon:true,show_floating_cards:true,show_new_arrivals:true,show_categories:true,show_campaigns:true,announcement:'Free delivery on orders above ৳1500',campaign_text:'Discover our new arrivals'};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const $=id=>document.getElementById(id);
 const fields=[['announcement','Announcement bar text','text'],['headline','Hero headline','text'],['subtitle','Hero subtitle','textarea'],['hero_image_url','Cinematic background image HTTPS URL','url'],['video_url','Background MP4 / WebM HTTPS URL (optional)','url'],['campaign_text','Campaign heading','text'],['hero_eyebrow','Hero Eyebrow / Label','text'],['primary_cta','Primary CTA Button Text','text'],['secondary_cta','Secondary CTA Button Text','text'],['search_placeholder','Search Bar Placeholder','text'],['categories_title','Featured Categories Title','text'],['arrivals_title','New Arrivals Title','text'],['offers_title','Special Offers Title','text'],['story_title','Brand Story Title','text']];
 const switches=[['cinematic','Cinematic Hero'],['show_ribbon','Orange Ribbon Design'],['show_floating_cards','Floating Product Images'],['show_new_arrivals','New Arrivals Section'],['show_categories','Featured Categories'],['show_campaigns','Campaign Section']];

 const designSelects=[
  ['ui_font','Body / UI Font',['Instrument Sans','Inter','Manrope','Plus Jakarta Sans'],'Instrument Sans'],
  ['heading_font','Heading Font',['Bodoni Moda','Playfair Display','DM Serif Display','Inter'],'Bodoni Moda'],
  ['hero_alignment','Hero Content Alignment',['left','center','right'],'left'],
  ['hero_vertical','Hero Content Vertical Position',['top','center','bottom'],'center'],
  ['hero_image_position','Hero Image Focus',['center top','center center','center bottom','left center','right center'],'center center'],
  ['product_card_side','Floating Product Card',['right','left','hidden'],'right']
 ];
 const designNumbers=[
  ['body_font_size','Base Font Size (px)',13,19,15,1],
  ['heading_scale','Hero Heading Scale',.7,1.3,1,.05],
  ['content_width','Container Width (px)',1000,1540,1240,20],
  ['section_spacing','Section Spacing',.65,1.6,1,.05],
  ['hero_height','Hero Height (px)',500,840,660,20],
  ['category_columns','Category Columns (desktop)',3,5,5,1]
 ];
 const sectionDefs=[['trust','Trust & Delivery'],['categories','Featured Categories'],['arrivals','New Arrivals'],['offers','Special Offers'],['story','Brand Story'],['recent','Recently Viewed']];
 let sectionOrder=sectionDefs.map(item=>item[0]);
 const optionsHTML=(options)=>options.map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');
 function designHTML(){
  return '<details class="sh-design-editor" open><summary>Visual Design Controls — Fonts, Colors & Layout</summary>'+
  '<p class="muted">Fine-tune your customer-facing website without editing code. Allowed values are deliberately limited to safe, responsive layouts.</p>'+
  '<div class="sh-design-grid">'+designSelects.map(([key,title,opts])=>'<label>'+esc(title)+'<select name="'+key+'">'+optionsHTML(opts)+'</select></label>').join('')+
  designNumbers.map(([key,title,min,max,initial,step])=>'<label>'+esc(title)+'<input type="number" name="'+key+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+initial+'"></label>').join('')+
  '<label>Brand Accent Color<input name="accent_color" type="color" value="#f47721"></label></div>'+
  '<h3>Homepage Section Order</h3><p class="muted">Use ↑ / ↓ to reposition selected homepage sections. Orders and product URLs are unchanged.</p>'+
  '<div id="shSectionOrder" class="sh-order-list"></div>'+
  '<div class="editor-actions"><button type="button" class="btn" id="shResetDesign">Restore Recommended Design</button></div></details>';
 }
 function renderOrder(){
  const host=$('shSectionOrder');if(!host)return;
  host.replaceChildren();
  sectionOrder.forEach((key,i)=>{
   const row=document.createElement('div');row.className='sh-order-row';
   const label=document.createElement('span');label.textContent=(i+1)+'. '+(sectionDefs.find(a=>a[0]===key)?.[1]||key);
   const up=document.createElement('button');up.type='button';up.className='btn small';up.textContent='↑';up.setAttribute('aria-label','Move '+key+' up');up.disabled=i===0;
   const down=document.createElement('button');down.type='button';down.className='btn small';down.textContent='↓';down.setAttribute('aria-label','Move '+key+' down');down.disabled=i===sectionOrder.length-1;
   up.onclick=()=>{[sectionOrder[i-1],sectionOrder[i]]=[sectionOrder[i],sectionOrder[i-1]];renderOrder()};
   down.onclick=()=>{[sectionOrder[i+1],sectionOrder[i]]=[sectionOrder[i],sectionOrder[i+1]];renderOrder()};
   const controls=document.createElement('div');controls.className='tools';controls.append(up,down);row.append(label,controls);host.append(row);
  });
 }
 function mount(){
  if(ready)return;
  ready=true;
  const nav=$('nav'),dashboard=$('dashboard');if(!nav||!dashboard)return;
  const b=document.createElement('button');b.type='button';b.className='btn';b.id='experienceTab';b.dataset.page='experience';b.textContent='Storefront Studio';
  const brand=$('brandTab');nav.insertBefore(b,brand||nav.firstChild);
  const panel=document.createElement('div');panel.className='panel hidden';panel.id='page-experience';
  panel.innerHTML='<div class="topline"><div><h2>Storefront Experience Studio</h2><p class="muted">Control homepage visuals, campaigns and sections without changing order workflows.</p></div><a class="btn" target="_blank" rel="noopener" href="/">↗ Preview Storefront</a></div><div class="media-section" style="margin:18px 0;padding:18px"><h3>Cinematic Hero Photo</h3><p class="muted">Upload JPG, PNG or WebP. Larger images are automatically compressed to fit the 2 MB storage limit. The website will use the new photo immediately after publishing the settings.</p><input type="file" id="shHeroUpload" accept="image/png,image/jpeg,image/webp"><div class="editor-actions"><button type="button" class="btn primary" id="shHeroUploadButton">Upload Hero Image</button></div><img id="shHeroPreview" alt="Current hero preview" style="width:100%;max-width:550px;aspect-ratio:16/9;object-fit:cover;display:none;border-radius:12px;margin-top:12px"><p id="shHeroUploadMsg" class="msg" role="status"></p></div><form id="shExperienceForm" class="sh-experience-form"><div class="sh-experience-fields">'+fields.map(([key,title,type])=>'<label>'+esc(title)+(type==='textarea'?'<textarea name="'+key+'" rows="3"></textarea>':'<input type="'+type+'" name="'+key+'" placeholder="'+(type==='url'?'https://...':'')+'">')+'</label>').join('')+'</div><h3>Homepage visibility</h3><div class="sh-experience-switches">'+switches.map(([key,title])=>'<label><input type="checkbox" name="'+key+'"> '+esc(title)+'</label>').join('')+'</div>'+designHTML()+'<p class="muted">Tip: Hero video is optional. For performance, use an optimized, muted looping video and an image fallback. Product images in Mega Menu and Live Search come from your existing catalog.</p><div class="editor-actions"><button class="btn primary" type="submit">Save & Publish Experience</button><button class="btn" type="button" id="shExperienceReload">Reload</button></div><p id="shExperienceMsg" class="msg" role="status"></p></form>';
  nav.after(panel);
  const style=document.createElement('style');style.textContent=`
 #dashboard{position:relative;padding-left:0;display:flow-root}#dashboard>.nav{position:relative;float:left;left:auto;top:auto;bottom:auto;width:200px;height:auto;max-height:none;z-index:1;overflow:visible;margin:15px 0 20px;padding:15px 10px;background:#191310;border:1px solid #3c302a;border-radius:13px;display:flex;flex-direction:column;flex-wrap:nowrap;gap:4px}
 #dashboard>.panel{margin-left:220px}
 #dashboard>.nav .btn{width:100%;text-align:left;background:transparent;color:#e3d8ce;border:0;border-radius:8px;font-size:12.5px;padding:11px}
 #dashboard>.nav .btn.active,#dashboard>.nav .btn:hover{background:#ed7924;color:#1d0d05}
 .sh-side-heading{color:#c48e6b;font-size:10px;text-transform:uppercase;letter-spacing:.12em;padding:14px 9px 5px;font-weight:800}
 .sh-side-group{display:flex;flex-direction:column;gap:3px}.sh-side-group[hidden]{display:none}
 .sh-side-toggle{display:flex;justify-content:space-between;align-items:center;cursor:pointer;border:0;background:transparent;color:#f7af77;padding:12px 8px;text-align:left;font-weight:700;border-bottom:1px solid #3b2a20}
 .sh-design-editor{margin:22px 0;padding:20px;border:1px solid #e8d4c1;background:#fffaf5;border-radius:14px}
 .sh-design-editor summary{font-size:17px;font-weight:800;cursor:pointer;color:#b65c1b}
 .sh-design-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px 18px;margin:17px 0}
 .sh-order-list{display:grid;gap:5px;margin:12px 0}
 .sh-order-row{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#fff;border:1px solid #e9e1d8;border-radius:8px}
 .sh-order-row .tools{gap:5px}
 .sh-experience-form{max-width:850px}.sh-experience-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 18px}
 .sh-experience-fields label{font-size:13px}.sh-experience-fields textarea{min-height:85px}.sh-experience-fields label:has(textarea){grid-column:1/-1}
 .sh-experience-switches{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:14px 0 20px}
 .sh-experience-switches label{display:flex;align-items:center;gap:9px;padding:12px;background:#faf5ef;border:1px solid #eadccc;border-radius:10px}
 .sh-experience-switches input{width:auto}
 @media(max-width:800px){#dashboard{padding-left:0}#dashboard>.nav{float:none;position:relative;left:auto;top:auto;width:100%;height:auto;max-height:none;display:flex;flex-direction:row;flex-wrap:wrap;border-radius:12px}#dashboard>.panel{margin-left:0}#dashboard>.nav .btn{width:auto}.sh-side-group{flex-direction:row;flex-wrap:wrap}.sh-side-toggle{width:100%}.sh-experience-fields,.sh-experience-switches,.sh-design-grid{grid-template-columns:1fr}}
 `;document.head.append(style);
 const groupMap=[['Commerce',['products','orders','payments']],['Storefront',['experience','catalog','brand','reviews']],['Operations',['cases','insights','activity','users']]];
 const original=[...nav.querySelectorAll('[data-page]')];
 for(const [name,pages] of groupMap){
  const group=document.createElement('div');group.className='sh-side-group';group.id='shSide'+name;
  const title=document.createElement('button');title.type='button';title.className='sh-side-toggle';title.textContent=name+' ▾';title.setAttribute('aria-expanded','true');
  const content=document.createElement('div');content.className='sh-side-group';
  pages.forEach(page=>{const item=original.find(x=>x.dataset.page===page);if(item)content.append(item)});
  title.addEventListener('click',()=>{content.hidden=!content.hidden;title.setAttribute('aria-expanded',String(!content.hidden))});
  group.append(title,content);nav.append(group);
 }
 $('experienceTab').onclick=()=>window.SHOPYHAT_SHOW_PAGE?.('experience');
 $('shExperienceReload').onclick=reload;
 $('shExperienceForm').onsubmit=save;
 $('shResetDesign').onclick=()=>{const form=$('shExperienceForm');for(const [key,,options,fallback] of designSelects)form.elements[key].value=fallback;for(const [key,,,,initial] of designNumbers)form.elements[key].value=initial;form.elements.accent_color.value='#f47721';sectionOrder=sectionDefs.map(x=>x[0]);renderOrder();notify('shExperienceMsg','Recommended design selected. Save & Publish to apply.');};
 renderOrder();
 $('shHeroUploadButton').onclick=uploadHero;
 $('shHeroUpload').onchange=()=>{const file=$('shHeroUpload').files?.[0];if(!file)return;const u=URL.createObjectURL(file);const img=$('shHeroPreview');img.onload=()=>URL.revokeObjectURL(u);img.src=u;img.style.display='block'};
 }
 async function optimizeHero(file){
  const cap=2*1024*1024;
  if(file.size<=cap)return file;
  const bitmap=await createImageBitmap(file);
  try{
   let scale=Math.min(1,1920/bitmap.width,1280/bitmap.height);
   for(let attempt=0;attempt<5;attempt++){
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));
    canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    canvas.getContext('2d',{alpha:false}).drawImage(bitmap,0,0,canvas.width,canvas.height);
    const quality=Math.max(.6,.86-attempt*.06);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));
    if(blob&&blob.size<=cap)return new File([blob],'shopyhat-hero.webp',{type:'image/webp'});
    scale*=.8;
   }
   throw Error('Image is too complex to optimize under 2 MB. Try a smaller image.');
  }finally{bitmap.close?.()}
 }
 async function uploadHero(){
  if(!roleCan('owner','manager'))return;
  const selected=$('shHeroUpload')?.files?.[0];
  if(!selected)return notify('shHeroUploadMsg','Choose an image file first.',true);
  if(!['image/png','image/jpeg','image/webp'].includes(selected.type))return notify('shHeroUploadMsg','Use PNG, JPG or WebP.',true);
  if(selected.size>12*1024*1024)return notify('shHeroUploadMsg','Maximum original image size is 12 MB.',true);
  const btn=$('shHeroUploadButton');btn.disabled=true;
  try{
   notify('shHeroUploadMsg','Optimizing photo for fast loading…');
   const file=await optimizeHero(selected);
   const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
   const name='hero/cinematic-'+crypto.randomUUID()+'.'+ext;
   const response=await db.storage.from('shopyhat-branding').upload(name,file,{contentType:file.type,cacheControl:'3600',upsert:false});
   if(response.error)throw response.error;
   const url=db.storage.from('shopyhat-branding').getPublicUrl(name).data.publicUrl;
   $('shExperienceForm').elements.hero_image_url.value=url;
   notify('shHeroUploadMsg','Photo uploaded ('+Math.round(file.size/1024)+' KB). Click Save & Publish Experience to show it on the website.');
  }catch(e){notify('shHeroUploadMsg',e.message,true)}finally{btn.disabled=false}
 }
 async function reload(){
  if(!roleCan('owner','manager'))return;
  try{
   const {data,error}=await db.from('sh_storefront_experience').select('config').eq('id',1).maybeSingle();
   if(error)throw error;currentConfig={...(data?.config||{})};const v={...defaults,...currentConfig},form=$('shExperienceForm');
   for(const [key] of fields)form.elements[key].value=v[key]||'';
   for(const [key] of switches)form.elements[key].checked=v[key]!==false;
   for(const [key,,opts,fallback] of designSelects)form.elements[key].value=opts.includes(v[key])?v[key]:fallback;
   for(const [key,,min,max,initial] of designNumbers){const n=Number(v[key]);form.elements[key].value=Number.isFinite(n)&&n>=min&&n<=max?n:initial;}
   form.elements.accent_color.value=/^#[0-9a-f]{6}$/i.test(v.accent_color||'')?v.accent_color:'#f47721';
   sectionOrder=Array.isArray(v.section_order)&&v.section_order.length===sectionDefs.length&&sectionDefs.every(x=>v.section_order.includes(x[0]))?[...v.section_order]:sectionDefs.map(x=>x[0]);renderOrder();
   const preview=$('shHeroPreview');if(v.hero_image_url){preview.src=v.hero_image_url;preview.style.display='block'}
   notify('shExperienceMsg','Experience settings loaded.');
  }catch(e){notify('shExperienceMsg',e.message,true)}
 }
 async function save(e){
  e.preventDefault();if(!roleCan('owner','manager'))return;
  const f=e.currentTarget,config={...currentConfig};
  for(const [key] of fields){config[key]=f.elements[key].value.trim();if(key.endsWith('_url')&&config[key]&&!/^https:\/\//i.test(config[key]))return notify('shExperienceMsg',key+' must be an HTTPS URL.',true)}
  for(const [key] of switches)config[key]=f.elements[key].checked;
  for(const [key,,options] of designSelects)config[key]=options.includes(f.elements[key].value)?f.elements[key].value:options[0];
  for(const [key,,min,max,initial] of designNumbers){const n=Number(f.elements[key].value);config[key]=Number.isFinite(n)?Math.max(min,Math.min(max,n)):initial;}
  config.accent_color=/^#[0-9a-f]{6}$/i.test(f.elements.accent_color.value)?f.elements.accent_color.value:'#f47721';
  config.section_order=[...sectionOrder];
  const button=f.querySelector('[type=submit]');button.disabled=true;
  try{const {error}=await db.from('sh_storefront_experience').upsert({id:1,config,updated_at:new Date().toISOString()},{onConflict:'id'});
   if(error)throw error;currentConfig={...config};notify('shExperienceMsg','Published successfully. Refresh storefront to see your changes.');
  }catch(e){notify('shExperienceMsg',e.message,true)}finally{button.disabled=false}
 }
 return {mount,reload};
}
