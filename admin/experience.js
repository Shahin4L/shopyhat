export function setupExperienceStudio({db,roleCan,notify}){
 let ready=false;
 const defaults={cinematic:true,video_url:'',hero_image_url:'',headline:'Your choice, our gift.',subtitle:'Sarees, three-piece sets, hijab and accessories, chosen with care.',show_ribbon:true,show_floating_cards:true,show_new_arrivals:true,show_categories:true,show_campaigns:true,announcement:'Free delivery on orders above ৳1500',campaign_text:'Discover our new arrivals'};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const $=id=>document.getElementById(id);
 const fields=[['announcement','Announcement bar text','text'],['headline','Hero headline','text'],['subtitle','Hero subtitle','textarea'],['hero_image_url','Cinematic background image HTTPS URL','url'],['video_url','Background MP4 / WebM HTTPS URL (optional)','url'],['campaign_text','Campaign heading','text']];
 const switches=[['cinematic','Cinematic Hero'],['show_ribbon','Orange Ribbon Design'],['show_floating_cards','Floating Product Images'],['show_new_arrivals','New Arrivals Section'],['show_categories','Featured Categories'],['show_campaigns','Campaign Section']];
 function mount(){
  if(ready)return;
  ready=true;
  const nav=$('nav'),dashboard=$('dashboard');if(!nav||!dashboard)return;
  const b=document.createElement('button');b.type='button';b.className='btn';b.id='experienceTab';b.dataset.page='experience';b.textContent='Storefront Studio';
  const brand=$('brandTab');nav.insertBefore(b,brand||nav.firstChild);
  const panel=document.createElement('div');panel.className='panel hidden';panel.id='page-experience';
  panel.innerHTML='<div class="topline"><div><h2>Storefront Experience Studio</h2><p class="muted">Control homepage visuals, campaigns and sections without changing order workflows.</p></div><a class="btn" target="_blank" rel="noopener" href="/">↗ Preview Storefront</a></div><form id="shExperienceForm" class="sh-experience-form"><div class="sh-experience-fields">'+fields.map(([key,title,type])=>'<label>'+esc(title)+(type==='textarea'?'<textarea name="'+key+'" rows="3"></textarea>':'<input type="'+type+'" name="'+key+'" placeholder="'+(type==='url'?'https://...':'')+'">')+'</label>').join('')+'</div><h3>Homepage visibility</h3><div class="sh-experience-switches">'+switches.map(([key,title])=>'<label><input type="checkbox" name="'+key+'"> '+esc(title)+'</label>').join('')+'</div><p class="muted">Tip: Hero video is optional. For performance, use an optimized, muted looping video and an image fallback. Product images in Mega Menu and Live Search come from your existing catalog.</p><div class="editor-actions"><button class="btn primary" type="submit">Save & Publish Experience</button><button class="btn" type="button" id="shExperienceReload">Reload</button></div><p id="shExperienceMsg" class="msg" role="status"></p></form>';
  nav.after(panel);
  const style=document.createElement('style');style.textContent=`
 #dashboard{position:relative;padding-left:215px}#dashboard>.nav{position:fixed;left:0;top:68px;bottom:0;width:205px;z-index:45;overflow-y:auto;margin:0;padding:15px 10px;background:#191310;border-right:1px solid #3c302a;display:flex;flex-direction:column;flex-wrap:nowrap;gap:4px}
 #dashboard>.nav .btn{width:100%;text-align:left;background:transparent;color:#e3d8ce;border:0;border-radius:8px;font-size:12.5px;padding:11px}
 #dashboard>.nav .btn.active,#dashboard>.nav .btn:hover{background:#ed7924;color:#1d0d05}
 .sh-side-heading{color:#c48e6b;font-size:10px;text-transform:uppercase;letter-spacing:.12em;padding:14px 9px 5px;font-weight:800}
 .sh-side-group{display:flex;flex-direction:column;gap:3px}.sh-side-group[hidden]{display:none}
 .sh-side-toggle{display:flex;justify-content:space-between;align-items:center;cursor:pointer;border:0;background:transparent;color:#f7af77;padding:12px 8px;text-align:left;font-weight:700;border-bottom:1px solid #3b2a20}
 .sh-experience-form{max-width:850px}.sh-experience-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 18px}
 .sh-experience-fields label{font-size:13px}.sh-experience-fields textarea{min-height:85px}.sh-experience-fields label:has(textarea){grid-column:1/-1}
 .sh-experience-switches{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:14px 0 20px}
 .sh-experience-switches label{display:flex;align-items:center;gap:9px;padding:12px;background:#faf5ef;border:1px solid #eadccc;border-radius:10px}
 .sh-experience-switches input{width:auto}
 @media(max-width:800px){#dashboard{padding-left:0}#dashboard>.nav{position:relative;left:auto;top:auto;width:100%;height:auto;max-height:none;display:flex;flex-direction:row;flex-wrap:wrap;border-radius:12px}#dashboard>.nav .btn{width:auto}.sh-side-group{flex-direction:row;flex-wrap:wrap}.sh-side-toggle{width:100%}.sh-experience-fields,.sh-experience-switches{grid-template-columns:1fr}}
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
 }
 async function reload(){
  if(!roleCan('owner','manager'))return;
  try{
   const {data,error}=await db.from('sh_storefront_experience').select('config').eq('id',1).maybeSingle();
   if(error)throw error;const v={...defaults,...(data?.config||{})},form=$('shExperienceForm');
   for(const [key] of fields)form.elements[key].value=v[key]||'';
   for(const [key] of switches)form.elements[key].checked=v[key]!==false;
   notify('shExperienceMsg','Experience settings loaded.');
  }catch(e){notify('shExperienceMsg',e.message,true)}
 }
 async function save(e){
  e.preventDefault();if(!roleCan('owner','manager'))return;
  const f=e.currentTarget,config={};
  for(const [key] of fields){config[key]=f.elements[key].value.trim();if(key.endsWith('_url')&&config[key]&&!/^https:\/\//i.test(config[key]))return notify('shExperienceMsg',key+' must be an HTTPS URL.',true)}
  for(const [key] of switches)config[key]=f.elements[key].checked;
  const button=f.querySelector('[type=submit]');button.disabled=true;
  try{const {error}=await db.from('sh_storefront_experience').upsert({id:1,config,updated_at:new Date().toISOString()},{onConflict:'id'});
   if(error)throw error;notify('shExperienceMsg','Published successfully. Refresh storefront to see your changes.');
  }catch(e){notify('shExperienceMsg',e.message,true)}finally{button.disabled=false}
 }
 return {mount,reload};
}
