import {SUPABASE_PUBLISHABLE_KEY} from './config.js';
export function setupExperienceStudio({db,roleCan,notify}){
 let ready=false,currentConfig={},heroSlides=[],activeUploads=0,settingsLoaded=false,publishing=false;
 const publishButton=()=>$('shPublishExperience');
 function syncPublish(){const button=publishButton();if(button)button.disabled=!settingsLoaded||activeUploads>0||publishing;const about=$('shAboutPublish');if(about)about.disabled=!settingsLoaded||activeUploads>0||publishing}
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
  notify('shExperienceMsg',message);if(view==='about')notify('shAboutStudioMsg','Unsaved changes — Save & Publish to update the website.');refreshPreview(view);
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
 let aboutPhotos=[],aboutStories=[];
 const sampleStory={title:'Rooted in Tradition. Styled for Today.',description:'Fashion is a personal expression of who we are. At SHOPYHAT, we celebrate the beauty of Bengali traditions alongside contemporary style. From elegant sarees to versatile three-piece sets and hijabs, our vision is to make discovering your own style a simple, enjoyable experience.',images:['/assets/hero/shopyhat-cinematic-saree.png','/assets/hero/shopyhat-cinematic-hijab.png','/assets/hero/shopyhat-cinematic-campaign.png']};
 function renderAboutContent(){
 const host=$('shAboutContent');if(!host)return;host.replaceChildren();const storyHost=$('shAboutStoriesHost');storyHost?.replaceChildren();
 for(const [label,items,story] of [['About Photo Gallery',aboutPhotos,false],['Inside SHOPYHAT — Stories',aboutStories,true]]){
 const section=document.createElement('section');const h=document.createElement('h3');h.textContent=label;section.append(h);
 const button=(name,fn)=>{const b=document.createElement('button');b.type='button';b.className='btn small';b.textContent=name;b.onclick=()=>{if(settingsLoaded&&!publishing&&!activeUploads)fn()};return b};
 items.forEach((item,i)=>{
 const row=document.createElement('div');row.style.cssText='border:1px solid #ccc;border-radius:12px;padding:12px;margin:12px 0';
 const field=(name,key,multi=false)=>{const l=document.createElement('label');l.textContent=name;const input=document.createElement(multi?'textarea':'input');input.value=item[key]||'';if(story&&(key==='title'||key==='description'))input.required=true;input.oninput=()=>{item[key]=input.value;markDraft(undefined,'about')};l.append(input);row.append(l)};
 field(story?'Title':'Photo title','title');field(story?'Description / body':'Photo description / context','description',true);
 const urls=story?item.images:[item.url];urls.forEach((entry,j)=>{const url=typeof entry==='string'?entry:entry?.url||'';if(story&&typeof entry==='string')item.images[j]={url,title:'',description:''};
 const img=document.createElement('img');img.style.cssText='width:100%;max-width:260px;object-fit:contain;display:block';if(url)img.src=url;row.append(img);
 const input=document.createElement('input');input.type='text';input.placeholder='Image URL ★';input.setAttribute('aria-label','Image URL (required)');input.value=url||'';input.onchange=()=>{if(story)item.images[j].url=input.value.trim();else item.url=input.value.trim();renderAboutContent();markDraft(undefined,'about')};row.append(input);
 if(story){for(const [label,key] of [['Photo title','title'],['Photo context','description']]){const l=document.createElement('label');l.textContent=label;const f=document.createElement(key==='description'?'textarea':'input');f.value=item.images[j][key]||'';f.oninput=()=>{item.images[j][key]=f.value;markDraft(undefined,'about')};l.append(f);row.append(l)}}
 if(story){const move=n=>{const k=j+n;if(k<0||k>=item.images.length)return;[item.images[j],item.images[k]]=[item.images[k],item.images[j]];renderAboutContent();markDraft(undefined,'about')};const up=button('Move photo up',()=>move(-1)),down=button('Move photo down',()=>move(1));up.disabled=j===0;down.disabled=j===item.images.length-1;row.append(up,down,button('Remove image',()=>{if(!confirm('Remove this photo from the draft? Original file is retained.'))return;item.images.splice(j,1);renderAboutContent();markDraft(undefined,'about')}));}
 });
 const upload=document.createElement('input');upload.type='file';upload.accept='image/jpeg,image/png,image/webp';upload.multiple=story;row.append(upload);
 const up=button('Upload / replace photo',async()=>{if(!upload.files.length)return;await runUpload(up,'shAboutMsg',async()=>{for(const selected of upload.files){if(!['image/jpeg','image/png','image/webp'].includes(selected.type)||selected.size>12*1024*1024)throw Error('Use JPG, PNG or WebP under 12 MB');const file=await optimizeHero(selected);const storage=db.storage.from('shopyhat-branding');const path='hero/about-'+crypto.randomUUID()+'.'+(file.type==='image/webp'?'webp':file.type==='image/png'?'png':'jpg');const {error}=await storage.upload(path,file,{contentType:file.type,upsert:false});if(error)throw error;const url=storage.getPublicUrl(path).data.publicUrl;if(story)item.images.push({url,title:'',description:''});else item.url=url;}renderAboutContent();markDraft(undefined,'about')})});row.append(up);
 if(story)row.append(button('Add image URL',()=>{item.images.push({url:'',title:'',description:''});renderAboutContent();markDraft(undefined,'about')}));
 {const move=n=>{const k=i+n;if(k<0||k>=items.length)return;[items[i],items[k]]=[items[k],items[i]];renderAboutContent();markDraft(undefined,'about')};const up=button('Move '+(story?'story':'photo')+' up',()=>move(-1)),down=button('Move '+(story?'story':'photo')+' down',()=>move(1));up.disabled=i===0;down.disabled=i===items.length-1;row.append(up,down);}
 row.append(button('Remove '+(story?'story':'photo'),()=>{if(confirm('Remove from draft? Original files will be retained.')){items.splice(i,1);renderAboutContent();markDraft(undefined,'about')}}));section.append(row);
 });section.append(button(story?'Add story':'Add photo',()=>{items.push(story?{title:'',description:'',images:[]}:{title:'',description:'',url:''});renderAboutContent();markDraft(undefined,'about')}));(story&&storyHost?storyHost:host).append(section);
 }
 }

 const aboutVideoLimit=6;
 const isAboutURL=value=>{try{return new URL(value).protocol==='https:'}catch{return false}};
 function renderAboutVideos(){
  const list=$('shAboutVideos');
  list.innerHTML=aboutVideos.map((video,i)=>'<div class="sh-about-video-row" data-video-index="'+i+'">'+
   '<div style="margin:12px 0"><video controls playsinline preload="none" style="display:block;width:100%;max-width:480px;aspect-ratio:16/9;object-fit:contain;background:#21150e;border-radius:12px" '+(isAboutURL(String(video.url||'').trim())?'src="'+esc(video.url.trim())+'"':'')+'></video><p class="muted">Current video preview · '+esc(String(video.url||'').split('?')[0].split('/').pop()||'No video selected')+'</p></div>'+ '<div class="sh-experience-fields"><label>Video '+(i+1)+' title (optional)<input type="text" maxlength="80" data-video-field="title" value="'+esc(video.title)+'"></label>'+
   '<label>Video HTTPS URL<input required type="url" data-video-field="url" value="'+esc(video.url)+'" placeholder="https://..."></label><label>Video context<textarea maxlength="1200" rows="4" data-video-field="description">'+esc(video.description||'')+'</textarea></label></div>'+
   '<div class="editor-actions"><button class="btn small" type="button" data-video-action="up" '+(i===0?'disabled':'')+' aria-label="Move video '+(i+1)+' up">↑</button>'+
   '<button class="btn small" type="button" data-video-action="down" '+(i===aboutVideos.length-1?'disabled':'')+' aria-label="Move video '+(i+1)+' down">↓</button>'+
   '<button class="btn small" type="button" data-video-action="remove" aria-label="Remove video '+(i+1)+'" style="color:#b42318;border:1px solid #b42318">Remove video</button></div></div>').join('');
  if(!aboutVideos.length)list.innerHTML='<p class="muted" role="status">No videos in playlist. Add or upload a video to get started. Published videos remain live until Save & Publish.</p>';
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
   if(action==='remove'){
    if(!aboutVideos[index])return;
    if(!window.confirm('Remove this video and its title/context from the playlist? The original file will be retained. Save & Publish to apply.'))return;
    aboutVideos.splice(index,1);
   }
   else{
    const target=index+(action==='up'?-1:1);
    if(!aboutVideos[target])return;
    [aboutVideos[index],aboutVideos[target]]=[aboutVideos[target],aboutVideos[index]];
   }
   renderAboutVideos();
   markDraft(action==='remove'?'Video removed from draft. Save & Publish to update the website.':'About video playlist updated. Publish to apply.','about');
  });
 }
const dimensionModes=['classic','premium','immersive'];
 function dimensionValues(){const f=$('shExperienceForm');const old=currentConfig.product_dimension||{};return {...old,enabled:f.elements.dimension_enabled.checked,mode:f.elements.dimension_mode.value,ambient:f.elements.dimension_ambient.checked,allow_customer_switch:f.elements.dimension_switch.checked,intensity:Number(f.elements.dimension_intensity.value)};}
 function loadDimension(v){const f=$('shExperienceForm'),d=v.product_dimension||{};f.elements.dimension_enabled.checked=d.enabled===true;f.elements.dimension_mode.value=dimensionModes.includes(d.mode)?d.mode:'classic';f.elements.dimension_ambient.checked=d.ambient!==false;f.elements.dimension_switch.checked=d.allow_customer_switch!==false;f.elements.dimension_intensity.value=Math.max(0,Math.min(100,Number(d.intensity??42))); }
  function previewConfig(){
  const f=$('shExperienceForm');if(!f)return {};
  const c={...defaults,...currentConfig};
  for(const [key] of fields)c[key]=f.elements[key]?.value?.trim()||'';
  for(const [key] of switches)c[key]=f.elements[key]?.checked!==false;
  c.hero_media_mode=mediaModes.includes(f.elements.hero_media_mode?.value)?f.elements.hero_media_mode.value:'auto';
  c.about_media_type=f.elements.about_media_type?.value||'none';c.about_media_url=f.elements.about_media_url?.value?.trim()||'';
  c.about_photos=aboutPhotos;c.about_stories=aboutStories;
  c.about_videos=aboutVideos.filter(video=>isAboutURL(video.url.trim())).map(video=>({url:video.url.trim(),title:video.title.trim(),description:String(video.description||'').trim().slice(0,1200)}));
  for(const [key] of designSelects)c[key]=f.elements[key]?.value;
  for(const [key,,min,max,fallback] of designNumbers){
   const n=Number(f.elements[key]?.value);c[key]=Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;
  }
  c.accent_color=f.elements.accent_color?.value||'#f47721';
  c.section_order=[...sectionOrder];
  c.hero_slides=photoSlides(c.hero_image_url).filter(slide=>/^https:\/\//i.test(slide.image_url||'')).slice(0,8);
  c.product_dimension=dimensionValues();
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
  panel.querySelector('#shExperienceForm').prepend(aboutFields);const contentHost=document.createElement('section');contentHost.id='shAboutContent';aboutFields.after(contentHost);
  const form=panel.querySelector('#shExperienceForm');
  const dimension=document.createElement('section');dimension.className='sh-design-editor';dimension.innerHTML='<h3>Product Dimension Studio</h3><p class="muted">Optional product presentation. Open a product in the preview to inspect the effect.</p><div class="sh-experience-fields"><label><input type="checkbox" name="dimension_enabled"> Enable product experience</label><label>Display mode<select name="dimension_mode"><option value="classic">Classic</option><option value="premium">Premium</option><option value="immersive">Immersive 2.5D</option></select></label><label><input type="checkbox" name="dimension_ambient" checked> Adaptive colour background</label><label><input type="checkbox" name="dimension_switch" checked> Allow customer display choice</label><label>Ambient intensity<input type="range" name="dimension_intensity" min="0" max="100" value="42"></label></div>';form.prepend(dimension);
  form.addEventListener('invalid',()=>notify('shExperienceMsg','Check the highlighted field before publishing.',true),true);
  const actions=panel.querySelector('#shExperienceMsg').previousElementSibling;
  const publish=actions.querySelector('[type=submit]');
  publish.id='shPublishExperience';publish.setAttribute('form',form.id);publish.disabled=true;
  const publishBar=document.createElement('div');publishBar.className='sh-publish-bar';
  publishBar.append(actions,panel.querySelector('#shExperienceMsg'));
  panel.querySelector('.topline').after(publishBar);
  nav.after(panel);
  const aboutTab=document.createElement('button');aboutTab.type='button';aboutTab.className='btn';aboutTab.id='aboutStudioTab';aboutTab.dataset.page='about-studio';aboutTab.textContent='About Us Studio';b.after(aboutTab);
  const studio=document.createElement('div');studio.id='page-about-studio';studio.className='panel hidden';panel.after(studio);
  studio.innerHTML='<h2>About Us Studio</h2><p class="muted">Manage brand content independently of homepage design.</p><div id="shAboutTabs" style="display:flex;gap:8px;flex-wrap:wrap"></div><div id="shAboutWorkspace"></div><div class="editor-actions"><button type="button" class="btn primary" id="shAboutPublish">Save &amp; Publish</button><button type="button" class="btn" id="shAboutPreview">Preview draft</button></div><p id="shAboutStudioMsg" role="status"></p><div id="shAboutPreviewHost"></div>';
  const workspace=studio.querySelector('#shAboutWorkspace'),tabs=studio.querySelector('#shAboutTabs');
  const profile=document.createElement('section');profile.innerHTML='<h3>Brand Profile</h3><p class="muted">Leave fields blank to retain the original website copy.</p>'+[['intro_title','Introduction title'],['intro_body','Introduction / purpose'],['history_title','History title'],['history_body','History / journey'],['vision','Vision'],['mission','Mission'],['goals','Goals']].map(([key,label])=>'<label>'+label+'<textarea rows="3" data-profile="'+key+'"></textarea></label>').join('');
  profile.insertAdjacentHTML('beforeend',"<h3>Our Journey & Brand Promise</h3><div class=\"sh-design-grid\"><label>journey title<input data-profile=\"journey_title\" type=\"text\" required></label><label>journey title bn<input data-profile=\"journey_title_bn\" type=\"text\" required></label><label>planning date<input data-profile=\"planning_date\" type=\"date\" required></label><label>launch date<input data-profile=\"launch_date\" type=\"date\" required></label><label>planning title<input data-profile=\"planning_title\" type=\"text\" required></label><label>planning title bn<input data-profile=\"planning_title_bn\" type=\"text\" required></label><label>launch title<input data-profile=\"launch_title\" type=\"text\" required></label><label>launch title bn<input data-profile=\"launch_title_bn\" type=\"text\" required></label><label>planning description<input data-profile=\"planning_description\" type=\"text\" required></label><label>planning description bn<input data-profile=\"planning_description_bn\" type=\"text\" required></label><label>launch description<input data-profile=\"launch_description\" type=\"text\" required></label><label>launch description bn<input data-profile=\"launch_description_bn\" type=\"text\" required></label><label>promise label<input data-profile=\"promise_label\" type=\"text\" required></label><label>promise label bn<input data-profile=\"promise_label_bn\" type=\"text\" required></label><label>promise text<input data-profile=\"promise_text\" type=\"text\" required></label><label>promise text bn<input data-profile=\"promise_text_bn\" type=\"text\" required></label></div>");
  const photo=document.createElement('section'),discover=document.createElement('section'),storiesPane=document.createElement('section');
  const legacyFields=aboutFields.querySelector('.sh-experience-fields');legacyFields.querySelectorAll('input,select').forEach(x=>x.setAttribute('form',form.id));const coverPreview=document.createElement('img');coverPreview.alt='Current About cover';coverPreview.style.cssText='display:block;max-width:100%;width:320px;border-radius:12px';const coverInput=legacyFields.querySelector('[name=about_media_url]');const showCover=()=>{const url=coverInput.value.trim();coverPreview.style.display=url?'block':'none';if(url)coverPreview.src=url;else coverPreview.removeAttribute('src')};coverInput.addEventListener('input',showCover);studio.addEventListener('sh-about-loaded',showCover);photo.append(legacyFields,coverPreview,contentHost);discover.append(aboutSection,aboutFields);
  storiesPane.id='shAboutStoriesHost';const panes={profile,photo,discover,stories:storiesPane};Object.values(panes).forEach(x=>workspace.append(x));
  let selected='profile';const selectAbout=key=>{selected=key;for(const [k,p] of Object.entries(panes))p.hidden=k!==key;tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.section===key));};
  for(const [key,label] of [['profile','Brand Profile'],['photo','Photo Gallery'],['discover','Discover SHOPYHAT'],['stories','Inside SHOPYHAT']]){const tab=document.createElement('button');tab.type='button';tab.className='btn';tab.dataset.section=key;tab.textContent=label;tab.onclick=()=>selectAbout(key);tabs.append(tab)}
  selectAbout('profile');aboutTab.onclick=()=>window.SHOPYHAT_SHOW_PAGE?.('about-studio');
  const profileValues=()=>({...currentConfig.about_profile,...Object.fromEntries([...profile.querySelectorAll('[data-profile]')].map(x=>[x.dataset.profile,x.value.trim()]))});
  const profileDefaults={"intro_title":"What you see should be what you receive.","intro_body":"We aim to close the gap between online product photos and customers' real experience. Clear descriptions, transparent options, thoughtful sourcing and dependable support are the principles guiding how we grow.","history_title":"A small beginning.\nA bigger purpose.","history_body":"Our planning began on August 01, 2020. We went live on August 28, 2020, starting from a personal initiative to serve customers with products they actually wanted.\n\nOur early collection included hijabs, cosmetics, three-piece sets, sarees and other assorted lifestyle items. Customer feedback was encouraging. Some customers returned and requested the same products again, which strengthened our confidence in the idea.\n\nRepeat demand also brought stock and inventory-management challenges. Learning to manage availability, reorder planning and customer expectations became an important part of our journey. Those experiences continue to shape how we want to build SHOPYHAT.","vision":"To become a dependable marketplace for authentic fashion, lifestyle and daily-need products that customers can shop from with confidence.","mission":"To offer accurately presented selections at reasonable prices, support customers throughout their shopping journey and continuously improve fulfillment.","goals":"To expand useful collections responsibly, improve stock availability, strengthen service quality and earn trust through every order."};Object.assign(profileDefaults,{"journey_title":"Our Journey","journey_title_bn":"আমাদের যাত্রা","planning_date":"2020-08-01","launch_date":"2020-08-28","planning_title":"The Vision","planning_title_bn":"পরিকল্পনার শুরু","launch_title":"The Launch","launch_title_bn":"অনলাইন যাত্রা","planning_description":"The beginning of our journey.","planning_description_bn":"আমাদের যাত্রার সূচনা।","launch_description":"SHOPYHAT officially went online.","launch_description_bn":"SHOPYHAT আনুষ্ঠানিকভাবে অনলাইনে যাত্রা শুরু করে।","promise_label":"Our Brand Promise","promise_label_bn":"আমাদের ব্র্যান্ডের প্রতিশ্রুতি","promise_text":"Your Choice, Our Gift.","promise_text_bn":"আপনার পছন্দ, আমাদের উপহার।"});const loadProfile=()=>profile.querySelectorAll('[data-profile]').forEach(x=>x.value=currentConfig.about_profile?.[x.dataset.profile]||profileDefaults[x.dataset.profile]||'');
  studio.addEventListener('sh-profile-load',loadProfile);
  studio.querySelector('#shAboutPublish').onclick=async()=>{
   if(!roleCan('owner','manager')||!settingsLoaded||publishing||activeUploads)return notify('shAboutStudioMsg','Wait for database loading or upload to finish.',true);
   if(selected==='profile'){const invalid=[...profile.querySelectorAll('[required]')].find(x=>!x.value.trim()||!x.checkValidity());if(invalid){invalid.reportValidity();invalid.focus();return notify('shAboutStudioMsg','Complete all required journey fields.',true)}if(profileValues().planning_date>profileValues().launch_date)return notify('shAboutStudioMsg','Launch date must not precede planning date.',true)}
   const patch=selected==='profile'?{about_profile:profileValues()}:selected==='photo'?{about_photos:aboutPhotos.filter(x=>x.url),about_media_type:form.elements.about_media_type.value,about_media_url:form.elements.about_media_type.value==='image'?form.elements.about_media_url.value.trim():''}:selected==='discover'?{about_videos:aboutVideos.map(x=>({...x,url:x.url.trim()}))}:{about_stories:aboutStories.map(x=>({...x,images:x.images.filter(v=>typeof v==='string'?v:v?.url)}))};
   if(selected==='stories'&&aboutStories.some(x=>!x.title?.trim()||!x.description?.trim()||!x.images.some(v=>isAboutURL(typeof v==='string'?v:v?.url||''))))return notify('shAboutStudioMsg','Each story requires a title, description and valid HTTPS image.',true);
   if(selected==='photo'&&aboutPhotos.some(x=>!isAboutURL(x.url||'')))return notify('shAboutStudioMsg','Each gallery photo requires a valid HTTPS image URL.',true);
   if(patch.about_videos?.some(x=>!isAboutURL(x.url)))return notify('shAboutStudioMsg','Enter valid HTTPS video URLs.',true);
   if(selected==='discover'&&currentConfig.about_media_type==='video'){patch.about_media_type='none';patch.about_media_url=''}
   const btn=$('shAboutPublish');publishing=true;btn.textContent='Publishing…';btn.setAttribute('aria-busy','true');syncPublish();try{await publishPatch(patch);notify('shAboutStudioMsg','Selected section published successfully. Database read-back verified.')}catch(e){notify('shAboutStudioMsg',e.message,true)}finally{publishing=false;btn.textContent='Save & Publish';btn.removeAttribute('aria-busy');syncPublish()}
  };
  studio.querySelector('#shAboutPreview').onclick=()=>{const host=studio.querySelector('#shAboutPreviewHost');let frame=host.querySelector('iframe');if(!frame){frame=document.createElement('iframe');frame.src='/?studio_preview=1#about';frame.title='About Us draft preview';frame.style.cssText='width:100%;height:650px;border:1px solid #ccc';host.append(frame)}const send=()=>frame.contentWindow?.postMessage({type:'shopyhat:studio-preview',config:{...previewConfig(),about_profile:profileValues()},view:'about'},location.origin);frame.onload=send;send()};

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
 const groupMap=[['Commerce',['products','orders','payments']],['Storefront',['experience','about-studio','catalog','brand','reviews']],['Operations',['cases','insights','activity','users']]];
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
    aboutPhotos.push({url,title:'',description:''});renderAboutContent();
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
   if(error)throw error;currentConfig={...(data?.config||{})};$('page-about-studio')?.dispatchEvent(new Event('sh-profile-load'));const v={...defaults,...currentConfig},form=$('shExperienceForm');
   loadDimension(v);
   for(const [key] of fields)form.elements[key].value=v[key]||'';
   for(const [key] of switches)form.elements[key].checked=v[key]!==false;
   form.elements.hero_media_mode.value=mediaModes.includes(v.hero_media_mode)?v.hero_media_mode:'auto';
   form.elements.about_media_type.value=v.about_media_type==='image'?'image':'none';
   form.elements.about_media_url.value=v.about_media_type==='image'?v.about_media_url||'':'';
   const legacy=v.about_media_type==='video'&&v.about_media_url?[{url:v.about_media_url,title:''}]:[];
   const saved=Array.isArray(v.about_videos)&&v.about_videos.length?v.about_videos:legacy;
   aboutVideos=saved.slice(0,aboutVideoLimit).filter(video=>video&&typeof video.url==='string').map((video,i)=>({url:video.url,title:String(video.title||(i===0?"Discover Fashion. Discover SHOPYHAT.":'')),description:String(video.description||(i===0?"Fashion is more than what you wear — it is an expression of who you are. Since 2020, SHOPYHAT has been inspired by the beauty of tradition, contemporary fashion and individual style. Discover a world where elegance meets everyday living. Your Choice, Our Gift.":''))}));
   aboutPhotos=Array.isArray(v.about_photos)?v.about_photos.map(x=>({...x})):v.about_media_type==='image'&&v.about_media_url?[{url:v.about_media_url,title:'',description:''}]:[];aboutStories=Array.isArray(v.about_stories)?v.about_stories.map(x=>({...x,images:[...(x.images||[])]})): [structuredClone(sampleStory)];renderAboutContent();
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
   settingsLoaded=true;$('page-about-studio')?.dispatchEvent(new Event('sh-about-loaded'));notify('shAboutStudioMsg','Database connected — published content loaded.');notify('shExperienceMsg','Experience settings loaded.');refreshPreview();
  }catch(e){notify('shAboutStudioMsg','Could not load database content: '+e.message,true);notify('shExperienceMsg','Could not load settings: '+e.message,true)}finally{reloadButton.disabled=false;reloadButton.textContent='Reload';syncPublish()}
 }
 async function publishPatch(patch){
 const {data,error}=await db.from('sh_storefront_experience').select('config,updated_at').eq('id',1).single();if(error)throw error;
 const config={...data.config,...patch};let q=db.from('sh_storefront_experience').update({config,updated_at:new Date().toISOString()}).eq('id',1);q=data.updated_at==null?q.is('updated_at',null):q.eq('updated_at',data.updated_at);const result=await q.select('config').maybeSingle();if(result.error)throw result.error;if(!result.data)throw Error('Settings changed elsewhere. Retry publishing.');currentConfig={...result.data.config};const check=await db.from('sh_storefront_experience').select('config').eq('id',1).single();if(check.error)throw check.error;const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;for(const k of Object.keys(patch)){if(JSON.stringify(canonical(check.data.config[k]))!==JSON.stringify(canonical(patch[k])))throw Error('Published data verification failed for '+k)}
 }
 async function save(e){
  e.preventDefault();if(!roleCan('owner','manager')||!settingsLoaded||publishing||activeUploads)return;
  const f=e.currentTarget,config={...currentConfig};
  for(const [key] of fields){config[key]=f.elements[key].value.trim();if(key.endsWith('_url')&&config[key]&&!/^https:\/\//i.test(config[key]))return notify('shExperienceMsg',key+' must be an HTTPS URL.',true)}
  for(const [key] of switches)config[key]=f.elements[key].checked;
  config.hero_media_mode=mediaModes.includes(f.elements.hero_media_mode.value)?f.elements.hero_media_mode.value:'auto';
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
  config.product_dimension=dimensionValues();
  config.hero_autoplay=f.elements.hero_autoplay.checked;
  config.hero_interval=Math.max(3,Math.min(60,Number(f.elements.hero_interval.value)||6));
  const button=publishButton();publishing=true;syncPublish();button.textContent='Publishing…';button.setAttribute('aria-busy','true');
  notify('shExperienceMsg','Publishing your storefront changes…');
  try{
   const patch=Object.fromEntries(Object.entries(config).filter(([k])=>!k.startsWith('about_')));await publishPatch(patch);heroSlides=slides.map(slide=>({...slide}));renderSlides();
   notify('shExperienceMsg','Published successfully. Open Preview Storefront to see your live changes.');
   if(config.video_url)notify('shHeroVideoMsg','Video settings published. Check the selected Hero background mode on the live site.');
  }catch(e){notify('shExperienceMsg','Publishing failed: '+e.message,true)}
  finally{publishing=false;button.textContent='Save & Publish Experience';button.removeAttribute('aria-busy');syncPublish()}

 }
 return {mount,reload};
}

