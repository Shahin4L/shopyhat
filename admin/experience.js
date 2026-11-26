import {SUPABASE_PUBLISHABLE_KEY} from './config.js';
export function setupExperienceStudio({db,roleCan,notify}){
 let ready=false,currentConfig={},heroSlides=[],activeUploads=0,settingsLoaded=false,publishing=false;
 const publishButton=()=>$('shPublishExperience');
 function syncPublish(){const button=publishButton();if(button)button.disabled=!settingsLoaded||activeUploads>0||publishing}
 async function runUpload(button,statusId,work){
  if(button.disabled)return;
  if(publishing||activeUploads||!settingsLoaded)return notify(statusId,'Wait for the current action to finish, then try again.',true);
  if(!roleCan('owner','manager'))return notify(statusId,'Sign in as a store owner or manager to upload.',true);
  const label=button.textContent;button.disabled=true;button.textContent='Uploading…';button.setAttribute('aria-busy','true');activeUploads++;syncPublish();
  notify(statusId,'Uploading… Please keep this page open.');
  try{await work()}catch(error){notify(statusId,'Upload failed: '+(error.message||'Check your connection and try again.'),true)}
  finally{button.disabled=false;button.textContent=label;button.removeAttribute('aria-busy');activeUploads--;syncPublish()}
 }
 async function uploadVideoFile(bucket,path,file,type,statusId){
  const {data,error}=await db.auth.getSession();
  if(error||!data?.session?.access_token)throw Error('Your session expired. Sign in again and retry.');
  const {publicUrl}=bucket.getPublicUrl(path).data;
  const uploadUrl=publicUrl.replace('/object/public/','/object/');
  await new Promise((resolve,reject)=>{
   const xhr=new XMLHttpRequest();
   xhr.open('POST',uploadUrl);
   xhr.timeout=180000;
   xhr.setRequestHeader('Authorization','Bearer '+data.session.access_token);
   xhr.setRequestHeader('apikey',SUPABASE_PUBLISHABLE_KEY);
   xhr.setRequestHeader('Content-Type',type);
   xhr.setRequestHeader('Cache-Control','max-age=86400');
   xhr.setRequestHeader('x-upsert','false');
   let previous=-1;
   xhr.upload.onprogress=event=>{
    if(!event.lengthComputable)return;
    const percent=Math.floor(100*event.loaded/event.total);
    if(percent!==100&&percent<previous+5||percent===previous)return;
    previous=percent;
    notify(statusId,percent===100?'File sent. Waiting for storage confirmation…':'Uploading video… '+percent+'%');
   };
   xhr.onload=()=>{
    if(xhr.status>=200&&xhr.status<300){resolve();return}
    let message='';
    try{const body=JSON.parse(xhr.responseText);message=body.message||body.error||''}catch{}
    reject(Error(message||'Storage rejected the upload (HTTP '+xhr.status+').'));
   };
   xhr.onerror=()=>reject(Error('Connection lost. Check your internet and try again.'));
   xhr.ontimeout=()=>reject(Error('The upload timed out. Try again on a stable connection or choose a smaller video.'));
   xhr.send(file);
  });
  return publicUrl;
 }
 function videoType(file){
  if(['video/mp4','video/webm'].includes(file.type))return file.type;
  if(!file.type||file.type==='application/octet-stream')return /\.mp4$/i.test(file.name)?'video/mp4':/\.webm$/i.test(file.name)?'video/webm':'';
  return '';
 }
 function markDraft(message='Changes ready to preview. Click Save & Publish Experience to update the live site.',view){
  notify('shExperienceMsg',message);refreshPreview(view);
 }
 function photoSlides(photo){
  const slides=heroSlides.map(slide=>({...slide}));
  const oldPhoto=currentConfig.hero_image_url||'';
  if(!photo||photo===oldPhoto||!slides.length||slides.some(slide=>slide.image_url===photo))return slides;
  const linked=slides.findIndex(slide=>slide.image_url===oldPhoto);
  if(linked>=0)slides[linked].image_url=photo;
  else slides.unshift({image_url:photo,headline:'',subtitle:'',cta_url:''});
  return slides;
 }
 const defaults={cinematic:true,video_url:'',hero_image_url:'',headline:'Your choice, our gift.',subtitle:'Sarees, three-piece sets, hijab and accessories, chosen with care.',show_ribbon:true,show_floating_cards:true,show_new_arrivals:true,show_categories:true,show_campaigns:true,announcement:'Free delivery on orders above ৳1500',campaign_text:'Discover our new arrivals'};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const $=id=>document.getElementById(id);
 const fields=[['announcement','Announcement bar text','text'],['headline','Hero headline','text'],['subtitle','Hero subtitle','textarea'],['hero_image_url','Cinematic background image HTTPS URL','url'],['video_url','Background MP4 / WebM HTTPS URL (optional)','url'],['campaign_text','Campaign heading','text'],['hero_eyebrow','Hero Eyebrow / Label','text'],['primary_cta','Primary CTA Button Text','text'],['secondary_cta','Secondary CTA Button Text','text'],['search_placeholder','Search Bar Placeholder','text'],['categories_title','Featured Categories Title','text'],['arrivals_title','New Arrivals Title','text'],['offers_title','Special Offers Title','text'],['story_title','Brand Story Title','text']];
 const switches=[['cinematic','Cinematic Hero'],['show_ribbon','Orange Ribbon Design'],['show_floating_cards','Floating Product Images'],['show_new_arrivals','New Arrivals Section'],['show_categories','Featured Categories'],['show_campaigns','Campaign Section']];

 const mediaModes=['auto','video','slides','mixed'];

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
   up.onclick=()=>{[sectionOrder[i-1],sectionOrder[i]]=[sectionOrder[i],sectionOrder[i-1]];renderOrder();markDraft()};
   down.onclick=()=>{[sectionOrder[i+1],sectionOrder[i]]=[sectionOrder[i],sectionOrder[i+1]];renderOrder();markDraft()};
   const controls=document.createElement('div');controls.className='tools';controls.append(up,down);row.append(label,controls);host.append(row);
  });
 }

 function carouselHTML(){
  return '<details class="sh-design-editor" open><summary>Hero Slideshow — Multiple Pictures</summary>'+
   '<p class="muted">Up to eight hero images. Recommended: 1920 × 1080 px (16:9), JPG / PNG / WebP. Keep important details near the center for mobile. Use ↑/↓ to change image order. Select “Photos + video” to include the hero video. The next slide starts after the video ends.</p>'+
   '<div class="fieldrow"><label style="display:flex;align-items:center;gap:8px"><input type="checkbox" name="hero_autoplay" style="width:auto" checked> Autoplay slideshow</label>'+
   '<label>Time per photo (seconds)<input type="number" name="hero_interval" min="3" max="60" step="1" value="6"></label></div>'+
   '<div id="shSlideRows" class="sh-slide-rows"></div>'+
   '<div class="tools" style="margin-top:15px"><button type="button" id="shSlideAdd" class="btn primary">+ Add Hero Slide</button></div></details>';
 }
 function renderSlides(){
  const host=$('shSlideRows');if(!host)return;
  host.replaceChildren();
  heroSlides.forEach((slide,i)=>{
   const section=document.createElement('section');section.className='sh-slide-editor';section.dataset.index=String(i);
   const preview=/^https:\/\//i.test(slide.image_url||'')?'<img src="'+esc(slide.image_url)+'" alt="Slide '+(i+1)+' preview" loading="lazy" style="width:100%;max-height:170px;object-fit:cover;border-radius:9px;margin:8px 0">':'';
   section.innerHTML='<div class="topline"><strong>Slide '+(i+1)+'</strong><div class="tools">'+
    '<button class="btn small" type="button" data-slide-action="up" '+(i===0?'disabled':'')+'>↑</button>'+
    '<button class="btn small" type="button" data-slide-action="down" '+(i===heroSlides.length-1?'disabled':'')+'>↓</button>'+
    '<button class="btn small danger" type="button" data-slide-action="remove">Remove</button></div></div>'+
    preview+'<label>Image URL (HTTPS)<input data-slide-field="image_url" type="url" value="'+esc(slide.image_url||'')+'" placeholder="https://..."></label>'+
    '<label>Upload Image (JPG / PNG / WebP)<input type="file" accept="image/png,image/jpeg,image/webp" data-slide-file></label>'+
    '<button class="btn small" type="button" data-slide-action="upload">Upload this slide image</button>'+
    '<div class="fieldrow"><label>Optional headline<input data-slide-field="headline" maxlength="120" value="'+esc(slide.headline||'')+'"></label>'+
    '<label>Optional subtitle<input data-slide-field="subtitle" maxlength="210" value="'+esc(slide.subtitle||'')+'"></label></div>'+
    '<label>Optional primary CTA link (#shop or https://...)<input data-slide-field="cta_url" maxlength="300" value="'+esc(slide.cta_url||'')+'"></label>'+
    '<p class="msg" role="status" id="shSlideMessage'+i+'" data-slide-message></p>';
   host.append(section);
  });
  $('shSlideAdd').disabled=heroSlides.length>=8;
 }
 async function uploadSlide(section){
  const slide=heroSlides[Number(section.dataset.index)],selected=section.querySelector('[data-slide-file]')?.files?.[0];
  const status=section.querySelector('[data-slide-message]');
  if(!selected)return notify(status.id,'Choose an image first.',true);
  if(!['image/png','image/jpeg','image/webp'].includes(selected.type)||selected.size>12*1024*1024)return notify(status.id,'Use PNG, JPG or WebP under 12 MB.',true);
  const btn=section.querySelector('[data-slide-action="upload"]');let uploaded=false;
  await runUpload(btn,status.id,async()=>{
   const file=await optimizeHero(selected);
   const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
   const name='hero/slide-'+crypto.randomUUID()+'.'+ext;
   const {error}=await db.storage.from('shopyhat-branding').upload(name,file,{contentType:file.type,cacheControl:'3600',upsert:false});
   if(error)throw error;
   const url=db.storage.from('shopyhat-branding').getPublicUrl(name).data.publicUrl;
   slide.image_url=url;uploaded=true;
  });
  if(uploaded){renderSlides();const message=$('shSlideMessage'+heroSlides.indexOf(slide));if(message)message.textContent='Slide image uploaded. Publish to apply.';markDraft('Slide image uploaded. Click Save & Publish Experience to apply.','slide:'+heroSlides.indexOf(slide))}
 }
 function setupSlides(){
  const host=$('shSlideRows'),add=$('shSlideAdd');
  if(!host||!add)return;
  add.onclick=()=>{if(heroSlides.length>=8||activeUploads||publishing)return;heroSlides.push({image_url:'',headline:'',subtitle:'',cta_url:''});renderSlides();markDraft('Slide added. Upload its image or enter an HTTPS URL before publishing.');host.lastElementChild?.querySelector('[data-slide-field="image_url"]')?.focus()};
  host.addEventListener('change',e=>{
   if(!e.target.matches('[data-slide-file]'))return;
   const file=e.target.files?.[0],message=e.target.closest('[data-index]')?.querySelector('[data-slide-message]');
   if(file&&message)notify(message.id,file.name+' selected. Click Upload this slide image.');
  });
  host.addEventListener('input',e=>{
   const field=e.target.dataset.slideField,section=e.target.closest('[data-index]');
   if(!field||!section)return;const idx=Number(section.dataset.index);
   if(heroSlides[idx])heroSlides[idx][field]=e.target.value;
   if(field==='image_url'){
    clearTimeout(window.shSlidePreviewTimer);
    window.shSlidePreviewTimer=setTimeout(()=>markDraft(undefined,'slide:'+idx),240);
   }
  });
  host.addEventListener('click',async e=>{
   const button=e.target.closest('[data-slide-action]');if(!button)return;
   const section=button.closest('[data-index]'),i=Number(section?.dataset.index);
   if(!Number.isInteger(i)||!heroSlides[i])return;
   const action=button.dataset.slideAction;
   if(action==='upload'){await uploadSlide(section);return}
   if(activeUploads||publishing)return;
   if(action==='remove')heroSlides.splice(i,1);
   if(action==='up'&&i>0)[heroSlides[i-1],heroSlides[i]]=[heroSlides[i],heroSlides[i-1]];
   if(action==='down'&&i<heroSlides.length-1)[heroSlides[i+1],heroSlides[i]]=[heroSlides[i],heroSlides[i+1]];
   renderSlides();markDraft(action==='remove'?'Slide removed. Publish to apply.':'Slide order updated. Publish to apply.','home');
  });
 }

 function previewHTML(){
  return '<section class="sh-design-editor sh-live-editor"><div class="topline"><div><h3>Live Storefront Preview</h3><p class="muted">View unsaved changes before publishing. Editing here does not affect the real website until Save & Publish.</p></div><div class="tools"><button type="button" class="btn small" id="shPreviewDesktop">Desktop</button><button type="button" class="btn small" id="shPreviewMobile">Mobile</button><button type="button" class="btn primary small" id="shPreviewUpdate">Preview Changes</button></div></div><div class="sh-preview-shell"><iframe title="SHOPYHAT storefront live design preview" id="shExperiencePreviewFrame" loading="lazy" referrerpolicy="same-origin" src="/?studio_preview=1#home"></iframe></div><p class="muted">For best results, preview Hero, menu and New Arrivals on desktop and mobile. The preview cannot place real orders.</p></section>';
 }
 let aboutVideos=[];
 const aboutVideoLimit=6;
 const isAboutURL=value=>{try{return new URL(value).protocol==='https:'}catch{return false}};
 function renderAboutVideos(){
  const list=$('shAboutVideos');
  list.innerHTML=aboutVideos.map((video,i)=>'<div class="sh-about-video-row" data-video-index="'+i+'">'+
   '<div style="margin:12px 0"><video controls playsinline preload="none" style="display:block;width:100%;max-width:480px;aspect-ratio:16/9;object-fit:contain;background:#21150e;border-radius:12px" '+(isAboutURL(String(video.url||'').trim())?'src="'+esc(video.url.trim())+'"':'')+'></video><p class="muted">Current video preview · '+esc(String(video.url||'').split('?')[0].split('/').pop()||'No video selected')+'</p></div>'+ '<div class="sh-experience-fields"><label>Video '+(i+1)+' title (optional)<input type="text" maxlength="80" data-video-field="title" value="'+esc(video.title)+'"></label>'+
   '<label>Video HTTPS URL<input type="url" data-video-field="url" value="'+esc(video.url)+'" placeholder="https://..."></label><label>Video context<textarea maxlength="1200" rows="4" data-video-field="description">'+esc(video.description||'')+'</textarea></label></div>'+
   '<div class="editor-actions"><button class="btn small" type="button" data-video-action="up" '+(i===0?'disabled':'')+' aria-label="Move video '+(i+1)+' up">↑</button>'+
   '<button class="btn small" type="button" data-video-action="down" '+(i===aboutVideos.length-1?'disabled':'')+' aria-label="Move video '+(i+1)+' down">↓</button>'+
   '<button class="btn small" type="button" data-video-action="remove" aria-label="Remove video '+(i+1)+'">Remove</button></div></div>').join('');
  $('shAboutVideoAdd').disabled=aboutVideos.length>=aboutVideoLimit;
 }
 function bindAboutVideos(){
  const list=$('shAboutVideos');
  $('shAboutVideoAdd').onclick=()=>{
   if(activeUploads||publishing||!settingsLoaded||aboutVideos.length>=aboutVideoLimit)return;
   aboutVideos.push({url:'',title:''});
   renderAboutVideos();
   list.lastElementChild.querySelector('[data-video-field="url"]').focus();
   markDraft('Enter the video URL, then publish to save the playlist.','about');
  };
  list.addEventListener('input',e=>{
   const row=e.target.closest('[data-video-index]');
   const field=e.target.dataset.videoField;
   if(row&&(field==='url'||field==='title'||field==='description'))aboutVideos[Number(row.dataset.videoIndex)][field]=e.target.value;
   if(row&&field==='url'){const player=row.querySelector('video');const url=e.target.value.trim();if(player){player.pause();if(isAboutURL(url))player.src=url;else player.removeAttribute('src');player.load()}}
  });
  list.addEventListener('click',e=>{
   const button=e.target.closest('[data-video-action]');
   if(!button||activeUploads||publishing||!settingsLoaded)return;
   const index=Number(button.closest('[data-video-index]').dataset.videoIndex);
   const action=button.dataset.videoAction;
   if(action==='remove')aboutVideos.splice(index,1);
   else{
    const target=index+(action==='up'?-1:1);
    if(!aboutVideos[target])return;
    [aboutVideos[index],aboutVideos[target]]=[aboutVideos[target],aboutVideos[index]];
   }
   renderAboutVideos();
   markDraft('About video playlist updated. Publish to apply.','about');
  });
 }
 function previewConfig(){
  const f=$('shExperienceForm');if(!f)return {};
  const c={...defaults,...currentConfig};
  for(const [key] of fields)c[key]=f.elements[key]?.value?.trim()||'';
  for(const [key] of switches)c[key]=f.elements[key]?.checked!==false;
  c.hero_media_mode=mediaModes.includes(f.elements.hero_media_mode?.value)?f.elements.hero_media_mode.value:'auto';
  c.about_media_type=f.elements.about_media_type?.value||'none';c.about_media_url=f.elements.about_media_url?.value?.trim()||'';
  c.about_videos=aboutVideos.filter(video=>isAboutURL(video.url.trim())).map(video=>({url:video.url.trim(),title:video.title.trim(),description:String(video.description||'').trim().slice(0,1200)}));
  for(const [key] of designSelects)c[key]=f.elements[key]?.value;
  for(const [key,,min,max,fallback] of designNumbers){
   const n=Number(f.elements[key]?.value);c[key]=Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;
  }
  c.accent_color=f.elements.accent_color?.value||'#f47721';
  c.section_order=[...sectionOrder];
  c.hero_slides=photoSlides(c.hero_image_url).filter(slide=>/^https:\/\//i.test(slide.image_url||'')).slice(0,8);
  c.hero_autoplay=false; // Keep the chosen slide in view while editing.
  c.hero_interval=Math.max(3,Math.min(60,Number(f.elements.hero_interval?.value)||6));
  return c;
 }
 function refreshPreview(view){
  const frame=$('shExperiencePreviewFrame');if(frame?.contentWindow){
   frame.contentWindow.postMessage({type:'shopyhat:studio-preview',config:previewConfig(),view:typeof view==='string'?view:undefined},location.origin);
  }
 }

 function mount(){
  if(ready)return;
  ready=true;
  const nav=$('nav'),dashboard=$('dashboard');if(!nav||!dashboard)return;
  const b=document.createElement('button');b.type='button';b.className='btn';b.id='experienceTab';b.dataset.page='experience';b.textContent='Storefront Studio';
  const brand=$('brandTab');nav.insertBefore(b,brand||nav.firstChild);
  const panel=document.createElement('div');panel.className='panel hidden';panel.id='page-experience';
  panel.innerHTML='<div class="topline"><div><h2>Storefront Experience Studio</h2><p class="muted">Control homepage visuals, campaigns and sections without changing order workflows.</p></div><a class="btn" target="_blank" rel="noopener" href="/">↗ Preview Storefront</a></div><div class="media-section" style="margin:18px 0;padding:18px"><h3>Cinematic Hero Photo</h3><p class="muted">Recommended: 1920 × 1080 px (16:9); keep key details near the center for mobile. Upload JPG, PNG or WebP. Larger images are automatically compressed to fit the 2 MB storage limit. The website will use the new photo immediately after publishing the settings.</p><input type="file" id="shHeroUpload" accept="image/png,image/jpeg,image/webp"><div class="editor-actions"><button type="button" class="btn primary" id="shHeroUploadButton">Upload Hero Image</button></div><img id="shHeroPreview" alt="Current hero preview" style="width:100%;max-width:550px;aspect-ratio:16/9;object-fit:cover;display:none;border-radius:12px;margin-top:12px"><p id="shHeroUploadMsg" class="msg" role="status"></p></div><form id="shExperienceForm" class="sh-experience-form"><div class="sh-experience-fields">'+fields.map(([key,title,type])=>'<label>'+esc(title)+(type==='textarea'?'<textarea name="'+key+'" rows="3"></textarea>':'<input type="'+type+'" name="'+key+'" placeholder="'+(type==='url'?'https://...':'')+'">')+'</label>').join('')+'</div><h3>Homepage visibility</h3><div class="sh-experience-switches">'+switches.map(([key,title])=>'<label><input type="checkbox" name="'+key+'"> '+esc(title)+'</label>').join('')+'</div>'+previewHTML()+carouselHTML()+designHTML()+'<p class="muted">Tip: Hero video is optional. For performance, use an optimized, muted looping video and an image fallback. Product images in Mega Menu and Live Search come from your existing catalog.</p><div class="editor-actions"><button class="btn primary" type="submit">Save & Publish Experience</button><button class="btn" type="button" id="shExperienceReload">Reload</button></div><p id="shExperienceMsg" class="msg" role="status"></p></form>';
  const heroVideoSection=document.createElement('section');
  heroVideoSection.className='media-section';heroVideoSection.style.cssText='margin:18px 0;padding:18px';
  heroVideoSection.innerHTML='<h3>Hero Background Video</h3><p class="muted">Choose an MP4 or WebM video up to 25 MB. Use a short, optimized video for faster loading. The video plays muted and loops; your hero photo is the fallback. Upload the file, then click Save & Publish Experience. Uploaded media can be viewed through its public URL.</p><label for="shHeroVideoFile">Choose video</label><input type="file" id="shHeroVideoFile" accept="video/mp4,video/webm"><div class="editor-actions"><button type="button" class="btn primary" id="shHeroVideoUpload">Upload Hero Video</button><button type="button" class="btn" id="shHeroVideoRemove">Remove video from hero</button></div><video id="shHeroVideoPreview" controls muted playsinline preload="metadata" style="display:none;width:100%;max-width:550px;aspect-ratio:16/9;object-fit:contain;background:#1b1714;border-radius:12px;margin-top:12px"></video><p id="shHeroVideoMsg" class="msg" role="status" aria-live="polite"></p>';
  panel.querySelector('#shExperienceForm').before(heroVideoSection);
  const modeLabel=document.createElement('label');
  modeLabel.innerHTML='Hero background mode<select name="hero_media_mode"><option value="auto">Automatic (existing behavior)</option><option value="video">Video (photo fallback)</option><option value="slides">Photo slideshow</option><option value="mixed">Photos + video rotation</option></select><small>Choose photos + video to rotate through your images and uploaded video. Preview, then publish.</small>';
  panel.querySelector('.sh-experience-fields').prepend(modeLabel);
  const aboutSection=document.createElement('section');aboutSection.className='media-section';aboutSection.style.cssText='margin:18px 0;padding:18px';
  aboutSection.innerHTML='<h3>About Us — Photo &amp; Video Playlist</h3><p class="muted">Upload up to six MP4 or WebM videos (25 MB each). Videos play in order and repeat. An optional story photo serves as the cover; recommended size is 1920 × 1080 px.</p><label for="shAboutFile">Choose photo or video</label><input type="file" id="shAboutFile" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"><div class="editor-actions"><button type="button" class="btn primary" id="shAboutUpload">Upload About Media</button><button type="button" class="btn" id="shAboutRemove">Remove About Photo</button></div><p id="shAboutMsg" class="msg" role="status" aria-live="polite"></p>';
  panel.querySelector('#shExperienceForm').before(aboutSection);
  const aboutFields=document.createElement('section');aboutFields.className='sh-design-editor';aboutFields.innerHTML='<h3>About video playlist</h3><div id="shAboutVideos"></div><div class="editor-actions"><button class="btn" type="button" id="shAboutVideoAdd">Add Video URL</button></div><div class="sh-experience-fields"><label>About photo<select name="about_media_type"><option value="none">None</option><option value="image">Photo</option></select></label><label>About photo HTTPS URL<input type="url" name="about_media_url" placeholder="https://..."></label></div>';
  panel.querySelector('#shExperienceForm').prepend(aboutFields);
  const form=panel.querySelector('#shExperienceForm');
  form.addEventListener('invalid',()=>notify('shExperienceMsg','Check the highlighted field before publishing.',true),true);
  const actions=panel.querySelector('#shExperienceMsg').previousElementSibling;
  const publish=actions.querySelector('[type=submit]');
  publish.id='shPublishExperience';publish.setAttribute('form',form.id);publish.disabled=true;
  const publishBar=document.createElement('div');publishBar.className='sh-publish-bar';
  publishBar.append(actions,panel.querySelector('#shExperienceMsg'));
  panel.querySelector('.topline').after(publishBar);
  nav.after(panel);
  const style=document.createElement('style');style.textContent=`
 #dashboard{position:relative;padding-left:0;display:flow-root}#dashboard>.nav{position:relative;float:left;left:auto;top:auto;bottom:auto;width:192px;height:auto;max-height:none;z-index:1;overflow:visible;margin:14px 0 18px;padding:12px 8px;background:linear-gradient(180deg,#21150f,#17110e);border:1px solid #433025;border-radius:13px;display:flex;flex-direction:column;flex-wrap:nowrap;gap:3px;box-shadow:0 12px 32px #00000012}
 #dashboard>.panel{margin-left:209px}
 #dashboard>.nav .btn{width:100%;text-align:left;background:transparent;color:#e3d8ce;border:0;border-radius:8px;font-size:12px;padding:10px 11px}
 #dashboard>.nav .btn.active,#dashboard>.nav .btn:hover{background:#ed7924;color:#1d0d05}
 .sh-side-heading{color:#c48e6b;font-size:10px;text-transform:uppercase;letter-spacing:.12em;padding:14px 9px 5px;font-weight:800}
 .sh-side-group{display:flex;flex-direction:column;gap:3px}.sh-side-group[hidden]{display:none}
 .sh-side-toggle{display:flex;justify-content:space-between;align-items:center;cursor:pointer;border:0;background:transparent;color:#f7af77;padding:12px 8px;text-align:left;font-weight:700;border-bottom:1px solid #3b2a20;font-size:12px;width:100%}.sh-side-toggle:focus-visible,#dashboard>.nav button:focus-visible{outline:2px solid #ffad69;outline-offset:2px}.sh-side-group{padding:4px 0;border-bottom:1px solid #352920}.sh-side-heading{padding:10px 9px 5px}
 .sh-slide-rows{display:grid;gap:14px}.sh-slide-editor{background:#fff;border:1px solid #e9dace;border-radius:11px;padding:15px}.sh-slide-editor .fieldrow{gap:12px}
 .sh-live-editor{max-width:100%;margin:18px 0}.sh-preview-shell{display:flex;justify-content:center;overflow:hidden;padding:12px;background:#eee7dd;border-radius:15px;margin-top:14px}.sh-preview-shell iframe{width:100%;height:500px;border:0;border-radius:9px;background:#fff;transition:width .18s ease;box-shadow:0 7px 25px #0002}.sh-preview-shell.mobile iframe{width:min(390px,100%);height:660px}
 .sh-design-editor{margin:22px 0;padding:20px;border:1px solid #e8d4c1;background:#fffaf5;border-radius:14px}
 .sh-design-editor summary{font-size:17px;font-weight:800;cursor:pointer;color:#b65c1b}
 .sh-design-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px 18px;margin:17px 0}
 .sh-order-list{display:grid;gap:5px;margin:12px 0}
 .sh-order-row{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#fff;border:1px solid #e9e1d8;border-radius:8px}
 .sh-order-row .tools{gap:5px}
 .sh-about-video-row{padding:10px 12px;margin:8px 0;border:1px solid #eadccc;border-radius:10px}.sh-about-video-row .editor-actions{margin-top:8px}
 .sh-publish-bar{position:sticky;top:0;z-index:5;margin-top:12px;padding:10px 14px;background:#fffaf5;border:1px solid #eadccc;border-radius:12px}.sh-publish-bar .editor-actions{margin:0}.sh-publish-bar .msg{margin:6px 0 0}.media-section .msg{overflow-wrap:anywhere}.media-section button[aria-busy=true],.sh-publish-bar button[aria-busy=true]{cursor:progress}
 .sh-experience-form{max-width:850px}.sh-experience-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 18px}
 .sh-experience-fields label{font-size:13px}.sh-experience-fields textarea{min-height:85px}.sh-experience-fields label:has(textarea){grid-column:1/-1}
 .sh-experience-switches{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:14px 0 20px}
 .sh-experience-switches label{display:flex;align-items:center;gap:9px;padding:12px;background:#faf5ef;border:1px solid #eadccc;border-radius:10px}
 .sh-experience-switches input{width:auto}
 @media(max-width:950px){#dashboard{padding-left:0}#dashboard>.nav{float:none;position:relative;left:auto;top:auto;width:100%;height:auto;max-height:none;display:flex;flex-direction:row;flex-wrap:wrap;border-radius:12px}#dashboard>.panel{margin-left:0}#dashboard>.nav .btn{width:auto;white-space:nowrap}.sh-side-group{flex-direction:row;flex-wrap:wrap}.sh-side-toggle{width:100%}.sh-experience-fields,.sh-experience-switches,.sh-design-grid{grid-template-columns:1fr}}
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
 const previewFrame=$('shExperiencePreviewFrame');previewFrame?.addEventListener('load',refreshPreview);
 $('shPreviewUpdate').onclick=()=>{refreshPreview();notify('shExperienceMsg','Preview refreshed with your current settings. Click Save & Publish Experience to apply them to the live site.');$('shExperiencePreviewFrame').scrollIntoView({block:'nearest'})};
 $('shPreviewDesktop').onclick=()=>{$('shPreviewDesktop').classList.add('active');$('shPreviewMobile').classList.remove('active');previewFrame.closest('.sh-preview-shell').classList.remove('mobile');refreshPreview()};
 $('shPreviewMobile').onclick=()=>{$('shPreviewMobile').classList.add('active');$('shPreviewDesktop').classList.remove('active');previewFrame.closest('.sh-preview-shell').classList.add('mobile');refreshPreview()};
 $('shExperienceForm').addEventListener('input',()=>{if(window.shPreviewDebounce)clearTimeout(window.shPreviewDebounce);window.shPreviewDebounce=setTimeout(()=>markDraft(),220)});
 setupSlides();
 $('shResetDesign').onclick=()=>{const form=$('shExperienceForm');for(const [key,,options,fallback] of designSelects)form.elements[key].value=fallback;for(const [key,,,,initial] of designNumbers)form.elements[key].value=initial;form.elements.accent_color.value='#f47721';sectionOrder=sectionDefs.map(x=>x[0]);renderOrder();markDraft('Recommended design selected. Save & Publish to apply.');};
 renderOrder();
 $('shHeroUploadButton').onclick=uploadHero;
 $('shHeroVideoUpload').onclick=uploadHeroVideo;
 bindAboutVideos();
 $('shAboutUpload').onclick=uploadAboutMedia;
 $('shAboutRemove').onclick=()=>{if(activeUploads||publishing||!settingsLoaded)return;const f=$('shExperienceForm');f.elements.about_media_url.value='';f.elements.about_media_type.value='none';notify('shAboutMsg','Photo removed. Click Save & Publish Experience to apply.');markDraft(undefined,'about')};
 $('shHeroVideoRemove').onclick=()=>{const f=$('shExperienceForm');f.elements.video_url.value='';f.elements.hero_media_mode.value='auto';setVideoPreview('');notify('shHeroVideoMsg','Video removed from the settings. Click Save & Publish Experience to apply.');markDraft(undefined,'home')};
 $('shHeroVideoFile').onchange=()=>{const file=$('shHeroVideoFile').files?.[0];if(!file)return;const error=checkVideo(file);if(error)return notify('shHeroVideoMsg',error,true);setVideoPreview(URL.createObjectURL(file),true);notify('shHeroVideoMsg',file.name+' selected. Click Upload Hero Video to continue.')};
 $('shAboutFile').onchange=()=>{const file=$('shAboutFile').files?.[0];if(file)notify('shAboutMsg',file.name+' selected. Click Upload About Media to continue.')};
 $('shHeroUpload').onchange=()=>{const file=$('shHeroUpload').files?.[0];if(!file)return;const u=URL.createObjectURL(file);const img=$('shHeroPreview');img.onload=()=>URL.revokeObjectURL(u);img.src=u;img.style.display='block';notify('shHeroUploadMsg',file.name+' selected. Click Upload Hero Image to continue.')};
 }
 let localVideoPreview='';
 function setVideoPreview(url,isLocal=false){
  if(localVideoPreview){URL.revokeObjectURL(localVideoPreview);localVideoPreview=''}
  if(isLocal)localVideoPreview=url;
  const preview=$('shHeroVideoPreview');if(!preview)return;
  if(url){preview.src=url;preview.style.display='block'}else{preview.pause();preview.removeAttribute('src');preview.load();preview.style.display='none'}
 }
 function checkVideo(file){
  if(!videoType(file))return 'Choose an MP4 or WebM video. On iPhone, export MOV files as MP4 first.';
  if(!file.size||file.size>25*1024*1024)return 'Choose a video smaller than or equal to 25 MB.';
  return '';
 }
 async function uploadHeroVideo(){
  if(!roleCan('owner','manager'))return notify('shHeroVideoMsg','Sign in as a store owner or manager to upload.',true);
  const file=$('shHeroVideoFile').files?.[0];
  if(!file)return notify('shHeroVideoMsg','Choose a video file first.',true);
  const validation=checkVideo(file);if(validation)return notify('shHeroVideoMsg',validation,true);
  const input=$('shHeroVideoFile');
  await runUpload($('shHeroVideoUpload'),'shHeroVideoMsg',async()=>{
   input.disabled=true;$('shHeroVideoRemove').disabled=true;
   const type=videoType(file),bucket=db.storage.from('shopyhat-hero-videos');
   const path='hero/'+crypto.randomUUID()+(type==='video/mp4'?'.mp4':'.webm');
   try{
    const url=await uploadVideoFile(bucket,path,file,type,'shHeroVideoMsg');
    const f=$('shExperienceForm');
    f.elements.video_url.value=url;
    f.elements.hero_media_mode.value=heroSlides.length?'mixed':'video';
    f.elements.cinematic.checked=true;
    try{setVideoPreview(url)}catch{ /* The upload succeeded even if local playback is unavailable. */ }
    notify('shHeroVideoMsg','Video uploaded successfully. Click Save & Publish Experience to make it live.');
    markDraft(undefined,'video');
   }finally{input.disabled=false;$('shHeroVideoRemove').disabled=false}
  });
 }
 async function uploadAboutMedia(){
  if(!roleCan('owner','manager'))return;
  const selected=$('shAboutFile')?.files?.[0];if(!selected)return notify('shAboutMsg','Choose a photo or video first.',true);
  const type=videoType(selected),video=!!type,photo=['image/png','image/jpeg','image/webp'].includes(selected.type);
  if(!video&&!photo)return notify('shAboutMsg','Use JPG, PNG, WebP, MP4 or WebM.',true);
  if(!selected.size||selected.size>(video?25:12)*1024*1024)return notify('shAboutMsg',video?'Video must be at most 25 MB.':'Photo must be at most 12 MB.',true);
  if(video&&aboutVideos.length>=aboutVideoLimit)return notify('shAboutMsg','The playlist is full. Remove a video before uploading a new one.',true);
  await runUpload($('shAboutUpload'),'shAboutMsg',async()=>{
   const file=photo?await optimizeHero(selected):selected;
   const contentType=type||file.type;
   const ext=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm'})[contentType];
   const bucket=photo?'shopyhat-branding':'shopyhat-hero-videos',path='hero/about-'+crypto.randomUUID()+'.'+ext;
   const storage=db.storage.from(bucket);
   let url;
   if(video)url=await uploadVideoFile(storage,path,file,type,'shAboutMsg');
   else{
    const {error}=await storage.upload(path,file,{contentType,cacheControl:'86400',upsert:false});
    if(error)throw error;
    url=storage.getPublicUrl(path).data.publicUrl;
   }
   const f=$('shExperienceForm');
   if(video){
    aboutVideos.push({url,title:''});
    renderAboutVideos();
   }else{
    f.elements.about_media_url.value=url;
    f.elements.about_media_type.value='image';
   }
   $('shAboutFile').value='';
   notify('shAboutMsg','Uploaded successfully. Click Save & Publish Experience to show it on About Us.');markDraft(undefined,'about');
  });
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
  await runUpload($('shHeroUploadButton'),'shHeroUploadMsg',async()=>{
   const file=await optimizeHero(selected);
   const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
   const name='hero/cinematic-'+crypto.randomUUID()+'.'+ext;
   const response=await db.storage.from('shopyhat-branding').upload(name,file,{contentType:file.type,cacheControl:'3600',upsert:false});
   if(response.error)throw response.error;
   const url=db.storage.from('shopyhat-branding').getPublicUrl(name).data.publicUrl;
   $('shExperienceForm').elements.hero_image_url.value=url;
   notify('shHeroUploadMsg','Photo uploaded ('+Math.round(file.size/1024)+' KB). Click Save & Publish Experience to show it on the website.');
   markDraft(undefined,'home');
  });
 }
 async function reload(){
  if(!roleCan('owner','manager')||activeUploads||publishing)return;
  settingsLoaded=false;syncPublish();notify('shExperienceMsg','Loading experience settings…');
  const reloadButton=$('shExperienceReload');reloadButton.disabled=true;reloadButton.textContent='Loading…';
  try{
   const {data,error}=await db.from('sh_storefront_experience').select('config').eq('id',1).maybeSingle();
   if(error)throw error;currentConfig={...(data?.config||{})};const v={...defaults,...currentConfig},form=$('shExperienceForm');
   for(const [key] of fields)form.elements[key].value=v[key]||'';
   for(const [key] of switches)form.elements[key].checked=v[key]!==false;
   form.elements.hero_media_mode.value=mediaModes.includes(v.hero_media_mode)?v.hero_media_mode:'auto';
   form.elements.about_media_type.value=v.about_media_type==='image'?'image':'none';
   form.elements.about_media_url.value=v.about_media_type==='image'?v.about_media_url||'':'';
   const legacy=v.about_media_type==='video'&&v.about_media_url?[{url:v.about_media_url,title:''}]:[];
   const saved=Array.isArray(v.about_videos)&&v.about_videos.length?v.about_videos:legacy;
   aboutVideos=saved.slice(0,aboutVideoLimit).filter(video=>video&&typeof video.url==='string').map((video,i)=>({url:video.url,title:String(video.title||(i===0?"Discover Fashion. Discover SHOPYHAT.":'')),description:String(video.description||(i===0?"Fashion is more than what you wear — it is an expression of who you are. Since 2020, SHOPYHAT has been inspired by the beauty of tradition, contemporary fashion and individual style. Discover a world where elegance meets everyday living. Your Choice, Our Gift.":''))}));
   renderAboutVideos();
   setVideoPreview(/^https:\/\//i.test(v.video_url||'')?v.video_url:'');
   for(const [key,,opts,fallback] of designSelects)form.elements[key].value=opts.includes(v[key])?v[key]:fallback;
   for(const [key,,min,max,initial] of designNumbers){const n=Number(v[key]);form.elements[key].value=Number.isFinite(n)&&n>=min&&n<=max?n:initial;}
   form.elements.accent_color.value=/^#[0-9a-f]{6}$/i.test(v.accent_color||'')?v.accent_color:'#f47721';
   sectionOrder=Array.isArray(v.section_order)&&v.section_order.length===sectionDefs.length&&sectionDefs.every(x=>v.section_order.includes(x[0]))?[...v.section_order]:sectionDefs.map(x=>x[0]);renderOrder();
   heroSlides=Array.isArray(v.hero_slides)?v.hero_slides.slice(0,8).map(x=>({image_url:String(x.image_url||''),headline:String(x.headline||''),subtitle:String(x.subtitle||''),cta_url:String(x.cta_url||'')})):[];
   form.elements.hero_autoplay.checked=v.hero_autoplay!==false;
   form.elements.hero_interval.value=Math.max(3,Math.min(60,Number(v.hero_interval)||6));
   renderSlides();
   const preview=$('shHeroPreview');if(v.hero_image_url){preview.src=v.hero_image_url;preview.style.display='block'}
   settingsLoaded=true;notify('shExperienceMsg','Experience settings loaded.');refreshPreview();
  }catch(e){notify('shExperienceMsg','Could not load settings: '+e.message,true)}finally{reloadButton.disabled=false;reloadButton.textContent='Reload';syncPublish()}
 }
 async function save(e){
  e.preventDefault();if(!roleCan('owner','manager')||!settingsLoaded||publishing||activeUploads)return;
  const f=e.currentTarget,config={...currentConfig};
  for(const [key] of fields){config[key]=f.elements[key].value.trim();if(key.endsWith('_url')&&config[key]&&!/^https:\/\//i.test(config[key]))return notify('shExperienceMsg',key+' must be an HTTPS URL.',true)}
  for(const [key] of switches)config[key]=f.elements[key].checked;
  config.hero_media_mode=mediaModes.includes(f.elements.hero_media_mode.value)?f.elements.hero_media_mode.value:'auto';
  config.about_media_type=f.elements.about_media_type.value==='image'?'image':'none';
  config.about_videos=aboutVideos.map(video=>({url:video.url.trim(),title:video.title.trim().slice(0,80),description:String(video.description||'').trim().slice(0,1200)}));
  if(config.about_videos.some(video=>!isAboutURL(video.url)))return notify('shExperienceMsg','Enter a valid HTTPS URL for each About video, or remove the empty row.',true);
  config.about_media_url=f.elements.about_media_url.value.trim();
  if(config.about_media_type!=='none'&&!/^https:\/\//i.test(config.about_media_url))return notify('shExperienceMsg','Upload About media or provide a valid HTTPS URL.',true);
  if(config.hero_media_mode==='video'&&!config.video_url)return notify('shExperienceMsg','Upload a video or enter a video URL before selecting video mode.',true);
  for(const [key,,options] of designSelects)config[key]=options.includes(f.elements[key].value)?f.elements[key].value:options[0];
  for(const [key,,min,max,initial] of designNumbers){const n=Number(f.elements[key].value);config[key]=Number.isFinite(n)?Math.max(min,Math.min(max,n)):initial;}
  config.accent_color=/^#[0-9a-f]{6}$/i.test(f.elements.accent_color.value)?f.elements.accent_color.value:'#f47721';
  config.section_order=[...sectionOrder];
  const slides=photoSlides(config.hero_image_url);
  if(slides.length>8)return notify('shExperienceMsg','Remove a slide first so the new main photo can fit within the 8-slide limit.',true);
  for(const slide of slides){
   if(!/^https:\/\//i.test(slide.image_url||''))return notify('shExperienceMsg','Upload an image or enter valid HTTPS URL for every slide.',true);
   if(slide.cta_url&&!/^#(?:[a-z0-9/_-]+)?$|^https:\/\//i.test(slide.cta_url))return notify('shExperienceMsg','Slide CTA must be a #path or HTTPS link.',true);
  }
  config.hero_slides=slides;
  config.hero_autoplay=f.elements.hero_autoplay.checked;
  config.hero_interval=Math.max(3,Math.min(60,Number(f.elements.hero_interval.value)||6));
  const button=publishButton();publishing=true;syncPublish();button.textContent='Publishing…';button.setAttribute('aria-busy','true');
  notify('shExperienceMsg','Publishing your storefront changes…');
  try{
   const {error}=await db.from('sh_storefront_experience').upsert({id:1,config,updated_at:new Date().toISOString()},{onConflict:'id'});
   if(error)throw error;
   currentConfig={...config};heroSlides=slides.map(slide=>({...slide}));renderSlides();
   notify('shExperienceMsg','Published successfully. Open Preview Storefront to see your live changes.');
   if(config.video_url)notify('shHeroVideoMsg','Video settings published. Check the selected Hero background mode on the live site.');
  }catch(e){notify('shExperienceMsg','Publishing failed: '+e.message,true)}
  finally{publishing=false;button.textContent='Save & Publish Experience';button.removeAttribute('aria-busy');syncPublish()}

 }
 return {mount,reload};
}

