// SHOPYHAT promotions: secure, staff-only management. Checkout is validated in Postgres.
export function setupPromotions({db,roleCan,notify}){
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmtDate=s=>s?new Date(s).toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric'}):'No limit';
 const dateInput=s=>s?new Date(s).toISOString().slice(0,16):'';
 let rows=[],editId=null;
 const isAllowed=()=>roleCan('owner','manager');
 function mount(){
  if($('promoTab'))return;
  const nav=$('nav'),original=nav.querySelector('[data-page="experience"]')||nav.querySelector('[data-page="catalog"]');
  const tab=document.createElement('button');tab.type='button';tab.className='btn';tab.dataset.page='promos';tab.id='promoTab';tab.textContent='Promo Codes';
  original?.after(tab);
  const panel=document.createElement('div');panel.id='page-promos';panel.className='panel hidden';
  panel.innerHTML=`<div class="topline"><div><h2>Promotions & Discount Codes</h2><p class="muted">Manage multiple active codes. Discount is calculated securely when orders are placed.</p></div><button class="btn primary" type="button" id="promoNew">+ Create Promo Code</button></div>
    <div class="scroll"><table><thead><tr><th>Code</th><th>Discount</th><th>Minimum order</th><th>Validity</th><th>Usage</th><th>Live</th><th>Actions</th></tr></thead><tbody id="promoRows"></tbody></table></div>
    <p class="msg" id="promoMsg" role="status"></p>
    <section id="promoEditor" class="media-section hidden" style="padding:18px;margin-top:18px;border:1px solid #ecdfd3;border-radius:14px;background:#fffaf6">
    <div class="topline"><h3 id="promoEditorTitle">New Promotion</h3><button class="btn small" type="button" id="promoCancel">Close</button></div>
    <form id="promoForm">
      <div class="fieldrow"><div><label>Promo Code *</label><input name="code" required minlength="3" maxlength="32" pattern="[A-Za-z0-9_-]{3,32}" placeholder="EID2026" autocapitalize="characters"></div>
      <div><label>Campaign label</label><input name="title" maxlength="120" placeholder="Festive offer"></div></div>
      <div class="fieldrow"><div><label>Discount type</label><select name="discount_type"><option value="percent">Percentage (%)</option><option value="fixed">Fixed BDT (৳)</option></select></div>
      <div><label>Discount value *</label><input type="number" name="discount_value" step="0.01" min="0.01" required value="10"></div></div>
      <div class="fieldrow"><div><label>Minimum cart amount (৳)</label><input type="number" name="min_order" min="0" step="0.01" value="0"></div>
      <div><label>Maximum discount (৳, optional)</label><input type="number" name="max_discount" min="0" step="0.01" placeholder="No cap"></div></div>
      <div class="fieldrow"><div><label>Starts (optional)</label><input type="datetime-local" name="starts_at"></div>
      <div><label>Expires (optional)</label><input type="datetime-local" name="expires_at"></div></div>
      <div class="fieldrow"><div><label>Total redemption limit (optional)</label><input type="number" name="usage_limit" min="1" step="1" placeholder="Unlimited"></div>
      <div><label>Per mobile number limit (optional)</label><input type="number" name="per_customer_limit" min="1" step="1" placeholder="Unlimited"></div></div>
      <label style="display:flex;gap:10px;align-items:center;margin:15px 0"><input type="checkbox" name="active" style="width:auto"> Publish / Active</label>
      <p class="muted">Only one code per order. Codes are checked against the final server-side cart, date, limits, and minimum order.</p>
      <div class="tools"><button type="submit" class="btn primary">Save Promotion</button><button type="button" class="btn" id="promoReset">Reset</button></div>
    </form></section>`;
  $('dashboard').append(panel);
  tab.onclick=()=>window.SHOPYHAT_SHOW_PAGE?.('promos');
  $('promoNew').onclick=()=>openEditor();
  $('promoCancel').onclick=()=>$('promoEditor').classList.add('hidden');
  $('promoReset').onclick=()=>openEditor(editId);
  $('promoForm').onsubmit=save;
  $('promoRows').addEventListener('click',async event=>{
   const action=event.target.closest('[data-promo-action]');if(!action)return;
   const row=rows.find(x=>x.id===action.dataset.id);if(!row)return;
   if(action.dataset.promoAction==='edit')openEditor(row.id);
   if(action.dataset.promoAction==='toggle'){
    try{const {error}=await db.from('sh_promotions').update({active:!row.active,updated_at:new Date().toISOString()}).eq('id',row.id);if(error)throw error;await reload()}
    catch(e){notify('promoMsg',e.message,true)}
   }
  });
 }
 function openEditor(id=null){
  if(!isAllowed())return;
  editId=id;const r=rows.find(x=>x.id===id)||null,form=$('promoForm');form.reset();
  const vals=r||{code:'',title:'',discount_type:'percent',discount_value:10,min_order:0,max_discount:null,usage_limit:null,per_customer_limit:null,active:false,starts_at:null,expires_at:null};
  Object.keys(vals).forEach(key=>{const input=form.elements.namedItem(key);if(!input)return;
   if(input.type==='checkbox')input.checked=Boolean(vals[key]);
   else if(input.type==='datetime-local')input.value=dateInput(vals[key]);
   else input.value=vals[key]==null?'':vals[key]});
  $('promoEditorTitle').textContent=r?'Edit '+r.code:'Create Promotion';
  form.elements.code.disabled=Boolean(r);
  $('promoEditor').classList.remove('hidden');
  $('promoEditor').scrollIntoView({behavior:'smooth',block:'nearest'});
 }
 async function reload(){
  if(!isAllowed())return;
  try{
   const {data,error}=await db.from('sh_promotions').select('*').order('created_at',{ascending:false}).limit(300);
   if(error)throw error;rows=data||[];
   $('promoRows').innerHTML=rows.map(r=>`<tr><td><b>${esc(r.code)}</b><div class="muted">${esc(r.title||'')}</div></td>
    <td>${r.discount_type==='percent'?esc(r.discount_value)+'%':'৳'+esc(r.discount_value)}${r.max_discount?' · max ৳'+esc(r.max_discount):''}</td>
    <td>৳${esc(r.min_order)}</td><td>${fmtDate(r.starts_at)} — ${fmtDate(r.expires_at)}</td>
    <td>${r.used_count||0} / ${r.usage_limit||'∞'}</td><td><span class="pill">${r.active?'Active':'Draft'}</span></td>
    <td><div class="tools"><button type="button" class="btn small" data-promo-action="edit" data-id="${esc(r.id)}">Edit</button>
    <button type="button" class="btn small" data-promo-action="toggle" data-id="${esc(r.id)}">${r.active?'Pause':'Activate'}</button></div></td></tr>`).join('')||'<tr><td colspan="7">No promotions created. Use + Create Promo Code.</td></tr>';
   notify('promoMsg',rows.length+' promotion code(s) loaded');
  }catch(e){notify('promoMsg',e.message,true)}
 }
 async function save(e){
  e.preventDefault();if(!isAllowed())return;
  const form=e.currentTarget, f=new FormData(form),code=String(f.get('code')||rows.find(x=>x.id===editId)?.code||'').trim().toUpperCase();
  const type=String(f.get('discount_type')),value=Number(f.get('discount_value')),min=Number(f.get('min_order')||0);
  if(!/^[A-Z0-9_-]{3,32}$/.test(code))return notify('promoMsg','Promo code must be 3–32 letters, numbers, _ or -.',true);
  if(!['percent','fixed'].includes(type)||!Number.isFinite(value)||value<=0||(type==='percent'&&value>100))return notify('promoMsg','Discount must be positive; percentage cannot exceed 100.',true);
  if(!Number.isFinite(min)||min<0)return notify('promoMsg','Minimum order is invalid.',true);
  const optionalNum=k=>f.get(k)===''?null:Number(f.get(k));
  const starts=f.get('starts_at')?new Date(String(f.get('starts_at'))).toISOString():null;
  const expires=f.get('expires_at')?new Date(String(f.get('expires_at'))).toISOString():null;
  if(starts&&expires&&expires<=starts)return notify('promoMsg','Expiry must be later than start.',true);
  const payload={code,title:String(f.get('title')||'').trim().slice(0,120),discount_type:type,discount_value:value,min_order:min,max_discount:optionalNum('max_discount'),usage_limit:optionalNum('usage_limit'),per_customer_limit:optionalNum('per_customer_limit'),starts_at:starts,expires_at:expires,active:f.has('active'),updated_at:new Date().toISOString()};
  if([payload.max_discount,payload.usage_limit,payload.per_customer_limit].some(x=>x!==null&&(!Number.isFinite(x)||x<=0)))return notify('promoMsg','Limits must be positive.',true);
  const btn=form.querySelector('[type=submit]');btn.disabled=true;
  try{const q=editId?db.from('sh_promotions').update(payload).eq('id',editId):db.from('sh_promotions').insert(payload);
   const {error}=await q;if(error)throw error;editId=null;$('promoEditor').classList.add('hidden');await reload();notify('promoMsg','Promotion saved. Storefront will verify it at checkout.');
  }catch(err){notify('promoMsg',err.message,true)}finally{btn.disabled=false}
 }
 return{mount,reload};
}
