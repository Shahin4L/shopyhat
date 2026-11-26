import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.49.10';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,CHECKOUT_URL} from './config.js';
import {setupBrandManager} from './brand.js';
import {setupCatalogManager} from './catalog.js';
import {setupExperienceStudio} from './experience.js?v=20261127-about-remove';
import {setupPromotions} from './promotions.js';
import {setupResellerOperations} from './resellers.js?v=20261125-cancel-zone';
const db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>'৳'+Number(v||0).toLocaleString('en-BD',{maximumFractionDigits:2});
const fmtDate=v=>v?new Date(v).toLocaleString('en-BD',{timeZone:'Asia/Dhaka',dateStyle:'medium',timeStyle:'short'}):'—';
const roleCan=(...r)=>r.includes(role);
const branding=setupBrandManager({db,roleCan,notify:(id,msg,error)=>notice(id,msg,error),formatDate:fmtDate});
const catalog=setupCatalogManager({db,roleCan,notify:(id,msg,error)=>notice(id,msg,error),fmtDate});
const experience=setupExperienceStudio({db,roleCan,notify:(id,msg,error)=>notice(id,msg,error)});
const promos=setupPromotions({db,roleCan,notify:(id,msg,error)=>notice(id,msg,error)});
const resellers=setupResellerOperations({db,roleCan,notify:(id,msg,error)=>notice(id,msg,error)});
const imageUrl=v=>{const s=String(v||'');const m=s.match(/drive\.google\.com\/file\/d\/([\w-]+)/)||s.match(/[?&]id=([\w-]+)/);return m&&s.includes('google.com')?'https://drive.google.com/thumbnail?id='+m[1]+'&sz=w1000':s};
let actor=null,role='',products=[],variants=[],images=[],orders=[],orderItems=[],payments=[],staff=[],audit=[],reviews=[],cases=[],caseMedia=[],caseUpdates=[],caseReplies=[],dailyStats=[],archiveHealth=null,reviewMedia=[],archiveRequests=[],activePage='products';
function notice(id,message,error=false){$(id).textContent=message;$(id).classList.toggle('error',!!error)}
function show(id,on){$(id).classList.toggle('hidden',!on)}
function drawer(title,html){$('drawerTitle').textContent=title;$('drawerBody').innerHTML=html;notice('drawerMsg','');show('overlay',true)}
function closeDrawer(){show('overlay',false)}
function formData(id){return Object.fromEntries(new FormData($(id)).entries())}
function imgTag(url,label='Product photo'){return url?'<img src="'+esc(imageUrl(url))+'" alt="'+esc(label)+'" loading="lazy" onerror="this.style.visibility=\'hidden\'">':''}

function orderItemImage(item){
 if(item.image_url)return item.image_url;
 const candidates=images.filter(img=>img.product_id===item.product_id&&(img.variant_id===item.variant_id||!img.variant_id)&&img.image_url);
 candidates.sort((x,y)=>Number(y.variant_id===item.variant_id&&!!y.variant_id)-Number(x.variant_id===item.variant_id&&!!x.variant_id)||(Number(x.sort_order)||0)-(Number(y.sort_order)||0));
 return candidates[0]?.image_url||'';
}
function orderThumb(o){
 const item=orderItems.find(i=>i.order_id===o.id&&orderItemImage(i));
 if(!item)return '<span class="order-thumb" aria-label="No image">—</span>';
 const src=esc(imageUrl(orderItemImage(item))),title=esc(item.product_name);
 return '<span class="order-thumb" tabindex="0" aria-label="Preview '+title+'"><img src="'+src+'" alt="'+title+'" loading="lazy" onerror="this.hidden=true"><span class="image-popover" aria-hidden="true"><img src="'+src+'" alt=""></span></span>';
}
function productPhotoTiles(rows,label,canDelete=true){
 return rows.map(i=>'<figure><img src="'+esc(imageUrl(i.image_url))+'" alt="'+esc(label||'Photo')+'" loading="lazy" data-view-photo="'+esc(imageUrl(i.image_url))+'" title="Click to preview" tabindex="0">'+(canDelete&&roleCan('owner','manager')?'<button type="button" class="photo-delete" title="Remove photo" aria-label="Remove photo" data-delete-photo="'+esc(i.id)+'">×</button>':'')+'<figcaption>'+esc(i.alt_text||'Photo')+'</figcaption></figure>').join('');
}
function setupLocalPhotoPreview(fileInputId,previewId){
 const input=$(fileInputId),preview=$(previewId);
 if(!input||!preview)return;
 let urls=[];
 input.onchange=()=>{urls.forEach(URL.revokeObjectURL);urls=[];
   const files=[...input.files];preview.innerHTML=files.map(file=>{
     const url=URL.createObjectURL(file);urls.push(url);
     return '<figure><img src="'+esc(url)+'" alt="Selected image"><figcaption>'+esc(file.name)+'</figcaption></figure>';
   }).join('');
 };
}
async function query(table,selection='*',limit=30000){
 const out=[],batch=500,key=table==='sh_staff'?'email':'id';
 for(let offset=0;offset<limit;offset+=batch){
  const q=await db.from(table).select(selection).order(key,{ascending:true}).range(offset,offset+batch-1);
  if(q.error)throw q.error;
  out.push(...(q.data||[]));
  if(!q.data||q.data.length<batch)return out;
 }
 throw Error('Data limit reached for '+table+'. Use server-side reporting to export beyond '+limit+' records.');
}
async function queryTraffic(){
 const out=[],batch=1000;
 for(let offset=0;offset<12000;offset+=batch){
  const r=await db.from('sh_web_daily_stats').select('*').order('event_date',{ascending:false}).range(offset,offset+batch-1);
  if(r.error)throw r.error;
  out.push(...(r.data||[]));
  if(!r.data||r.data.length<batch)break;
 }
 return out;
}

/* SHOPYHAT Operations — date filtering and verified database audit. */
const tzDate=v=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(v instanceof Date?v:new Date(v));
function dateOK(record,table=''){
 const from=$('dateFrom')?.value||'',to=$('dateTo')?.value||'';
 if(!from&&!to)return true;
 const basis=$('dateBasis')?.value||'created';
 const val=table==='audit'?record.created_at:(basis==='updated'?(record.updated_at||record.reviewed_at||record.created_at):(record.created_at||record.updated_at));
 if(!val)return false;
 const day=tzDate(val);return (!from||day>=from)&&(!to||day<=to);
}
function rangeValid(){const from=$('dateFrom')?.value||'',to=$('dateTo')?.value||'';return !from||!to||from<=to}
function dateFiltered(rows,table=''){return rows.filter(r=>dateOK(r,table))}
function todayBD(){return tzDate(new Date())}
function dateAgo(days){const d=new Date();d.setUTCDate(d.getUTCDate()-days);return tzDate(d)}
function setDatePreset(choice){
 const t=todayBD();
 $('dateBasis').value='created';
 $('dateTo').value=choice==='all'?'':t;
 $('dateFrom').value=choice==='all'?'':choice==='today'?t:dateAgo(Number(choice)-1);
 document.querySelectorAll('[data-range]').forEach(b=>b.classList.toggle('on',b.dataset.range===choice));
 render();
}
function actorFor(entity,id,fallback){
 const item=audit.find(a=>a.entity===entity&&a.record_id===String(id));
 return item?{name:item.actor_email,date:item.created_at}:{name:fallback?.updated_by||'Not tracked',date:fallback?.updated_at||fallback?.reviewed_at||fallback?.created_at};
}
function metaLabel(entity,record,id=record?.id){
 const m=actorFor(entity,id,record);
 return '<div class="meta-stack"><b>'+esc(m.name)+'</b><div>'+fmtDate(m.date)+'</div></div>';
}
function auditFields(a){const changes=a.changes||{};return Object.keys(changes).join(', ')||'Metadata update'}
function exportCSV(filename,columns,rows){
 const cell=v=>'"'+String(v??'').replace(/^[=+\-@\t\r]/,"'$&").replace(/"/g,'""')+'"';
 const csv=[columns.join(','),...rows.map(row=>columns.map(k=>cell(row[k])).join(','))].join('\r\n');
 const url=URL.createObjectURL(new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function filteredAudit(){
 const entity=$('auditEntity')?.value||'',action=$('auditAction')?.value||'',term=($('auditSearch')?.value||'').toLowerCase().trim();
 return dateFiltered(audit,'audit').filter(a=>(!entity||a.entity===entity)&&(!action||a.action===action)&&(!term||(a.actor_email+' '+a.record_label+' '+a.record_id+' '+a.entity).toLowerCase().includes(term)));
}
function renderAudit(){
 if(!roleCan('owner','manager'))return;
 const rows=filteredAudit();
 $('auditCount').textContent=rows.length+' matching changes (latest 1,000 audited events loaded).';
 $('auditRows').innerHTML=rows.map(a=>'<tr class="audit-row"><td>'+fmtDate(a.created_at)+'</td><td><span class="actor">'+esc(a.actor_email)+'</span><div class="muted">'+esc(a.actor_role)+'</div></td><td>'+esc(a.entity.replace(/^sh_/,''))+'</td><td><span class="pill">'+esc(a.action)+'</span></td><td>'+esc(a.record_label)+'<div class="muted">'+esc(a.record_id.slice(0,8))+'</div></td><td><div class="changed-list">'+esc(auditFields(a))+'</div><button class="btn small" data-audit-details="'+a.id+'" type="button">View changes</button></td></tr>').join('')||'<tr><td colspan="6">No activity matches the filters.</td></tr>';
}
function openAuditDetails(id){
 if(!roleCan('owner','manager'))return;
 const row=audit.find(a=>String(a.id)===String(id));if(!row)return;
 const entries=Object.entries(row.changes||{});
 drawer('Change Details · '+row.entity.replace(/^sh_/,''),'<p class="muted">Record: '+esc(row.record_label)+'<br>Updated by: '+esc(row.actor_email)+' · '+esc(row.actor_role)+'<br>When: '+fmtDate(row.created_at)+'</p><div class="scroll"><table><thead><tr><th>Field</th><th>Before</th><th>After</th></tr></thead><tbody>'+entries.map(([field,d])=>'<tr><td>'+esc(field)+'</td><td>'+esc(JSON.stringify(d?.before??'—'))+'</td><td>'+esc(JSON.stringify(d?.after??'—'))+'</td></tr>').join('')+'</tbody></table></div>');
}
async function loadAudit(){
 if(!roleCan('owner','manager')){audit=[];return}
 const response=await db.from('sh_audit_log').select('id,created_at,entity,record_id,record_label,action,actor_email,actor_role,changes').order('created_at',{ascending:false}).limit(1000);
 if(response.error)throw response.error;audit=response.data||[];
}
async function loginSend(){
 const email=$('email').value.trim().toLowerCase();
 if(!/^\S+@\S+\.\S+$/.test(email))return notice('loginMsg','Enter a valid email.',true);
 // Always display the OTP form: an earlier code may still be valid even if
 // the SMTP provider refuses another email due to rate limits.
 show('codeWrap',true);
 $('sendOtp').disabled=true;
 notice('loginMsg','Requesting a secure sign-in email…');
 try{
   const response=await fetch(SUPABASE_URL+'/functions/v1/shopyhat-auth-request',{
     method:'POST',
     headers:{'content-type':'application/json','apikey':SUPABASE_PUBLISHABLE_KEY},
     body:JSON.stringify({email})
   });
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Email sign-in request failed');
   notice('loginMsg','Check inbox/spam for the code or one-time link. If you already have a valid code, enter it below.');
 }catch(e){
   notice('loginMsg',(e.message||'Email request failed')+' You can still try a previously received, unexpired code below.',true);
 }finally{$('sendOtp').disabled=false}
}
async function loginVerify(){const email=$('email').value.trim().toLowerCase(),token=$('otp').value.trim();if(!/^\d{6,8}$/.test(token))return notice('loginMsg','Enter the verification code.',true);
 $('verifyOtp').disabled=true;try{const r=await db.auth.verifyOtp({email,token,type:'email'});if(r.error)throw r.error;await boot()}
 catch(e){notice('loginMsg',e.message,true)}finally{$('verifyOtp').disabled=false}}
// A confirmation link may return with a session in the URL. Supabase-js
// processes that session automatically; boot checks it before showing Login.
async function boot(){const {data:{user},error}=await db.auth.getUser();
 if(error||!user){show('login',true);show('dashboard',false);show('logout',false);return}
 const r=await db.from('sh_staff').select('*').eq('email',(user.email||'').toLowerCase()).maybeSingle();
 if(r.error||!r.data?.active){await db.auth.signOut();show('login',true);show('dashboard',false);show('logout',false);return notice('loginMsg','This account is not an active SHOPYHAT staff member. Ask the owner to grant access.',true)}
 actor=user;role=r.data.role;$('profile').textContent=(r.data.display_name||user.email)+' · '+role;
 show('login',false);show('dashboard',true);show('logout',true);show('usersTab',role==='owner');show('addStaff',role==='owner');show('activityTab',roleCan('owner','manager'));show('insightsTab',roleCan('owner','manager'));show('brandTab',roleCan('owner','manager'));show('catalogTab',roleCan('owner','manager'));experience.mount();promos.mount();resellers.mount();show('experienceTab',roleCan('owner','manager'));show('promoTab',roleCan('owner','manager'));show('resellerTab',roleCan('owner','manager'));if(roleCan('owner','manager')){experience.reload();promos.reload();resellers.reload();}
 show('newProduct',roleCan('owner','manager'));show('bulkProducts',roleCan('owner','manager'));show('newOrder',roleCan('owner','manager','operator'));
 await refresh()}
async function refresh(){notice('appMsg','Loading live data…');
 const names=['Products','Variants','Product images','Orders','Order items','Payments','Staff','Reviews','Support cases','Case media','Case updates','Case replies','Website statistics','Review media'];
 const requests=[query('sh_products'),query('sh_variants'),query('sh_product_images'),query('sh_orders'),query('sh_order_items'),query('sh_payments'),query('sh_staff'),query('sh_reviews'),query('sh_customer_cases'),query('sh_case_media'),query('sh_case_updates'),query('sh_case_replies'),queryTraffic(),query('sh_review_media')];
 const settled=await Promise.allSettled(requests),failed=[];
 const current=[products,variants,images,orders,orderItems,payments,staff,reviews,cases,caseMedia,caseUpdates,caseReplies,dailyStats,reviewMedia];
 const values=settled.map((result,i)=>{if(result.status==='fulfilled')return result.value;failed.push(names[i]+': '+String(result.reason?.message||result.reason||'Request failed'));return current[i]});
 // Never present a failed product fetch as a genuinely empty catalogue.
 if(settled[0].status==='rejected')return notice('appMsg','Unable to load Products: '+failed[0],true);
 [products,variants,images,orders,orderItems,payments,staff,reviews,cases,caseMedia,caseUpdates,caseReplies,dailyStats,reviewMedia]=values;
 orders=orders.slice().sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
 try{await loadAudit()}catch(e){failed.push('Audit log: '+e.message);console.warn('Audit log not loaded:',e.message)}
 if(roleCan('owner','manager')){
  try{await branding.reload()}catch(e){failed.push('Branding: '+e.message)}
  try{await catalog.reload()}catch(e){failed.push('Categories: '+e.message)}
 }
 if(roleCan('owner','manager')){try{const r=await db.rpc('sh_admin_archive_health');archiveHealth=r.error?null:r.data}catch(e){archiveHealth=null}}else archiveHealth=null;
 if(roleCan('owner','manager')){try{const response=await db.from('sh_archive_requests').select('id,requested_at,requested_by,database_bytes,eligible_audit_rows,status').order('requested_at',{ascending:false}).limit(20);archiveRequests=response.error?[]:(response.data||[])}catch(e){archiveRequests=[]}}else archiveRequests=[];
 $('kProducts').textContent=products.length;$('kActive').textContent=products.filter(x=>x.status==='active').length;
 $('kOrders').textContent=settled[3].status==='fulfilled'?orders.length:'—';
 $('kPending').textContent=settled[3].status==='fulfilled'?orders.filter(x=>x.status==='Pending').length:'—';
 try{render()}catch(e){failed.push('Dashboard display: '+e.message);console.error('Admin render failed',e)}
 if(failed.length){console.warn('Partial Admin data load',failed);notice('appMsg','Partial data loaded. '+failed.join(' | '),true)}
 else notice('appMsg','Last refreshed '+new Date().toLocaleTimeString('en-BD'));
}
function showPage(page){if(['activity','insights','brand','catalog','experience','promos','resellers'].includes(page)&&!roleCan('owner','manager'))return;activePage=page;for(const n of ['products','orders','payments','users','activity','reviews','cases','insights','brand','catalog','experience','promos','resellers'])show('page-'+n,page===n);document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page))}
window.SHOPYHAT_SHOW_PAGE=showPage;
function cover(product){const gallery=images.filter(i=>i.product_id===product.id);const hosted=url=>String(url||'').includes('/storage/v1/object/public/shopyhat-products/');
 const base=gallery.filter(i=>!i.variant_id);const preferred=base.find(i=>hosted(i.image_url))||base[0]||gallery.find(i=>hosted(i.image_url))||gallery[0];return preferred?.image_url||''}
function render(){
 if(!rangeValid()){notice('appMsg','From date must be on or before To date.',true);return;}
 const search=$('productSearch').value.toLowerCase().trim(),oq=$('orderSearch').value.toLowerCase().trim(),filter=$('statusFilter').value;
 const paymentMethodFilter=$('orderPaymentFilter')?.value||'',paymentStateFilter=$('orderPaymentState')?.value||'';
 const productCategoryFilter=$('productCategoryFilter').value,productSubcategoryFilter=$('productSubcategoryFilter').value;
 const filteredProducts=dateFiltered(products),filteredOrders=dateFiltered(orders);
 $('kProducts').textContent=filteredProducts.length;
 $('kActive').textContent=filteredProducts.filter(p=>p.status==='active').length;
 $('kOrders').textContent=filteredOrders.length;
 $('kPending').textContent=filteredOrders.filter(o=>o.status==='Pending').length;
 $('rangeSummary').textContent=($('dateFrom').value||'All dates')+' → '+($('dateTo').value||'Today / future')+' · '+($('dateBasis').value==='updated'?'Updated Date':'Created Date');
 $('productRows').innerHTML=dateFiltered(products).filter(p=>(!productCategoryFilter||p.category_id===productCategoryFilter)&&(!productSubcategoryFilter||p.subcategory_id===productSubcategoryFilter)&&(p.name+' '+p.legacy_id+' '+p.category).toLowerCase().includes(search)).map(p=>
 '<tr><td><div class="row" style="justify-content:flex-start">'+imgTag(cover(p),p.name)+'<div><b>'+esc(p.name)+'</b><div class="muted">#'+esc(p.legacy_id||p.id.slice(0,7))+' · '+esc(p.category)+(p.subcategory_id?' · '+esc(catalog.getCategories().find(c=>c.id===p.subcategory_id)?.name||'Subcategory'):'')+'</div></div></div></td><td>'+money(p.base_price)+'</td><td><span class="pill">'+esc(p.status)+'</span></td><td>'+variants.filter(v=>v.product_id===p.id).length+'</td><td>'+metaLabel('sh_products',p)+'</td><td><div class="tools"><button class="btn small" data-edit-product="'+p.id+'">Edit / Photos</button>'+(roleCan("owner","manager")?'<button type="button" class="btn small danger" data-delete-product="'+p.id+'">Delete</button>':'')+'</div></td></tr>').join('')||'<tr><td colspan="6">No products found</td></tr>';
 $('orderRows').innerHTML=dateFiltered(orders).filter(o=>(!filter||o.status===filter)&&(!paymentMethodFilter||String(o.payment_method||'').toLowerCase()===paymentMethodFilter)&&(!paymentStateFilter||String(o.payment_status||'').toLowerCase()===paymentStateFilter)&&(!oq||[o.order_number,o.customer_name,o.customer_phone].some(v=>String(v||'').toLowerCase().includes(oq)))).map(o=>
 '<tr><td>'+orderThumb(o)+'</td><td><b>'+esc(o.order_number)+'</b><div class="muted">'+fmtDate(o.created_at)+'</div></td><td>'+esc(o.customer_name)+'<div class="muted">'+esc(o.customer_phone)+'</div></td><td>'+money(o.total)+'</td><td><span class="pill">'+esc(o.status)+'</span></td><td>'+esc(o.payment_status)+'</td><td>'+metaLabel('sh_orders',o)+'</td><td><button class="btn small" data-edit-order="'+o.id+'">Process / Invoice</button></td></tr>').join('')||'<tr><td colspan="8">No matching orders</td></tr>';
 $('paymentRows').innerHTML=dateFiltered(payments).map(p=>'<tr><td>'+esc(orders.find(o=>o.id===p.order_id)?.order_number||'—')+'</td><td>'+esc(p.method)+'</td><td>'+esc(p.transaction_id)+'</td><td>'+money(p.amount)+'</td><td><span class="pill">'+esc(p.status)+'</span></td><td>'+metaLabel('sh_payments',p)+'</td><td>'+ (roleCan('owner','manager')?'<button class="btn small" data-review="'+p.id+'">Review</button>':'Read only')+'</td></tr>').join('')||'<tr><td colspan="7">No payment reviews</td></tr>';
 $('staffRows').innerHTML=dateFiltered(staff).map(x=>'<tr><td>'+esc(x.email)+'</td><td>'+esc(x.display_name)+'</td><td>'+esc(x.role)+'</td><td>'+ (x.active?'Active':'Disabled')+'</td><td>'+metaLabel('sh_staff',x,x.email)+'</td><td>'+(x.role==='owner'?'Protected':'<button class="btn small" data-edit-staff="'+esc(x.email)+'">Edit</button>')+'</td></tr>').join('')||'<tr><td colspan="6">No staff</td></tr>';
 renderAudit();renderReviews();renderCases();renderInsights();
}

function renderReviews(){
 const filter=$('reviewStatusFilter').value,rows=dateFiltered(reviews).filter(r=>!filter||r.status===filter).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
 $('reviewsRows').innerHTML=rows.map(r=>'<tr><td>'+fmtDate(r.created_at)+'</td><td>'+esc(products.find(p=>p.id===r.product_id)?.name||'Deleted product')+'</td><td>'+esc(r.reviewer_name)+'<div class="muted">'+('★'.repeat(r.rating))+'</div></td><td><b>'+esc(r.title)+'</b><div class="muted">'+esc(r.review_text.slice(0,110))+'</div></td><td><span class="pill">'+esc(r.status==='Approved'?'Published':'Hidden')+'</span></td><td>'+esc(r.moderated_by||'—')+'<div class="muted">'+fmtDate(r.moderated_at)+'</div></td><td><button class="btn small" data-review-customer="'+r.id+'">Review</button></td></tr>').join('')||'<tr><td colspan="7">No customer reviews match your filters.</td></tr>';
}
function moderateReview(id){
 const r=reviews.find(r=>r.id===id);if(!r)return;
 const edit=roleCan('owner','manager');
 drawer('Moderate Customer Review',`<p class="muted">${esc(products.find(p=>p.id===r.product_id)?.name||'Product')} · ${fmtDate(r.created_at)}</p><h3>${esc(r.reviewer_name)} · ${'★'.repeat(r.rating)}</h3><h4>${esc(r.title)}</h4><p style="white-space:pre-wrap">${esc(r.review_text)}</p><div class="badge">Reviews publish automatically. Hide content containing personal information, offensive language, or unrelated claims.</div>
 <h3>Attached Review Photos</h3><div class="case-evidence" id="reviewPhotoEvidence"><p class="muted">Loading private review photos…</p></div>
 <form id="reviewModeration"><label>Visibility</label><select name="status" ${edit?'':'disabled'}><option value="Approved" ${r.status==='Approved'?'selected':''}>Published / Unhide</option><option value="Rejected" ${r.status!=='Approved'?'selected':''}>Hidden / Hide</option></select>
 <label>Public Staff Response (optional)</label><textarea name="staff_response" maxlength="1000" ${edit?'':'readonly'}>${esc(r.staff_response||'')}</textarea>
 <div class="editor-actions"><button type="button" class="btn" id="backFromReview">← Back to Reviews</button><button class="btn primary" ${edit?'':'disabled'} type="submit">Save Visibility</button></div></form>`);
 const media=reviewMedia.filter(m=>m.review_id===id),el=$('reviewPhotoEvidence');
 if(!media.length)el.innerHTML='<p class="muted">No photo attached.</p>';
 else{el.innerHTML='';(async()=>{
   for(const m of media){
     const file=await db.storage.from('shopyhat-review-photos').createSignedUrl(m.storage_path,300);
     if(file.error){el.insertAdjacentHTML('beforeend','<span class="muted">Photo unavailable.</span>');continue}
     const a=document.createElement('a');a.href=file.data.signedUrl;a.target='_blank';a.rel='noopener noreferrer';
     const img=document.createElement('img');img.src=file.data.signedUrl;img.alt='Customer review photo';a.append(img);el.append(a);
   }
 })().catch(err=>console.warn('Review photo preview:',err.message))}
 $('backFromReview').onclick=closeDrawer;
 $('reviewModeration').onsubmit=async e=>{e.preventDefault();if(!edit)return;const f=formData('reviewModeration');
 const res=await db.from('sh_reviews').update({status:f.status,staff_response:String(f.staff_response||'').trim()}).eq('id',id);
 if(res.error)return notice('drawerMsg',res.error.message,true);
 await refresh();closeDrawer();notice('appMsg','Review visibility saved.')};
}
function renderCases(){
 const status=$('caseStatusFilter').value,priority=$('casePriorityFilter').value,search=$('caseSearch').value.trim().toLowerCase();
 const scoped=dateFiltered(cases),rows=scoped.filter(c=>(!status||c.status===status)&&(!priority||c.priority===priority)&&(!search||[c.case_number,c.customer_name,c.order_number,c.subject,c.category].some(v=>String(v||'').toLowerCase().includes(search)))).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
 $('cTotal').textContent=scoped.length;$('cOpen').textContent=scoped.filter(c=>!['Closed','Resolved'].includes(c.status)).length;
 $('cUrgent').textContent=scoped.filter(c=>['Urgent','High'].includes(c.priority)&&!['Closed','Resolved'].includes(c.status)).length;
 $('cWaiting').textContent=scoped.filter(c=>c.status==='Awaiting Customer').length;
 $('casesRows').innerHTML=rows.map(c=>'<tr><td><b>'+esc(c.case_number)+'</b><div class="muted">'+fmtDate(c.created_at)+'</div></td><td>'+esc(c.customer_name)+'<div class="muted">'+esc(c.order_number||'—')+'</div></td><td>'+esc(c.category)+'</td><td><span class="pill">'+esc(c.priority)+'</span></td><td><span class="pill">'+esc(c.status)+'</span></td><td>'+esc(c.assigned_to||'Unassigned')+'<div class="muted">'+fmtDate(c.updated_at)+'</div></td><td><button class="btn small" data-edit-case="'+c.id+'">Manage Case</button></td></tr>').join('')||'<tr><td colspan="7">No cases match your filters.</td></tr>';
}
async function manageCase(id){
 const c=cases.find(c=>c.id===id);if(!c)return;
 const edit=roleCan('owner','manager','operator');
 const media=caseMedia.filter(m=>m.case_id===id);
 const steps=caseUpdates.filter(u=>u.case_id===id).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));const replies=caseReplies.filter(r=>r.case_id===id).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
 drawer('Case '+c.case_number,`
 <div class="badge"><b>${esc(c.status)}</b> · Priority: ${esc(c.priority)}</div>
 <div class="split"><section><h3>Customer & Order</h3><p>${esc(c.customer_name)}<br>${esc(c.phone)}<br>${esc(c.contact_email||'—')}<br>Order: ${esc(c.order_number||'—')}</p></section><section><h3>Issue</h3><b>${esc(c.category)}</b><p><b>${esc(c.subject)}</b></p><p style="white-space:pre-wrap">${esc(c.description)}</p></section></div>
 <h3>Private Evidence</h3><div id="caseEvidence" class="case-evidence"><p class="muted">Loading secure attachments…</p></div>
 <p class="muted">Media remains private. Links are short-lived, accessible through authenticated staff permissions.</p>
 <h3>Resolve & Update</h3><form id="caseForm"><div class="fieldrow"><div><label>Case Status</label><select name="status" ${edit?'':'disabled'}>${['Submitted','Under Review','Investigating','Awaiting Customer','Resolution Proposed','Resolved','Closed','Reopened'].map(v=>'<option '+(c.status===v?'selected':'')+'>'+v+'</option>').join('')}</select></div><div><label>Priority</label><select name="priority" ${edit?'':'disabled'}>${['Low','Normal','High','Urgent'].map(v=>'<option '+(c.priority===v?'selected':'')+'>'+v+'</option>').join('')}</select></div></div>
 <label>Assigned To</label><select name="assigned_to" ${edit?'':'disabled'}><option value="">Unassigned</option>${staff.filter(v=>v.active&&v.role!=='viewer').map(v=>'<option value="'+esc(v.email)+'" '+(v.email===c.assigned_to?'selected':'')+'>'+esc(v.display_name||v.email)+'</option>').join('')}</select>
 <label>Latest Customer-Facing Feedback</label><textarea name="last_staff_feedback" maxlength="2500" ${edit?'':'readonly'} placeholder="Clear updates, next action, requested evidence, or resolution…">${esc(c.last_staff_feedback||'')}</textarea>
 <label>Final Resolution / Outcome</label><textarea name="resolution" maxlength="2500" ${edit?'':'readonly'} placeholder="How the issue was resolved…">${esc(c.resolution||'')}</textarea>
 <div class="editor-actions"><button type="button" class="btn" id="backFromCase">← Back to Cases</button><button class="btn primary" ${edit?'':'disabled'} type="submit">Save & Update Case</button></div></form>
 <div class="divider"></div><h3>Customer Follow-up Replies</h3><div class="case-timeline">${replies.map(r=>'<div class="case-entry"><b>Customer Reply</b> · '+fmtDate(r.created_at)+'<p style="white-space:pre-wrap">'+esc(r.message)+'</p></div>').join('')||'<p class="muted">No replies yet.</p>'}</div>
 <div class="divider"></div><h3>Resolution History</h3><div class="case-timeline">${steps.map(u=>'<div class="case-entry"><b>'+esc(u.status_to)+'</b> · '+fmtDate(u.created_at)+'<div class="muted">'+esc(u.actor_email)+'</div><div>'+esc(u.message)+'</div></div>').join('')||'<p class="muted">No history yet.</p>'}</div>`);
 $('backFromCase').onclick=()=>{closeDrawer();showPage('cases')};
 const attachments=$('caseEvidence');
 if(media.length===0)attachments.innerHTML='<span class="muted">No attachments provided.</span>';
 else{
  attachments.innerHTML='';
  for(const m of media){
   const result=await db.storage.from('shopyhat-case-evidence').createSignedUrl(m.storage_path,300);
   if(result.error){attachments.insertAdjacentHTML('beforeend','<span class="muted">Secure media unavailable.</span>');continue}
   const a=document.createElement('a');a.href=result.data.signedUrl;a.target='_blank';a.rel='noopener noreferrer';
   if(m.media_type.startsWith('image/')){const img=document.createElement('img');img.src=result.data.signedUrl;img.alt='Customer evidence';a.append(img)}else a.textContent='▶ View customer video';
   attachments.append(a);
  }
 }
 $('caseForm').onsubmit=async e=>{
  e.preventDefault();if(!edit)return;
  const f=formData('caseForm'),changes={status:f.status,priority:f.priority,assigned_to:f.assigned_to,resolution:String(f.resolution||'').trim(),last_staff_feedback:String(f.last_staff_feedback||'').trim()};
  if(['Resolved','Closed'].includes(changes.status)&&changes.resolution.length<10)return notice('drawerMsg','Provide at least 10 characters of final resolution before resolving or closing.',true);
  if(changes.status==='Closed'&&!['Resolved','Closed'].includes(c.status))return notice('drawerMsg','Set the case to Resolved and save before closing it.',true);
  if(changes.status==='Reopened'&&!['Resolved','Closed','Reopened'].includes(c.status))return notice('drawerMsg','Only a resolved or closed case can be reopened.',true);
  if(['Under Review','Investigating','Resolution Proposed','Resolved','Closed'].includes(changes.status)&&!changes.assigned_to)return notice('drawerMsg','Assign a staff member before processing this case.',true);
  if(changes.status==='Awaiting Customer'&&changes.last_staff_feedback.length<12)return notice('drawerMsg','Tell the customer what additional information is required.',true);
  const button=e.currentTarget.querySelector('button[type=submit]');button.disabled=true;
  try{
   const res=await db.from('sh_customer_cases').update(changes).eq('id',id).select('id').single();
   if(res.error)throw res.error;
   await refresh();await manageCase(id);notice('drawerMsg','Case update saved. Customer can track the latest feedback using their Case ID and phone.');
  }catch(err){button.disabled=false;notice('drawerMsg',err.message,true)}
 };
}
/* Business analytics: date-aware, based only on real orders and aggregated anonymous traffic. */
function insightRows(){
 const from=$('dateFrom').value,to=$('dateTo').value;
 const within=day=>(!from||day>=from)&&(!to||day<=to);
 return dailyStats.filter(r=>within(String(r.event_date).slice(0,10)));
}
function simpleBars(rows,id,key,label){
 const root=$(id);if(!root)return;
 if(!rows.length||rows.every(r=>Number(r[key]||0)===0)){root.innerHTML='<div class="business-empty">No data for this date range</div>';return}
 const top=Math.max(1,...rows.map(r=>Number(r[key]||0)));
 root.innerHTML=rows.slice(-21).map(r=>'<div class="business-bar" title="'+esc(label(r)+' · '+Number(r[key]||0))+'"><b>'+Number(r[key]||0).toLocaleString('en-BD')+'</b><span style="height:'+Math.max(4,Math.round(Number(r[key]||0)/top*82))+'px"></span><div class="bar-label">'+esc(label(r))+'</div></div>').join('');
}
function getInsights(){
 const os=dateFiltered(orders).filter(o=>o.status!=='Cancelled'),allOrders=dateFiltered(orders),ids=new Set(os.map(o=>o.id));
 const lines=orderItems.filter(i=>ids.has(i.order_id));
 const traffic=insightRows(),site=traffic.filter(r=>r.page_path==='_site');
 const visitors=site.reduce((n,r)=>n+Number(r.visitors||0),0);
 const views=site.reduce((n,r)=>n+Number(r.views||0),0);
 const total=os.reduce((n,o)=>n+Number(o.total||0),0);
 const paid=os.filter(o=>['verified - paid','verified','paid','payment received','collected - cod'].includes(String(o.payment_status||'').trim().toLowerCase())).reduce((n,o)=>n+Number(o.total||0),0);
 const activeReviews=dateFiltered(reviews),approved=activeReviews.filter(r=>r.status==='Approved');
 const activeCases=dateFiltered(cases),resolved=activeCases.filter(c=>['Resolved','Closed'].includes(c.status));
 const pendingPayments=dateFiltered(payments).filter(p=>!['Verified','Verified - Paid','Paid'].includes(String(p.status||''))&&p.status!=='Rejected');
 const units={};for(const i of lines){const key=i.product_id||i.product_name||'Unknown';const row=units[key]??={name:i.product_name||'Product',qty:0,value:0};row.qty+=Number(i.qty||0);row.value+=Number(i.line_total||0)}
 const pages={};for(const r of traffic.filter(r=>r.page_path!=='_site')){const row=pages[r.page_path]??={page:r.page_path,views:0,visitors:0};row.views+=Number(r.views||0);row.visitors+=Number(r.visitors||0)}
 const status={};for(const o of allOrders)status[o.status]=(status[o.status]||0)+1;
 return {orders:allOrders.length,visitors,views,paid,total,avg:os.length?total/os.length:0,pending:pendingPayments.length,
  conversion:visitors?allOrders.length/visitors*100:null,products:products.filter(p=>p.status==='active').length,
  rating:approved.length?approved.reduce((n,r)=>n+Number(r.rating||0),0)/approved.length:null,reviewCount:activeReviews.length,
  cases:activeCases.filter(c=>!['Closed','Resolved'].includes(c.status)).length,resolution:activeCases.length?resolved.length/activeCases.length*100:null,
  site,top:Object.values(units).sort((a,b)=>b.qty-a.qty).slice(0,10),pages:Object.values(pages).sort((a,b)=>b.views-a.views),status:Object.entries(status).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count)};
}
function renderInsights(){
 if(!roleCan('owner','manager'))return;
 const r=getInsights();
 $('biVisitors').textContent=r.visitors.toLocaleString('en-BD');
 $('biViews').textContent=r.views.toLocaleString('en-BD');
 $('biOrders').textContent=r.orders.toLocaleString('en-BD');
 $('biConversion').textContent=r.conversion===null?'—':r.conversion.toFixed(2)+'%';
 $('biGross').textContent=money(r.total);$('biPaid').textContent=money(r.paid);
 $('biAov').textContent=money(r.avg);$('biPendingPay').textContent=r.pending;
 $('biProducts').textContent=r.products;
 $('biRatings').textContent=r.reviewCount+(r.rating===null?' / —':' / '+r.rating.toFixed(1)+'★');
 $('biCases').textContent=r.cases;$('biResolved').textContent=r.resolution===null?'—':r.resolution.toFixed(1)+'%';
 simpleBars(r.site.sort((a,b)=>String(a.event_date).localeCompare(String(b.event_date))).map(x=>({label:String(x.event_date).slice(5),value:Number(x.views||0)})),'biTrafficChart','value',x=>x.label);
 simpleBars(r.status.map(x=>({label:x.name.replace('Ready to Ship','Ready'),value:x.count})),'biOrderMix','value',x=>x.label);
 $('biTopProducts').innerHTML=r.top.map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+x.qty+'</td><td>'+money(x.value)+'</td></tr>').join('')||'<tr><td colspan="3">No product sales in this period.</td></tr>';
 $('biPages').innerHTML=r.pages.map(x=>'<tr><td>'+esc(x.page)+'</td><td>'+x.views+'</td><td>'+x.visitors+'</td></tr>').join('')||'<tr><td colspan="3">No recorded traffic yet.</td></tr>';
 const h=archiveHealth;
 $('biArchiveHealth').textContent=h?'Database: '+(Number(h.database_bytes)/1024/1024).toFixed(1)+' MB · Files: '+(Number(h.storage_bytes||0)/1024/1024).toFixed(1)+' MB ('+Number(h.storage_files||0)+' files) · Audit threshold: '+(Number(h.threshold_bytes)/1024/1024).toFixed(0)+' MB · 6+ month audit rows: '+h.eligible_audit_rows+' · '+(h.needs_archive?'Verified archive required.':'Archive not required.')+' · Google Sheets auto-sync: '+(h.archive_configured?'Configured':'Inactive; setup required.'):'Capacity data unavailable (only Owner / Manager can view).';
 renderArchiveRequests();
}
function renderArchiveRequests(){
 if(!roleCan('owner','manager'))return;
 const rows=$('archiveRequestRows');if(!rows)return;
 rows.innerHTML=archiveRequests.map(r=>'<tr><td>'+fmtDate(r.requested_at)+'</td><td>'+esc(r.requested_by)+'</td><td>'+(Number(r.database_bytes)/1048576).toFixed(1)+' MB</td><td>'+Number(r.eligible_audit_rows).toLocaleString('en-BD')+'</td><td><span class="pill">'+esc(r.status)+'</span></td></tr>').join('')||'<tr><td colspan="5">No manual archive requests yet.</td></tr>';
}
async function generateArchiveRequest(){
 if(!roleCan('owner','manager'))return;
 const button=$('generateArchiveRequest'),reason=$('archiveReason').value.trim();
 button.disabled=true;notice('archiveRequestMsg','Checking capacity and generating an archive review request…');
 try{
  const res=await db.rpc('sh_request_archive_review',{p_reason:reason});
  if(res.error)throw res.error;
  const data=res.data||{};
  await refresh();
  notice('archiveRequestMsg',data.status==='Not Eligible'?'Request #'+data.id+' recorded — Not Eligible: database usage is below the threshold or there are no six-month-old audit records. No data was moved or deleted.':'Request #'+data.id+' registered for review. This does NOT delete data or initiate backup. Google Sheets verification and authorized archive setup are required.');
 }catch(e){notice('archiveRequestMsg','Archive request failed: '+e.message,true)}
 finally{button.disabled=false}
}
function exportInsightReport(){
 if(!roleCan('owner','manager'))return;
 const r=getInsights(),rows=[{metric:'Visitors (sum of daily uniques)',value:r.visitors},{metric:'Page Views',value:r.views},{metric:'Orders Placed',value:r.orders},{metric:'Conversion estimate %',value:r.conversion===null?'':r.conversion.toFixed(2)},{metric:'Order Value BDT',value:r.total},{metric:'Verified Paid Value BDT',value:r.paid},{metric:'AOV BDT',value:r.avg},{metric:'Open Cases',value:r.cases},{metric:'Review Count',value:r.reviewCount}];
 exportCSV('SHOPYHAT_Management_Report_'+todayBD()+'.csv',['metric','value'],rows);
}
function confirmProductDelete(id){
 if(!roleCan('owner','manager'))return;
 const p=products.find(x=>x.id===id);
 if(!p)return notice('appMsg','Product not found. Refresh the catalog.',true);
 const usedByOrders=orderItems.filter(item=>item.product_id===id).length;
 drawer('Delete Product — Confirmation',`
  <div class="badge" role="alert" style="background:#fff0ee;color:#9e281d;border:1px solid #f0b2ac;padding:13px">
   <b>⚠️ WARNING — Permanent deletion</b>
   <p style="margin:8px 0 0">You are about to permanently delete <strong>${esc(p.name)}</strong>.</p>
   <p style="margin:6px 0 0">All color variants and product gallery links will also be deleted. This cannot be undone.</p>
  </div>
  <p>${usedByOrders?'This product appears in '+usedByOrders+' order item(s). Existing order snapshots (name, quantity and price) remain for reporting; direct product links will be cleared.':'No existing order items currently reference this product.'}</p>
  <label for="confirmDeleteText">To confirm, type <strong>DELETE</strong></label>
  <input id="confirmDeleteText" autocomplete="off" placeholder="Type DELETE exactly" aria-label="Type DELETE to permanently delete product">
  <div class="tools" style="margin-top:17px">
   <button class="btn" type="button" id="cancelProductDelete">Cancel — Keep Product</button>
   <button class="btn danger" type="button" id="confirmProductDelete" disabled>Delete Permanently</button>
  </div>
 `);
 const input=$('confirmDeleteText'),button=$('confirmProductDelete');
 input.oninput=()=>{button.disabled=input.value.trim()!=='DELETE'};
 $('cancelProductDelete').onclick=closeDrawer;
 button.onclick=async()=>{
  if(input.value.trim()!=='DELETE')return;
  button.disabled=true;button.textContent='Deleting…';
  const relatedImages=images.filter(i=>i.product_id===id).map(i=>i.image_url);
  try{
   const result=await db.from('sh_products').delete().eq('id',id).select('id').single();
   if(result.error)throw result.error;
   if(!result.data)throw Error('Delete not confirmed. Product may already have been removed.');
   await refresh();
   closeDrawer();
   notice('appMsg','Product '+p.name+' was permanently deleted.');
   // Storage cleanup is best-effort and only for files owned by SHOPYHAT.
   const prefix=SUPABASE_URL+'/storage/v1/object/public/shopyhat-products/';
   const activeUrls=new Set(images.map(i=>i.image_url));
   const paths=[...new Set(relatedImages)].filter(url=>url.startsWith(prefix)&&!activeUrls.has(url)).map(url=>decodeURIComponent(url.slice(prefix.length).split('?')[0]));
   if(paths.length){
    const removed=await db.storage.from('shopyhat-products').remove(paths);
    if(removed.error)console.warn('Orphan image cleanup failed',removed.error.message);
   }
  }catch(err){
    notice('drawerMsg','Product not deleted: '+(err.message||'Please retry.'),true);
    button.disabled=false;button.textContent='Delete Permanently';
  }
 };
}
async function uploadProductFiles(productId,variantId,files){
 let count=0;
 const current=images.filter(i=>i.product_id===productId&&(i.variant_id||'')===(variantId||''));
 for(const file of files){
  if(file.size>4194304||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Photos must be JPG, PNG or WebP under 4 MB.');
  const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
  const path=productId+'/'+(variantId||'general')+'/'+crypto.randomUUID()+'.'+ext;
  const up=await db.storage.from('shopyhat-products').upload(path,file,{contentType:file.type,cacheControl:'3600',upsert:false});
  if(up.error)throw up.error;
  const image_url=db.storage.from('shopyhat-products').getPublicUrl(path).data.publicUrl;
  const ins=await db.from('sh_product_images').insert({product_id:productId,variant_id:variantId||null,image_url,sort_order:current.length+count});
  if(ins.error){await db.storage.from('shopyhat-products').remove([path]);throw ins.error}
  count++;
 }
 return count;
}
function editProduct(id){
 const p=products.find(x=>x.id===id)||{name:'',category:'Saree',base_price:0,old_price:null,description:'',details:'',sizes:[],status:'draft',is_new:false};
 const editable=roleCan('owner','manager');
 const variantList=variants.filter(x=>x.product_id===id);
 const group=images.filter(i=>i.product_id===id&&!i.variant_id);
 drawer(id?'Edit Product':'Add Product',`\n ${id?'<p class="audit-meta">'+metaLabel('sh_products',p)+'</p>':''}
 <form id="productForm"><label>Product name</label><input name="name" required minlength="3" value="${esc(p.name)}">
 <div class="fieldrow"><div><label>Legacy Category Label (auto-updates from selection)</label><input name="category" required value="${esc(p.category)}"></div><div><label>Status</label><select name="status">${['active','draft','hidden','sold_out'].map(v=>'<option '+(p.status===v?'selected':'')+'>'+v+'</option>').join('')}</select></div>
 <div><label>Price (BDT)</label><input name="base_price" type="number" min="0" step=".01" required value="${esc(p.base_price)}"></div><div><label>Previous price</label><input name="old_price" type="number" min="0" step=".01" value="${esc(p.old_price||'')}"></div></div>
 ${catalog.productPickerHTML(p)}
 <label>Sizes (comma separated)</label><input name="sizes" value="${esc((p.sizes||[]).join(', '))}"><label>Description</label><textarea name="description">${esc(p.description)}</textarea>
 <label>Product details (English)</label><textarea name="details">${esc(p.details)}</textarea>
 <div class="media-section" style="margin:14px 0">
  <div class="section-heading"><h3>বাংলা পণ্যের তথ্য / Bengali Product Content</h3><span class="step-number">OPTIONAL · BN</span></div>
  <p class="muted">Enter accurate Bengali translations here. English will remain the fallback if a Bengali field is empty.</p>
  <label for="productNameBn">পণ্যের নাম (বাংলা)</label><input id="productNameBn" lang="bn" name="name_bn" placeholder="বাংলায় পণ্যের নাম" value="${esc(p.name_bn||'')}">
  <label for="productDescBn">পণ্যের বিবরণ (বাংলা)</label><textarea id="productDescBn" lang="bn" name="description_bn" placeholder="বাংলায় সংক্ষিপ্ত বিবরণ">${esc(p.description_bn||'')}</textarea>
  <label for="productDetailsBn">পণ্যের বিস্তারিত (বাংলা)</label><textarea id="productDetailsBn" lang="bn" name="details_bn" placeholder="প্রতিটি তথ্য নতুন লাইনে লিখুন">${esc(p.details_bn||'')}</textarea>
 </div>
 <label><input type="checkbox" name="is_new" ${p.is_new?'checked':''} style="width:auto"> New Arrival</label>
 <div class="media-section">
 <div class="section-heading"><h3>Step 1 · Product Photos</h3><span class="step-number">PHOTO FIRST</span></div>
 <p class="muted">Choose JPG, PNG or WebP images (maximum 4 MB each). They upload when the product is saved.</p>
 <input id="productInitialFiles" type="file" accept="image/jpeg,image/png,image/webp" multiple>
 <div id="productInitialPreview" class="photo-upload-preview photo-preview-list"></div></div>
 <div class="editor-actions">
 <button type="button" class="btn" id="backFromProduct">← Back to Products</button>
 <button class="btn primary" ${editable?'':'disabled'} type="submit" data-save-mode="edit">Save Product & Photos</button>
 <button class="btn" ${editable?'':'disabled'} type="submit" data-save-mode="another">Save & Add Another</button>
 </div></form>
 ${id?`<div class="media-section">
 <div class="section-heading"><h3>Saved Product Photos</h3><button type="button" class="btn small" data-photos="${id}" data-variant="">Manage Photos</button></div>
 <div class="photos">${productPhotoTiles(group,p.name)}</div>
 <p class="muted">Use × to remove an image.</p></div>
 <div class="media-section"><div class="section-heading"><h3>Step 2 · Color Variants</h3><div class="tools"><button type="button" class="btn primary small" data-new-variant="${p.id}">＋ Add One Color</button><button type="button" class="btn small" data-bulk-variants="${p.id}">＋ Add Multiple Colors</button></div></div>
 ${variantList.map(v=>'<div class="variant-card"><div class="topline"><div><b>'+esc(v.color)+'</b> · '+esc(v.sku||'No SKU')+'<div class="muted">Stock: '+esc(v.stock??'Unlimited')+' · '+money(v.price??p.base_price)+'</div></div><button type="button" class="btn small" data-edit-variant="'+v.id+'">Edit Color / Photos</button></div><div class="photos">'+productPhotoTiles(images.filter(i=>i.variant_id===v.id),v.color)+'</div></div>').join('')||'<p class="muted">No colors yet. Choose a color to create a separate gallery.</p>'}
 </div>`:''}`);
 catalog.bindProductPicker();
 setupLocalPhotoPreview('productInitialFiles','productInitialPreview');
 $('backFromProduct').onclick=()=>{closeDrawer();showPage('products')};
 $('productForm').onsubmit=async e=>{e.preventDefault();if(!editable)return;const f=formData('productForm'),saveMode=e.submitter?.dataset?.saveMode||'edit';const payload={name:String(f.name).trim(),category:String(f.category).trim(),base_price:Number(f.base_price),old_price:f.old_price?Number(f.old_price):null,description:String(f.description||''),details:String(f.details||''),name_bn:String(f.name_bn||'').trim(),description_bn:String(f.description_bn||'').trim(),details_bn:String(f.details_bn||'').trim(),sizes:String(f.sizes||'').split(',').map(s=>s.trim()).filter(Boolean),status:f.status,is_new:!!f.is_new};
 try{Object.assign(payload,catalog.selectionPayload(f));
 const files=[...($('productInitialFiles')?.files||[])];
 const q=id?db.from('sh_products').update(payload).eq('id',id).select('id').single():db.from('sh_products').insert(payload).select('id').single();
 const r=await q;if(r.error)throw r.error;
 let uploaded=0;
 try{uploaded=await uploadProductFiles(r.data.id,null,files)}
 catch(uploadError){await refresh();editProduct(r.data.id);return notice('drawerMsg','Product saved, photo failed: '+uploadError.message,true)}
 await refresh();
 if(saveMode==='another'){editProduct(null);notice('drawerMsg','Saved successfully. Add the next product.')}
 else{editProduct(r.data.id);notice('drawerMsg','Product saved'+(uploaded?' · '+uploaded+' photos uploaded':'')+'. Choose / Add Color below.');}
 }catch(err){notice('drawerMsg',err.message,true)}};
}
function editVariant(id,productId){
 const v=variants.find(v=>v.id===id)||{product_id:productId,color:'',hex:'#888888',sku:'',price:null,stock:null,active:true};
 const p=products.find(p=>p.id===v.product_id);
 drawer('Color / Variant',`<p class="audit-meta">${id?metaLabel('sh_variants',v):'New variant'}</p><form id="variantForm"><div class="fieldrow"><div><label>Color name</label><input required name="color" value="${esc(v.color)}"></div><div><label>Color hex</label><input name="hex" type="color" value="${esc(/^#[a-f0-9]{6}$/i.test(v.hex||'')?v.hex:'#888888')}"></div>
 <div><label>Variant price (leave blank for product price)</label><input name="price" type="number" min="0" step=".01" value="${esc(v.price??'')}"></div><div><label>Stock (blank = unlimited)</label><input name="stock" type="number" min="0" step="1" value="${esc(v.stock??'')}"></div></div>
 <label>SKU</label><input name="sku" value="${esc(v.sku||'')}"><label><input name="active" type="checkbox" style="width:auto" ${v.active?'checked':''}> Variant enabled</label>
 <div class="editor-actions">
 <button type="button" class="btn" id="backFromVariant">← Back to Product</button>
 <button class="btn primary" type="submit" data-save-mode="edit">Save Color</button>
 <button class="btn" type="submit" data-save-mode="another">Save & Add Another Color</button>
 <button type="button" class="btn" id="openBulkVariants">＋ Add Multiple</button></div></form>
 ${id?'<div class="media-section"><div class="section-heading"><h3>Photos for '+esc(v.color)+'</h3><button type="button" class="btn small" data-photos="'+v.product_id+'" data-variant="'+id+'">＋ Manage Photos</button></div><div class="photos">'+productPhotoTiles(images.filter(i=>i.variant_id===id),v.color)+'</div></div>':''}
 <p class="muted">One color can have multiple photos. Black and Purple maintain separate galleries.</p>`);
 $('backFromVariant').onclick=()=>editProduct(v.product_id);
 $('openBulkVariants').onclick=()=>bulkVariantEditor(v.product_id);
 $('variantForm').onsubmit=async e=>{e.preventDefault();if(!roleCan('owner','manager'))return;const f=formData('variantForm'),saveMode=e.submitter?.dataset?.saveMode||'edit';
 const row={product_id:v.product_id,color:String(f.color).trim(),hex:String(f.hex),sku:String(f.sku||'').trim()||null,price:f.price?Number(f.price):null,stock:f.stock===''?null:Number(f.stock),active:!!f.active};
 try{const r=id?await db.from('sh_variants').update(row).eq('id',id).select('id').single():await db.from('sh_variants').insert(row).select('id').single();if(r.error)throw r.error;await refresh();if(saveMode==='another'){editVariant(null,v.product_id);notice('drawerMsg','Color saved. Add the next color.')}else{editVariant(r.data.id,v.product_id);notice('drawerMsg','Color saved.')} }catch(err){notice('drawerMsg',err.message,true)}};
}


function bulkProductEditor(){
 if(!roleCan('owner','manager'))return;
 drawer('Bulk Add Products',`<div class="badge">Add multiple draft products in one batch (up to 20). After saving, open each product to add photos, Bengali descriptions and color variants, then activate when ready.</div>
 <form id="bulkProductForm">${catalog.productPickerHTML({category_id:null,subcategory_id:null,brand_partner_id:null})}<div id="bulkProductRows"></div><div class="editor-actions"><button class="btn" id="addBulkProductRow" type="button">＋ Add Product Row</button><button class="btn" id="backFromBulkProducts" type="button">← Back to Products</button><button class="btn primary" id="bulkSaveProducts" type="submit">Save All Draft Products</button></div></form>`);
 catalog.bindProductPicker();
 const rows=$('bulkProductRows');
 const append=()=>{
  if(rows.children.length>=20)return notice('drawerMsg','Maximum 20 products in one batch.',true);
  const row=document.createElement('div');row.className='bulk-variant-row';
  row.innerHTML=`<div class="bulk-color-name"><label>Product Name *</label><input required name="name" minlength="3" maxlength="160" placeholder="Product name"></div>
   <div><label>Category *</label><input required name="category" maxlength="70" value="Saree"></div>
   <div><label>Price (BDT) *</label><input required name="price" type="number" min="1" step=".01"></div>
   <div><label>Old Price</label><input name="old_price" type="number" min="0" step=".01"></div>
   <div><label>Sizes</label><input name="sizes" placeholder="S, M, L"></div>
   <button class="btn small danger" type="button" data-bulk-product-remove>Remove</button>`;
  row.querySelector('[data-bulk-product-remove]').onclick=()=>{if(rows.children.length>1)row.remove()};
  rows.append(row);
 };
 $('addBulkProductRow').onclick=append;
 $('backFromBulkProducts').onclick=()=>{closeDrawer();showPage('products')};
 append();append();append();
 $('bulkProductForm').onsubmit=async e=>{
  e.preventDefault();const btn=$('bulkSaveProducts');btn.disabled=true;
  try{
   const taxonomy=catalog.selectionPayload(formData('bulkProductForm'));
   const root=catalog.getCategories().find(c=>c.id===taxonomy.category_id);
   const items=[...rows.children].map(el=>({
     name:el.querySelector('[name=name]').value.trim(),
     category:root?.name||el.querySelector('[name=category]').value.trim(),
     ...taxonomy,
     base_price:Number(el.querySelector('[name=price]').value),
     old_price:el.querySelector('[name=old_price]').value===''?null:Number(el.querySelector('[name=old_price]').value),
     sizes:el.querySelector('[name=sizes]').value.split(',').map(x=>x.trim()).filter(Boolean),
     description:'',details:'',status:'draft',is_new:false
   }));
   if(items.some(x=>x.name.length<3||x.category.length<2||!Number.isFinite(x.base_price)||x.base_price<=0||x.old_price!==null&&x.old_price<0))throw Error('Every product requires a name, category and valid price.');
   if(new Set(items.map(x=>x.name.toLowerCase())).size!==items.length)throw Error('Duplicate product names in the batch. Please use unique names.');
   const result=await db.from('sh_products').insert(items).select('id');
   if(result.error)throw result.error;
   await refresh();closeDrawer();showPage('products');notice('appMsg',result.data.length+' draft products added. Edit them to upload photos and colors.');
  }catch(err){btn.disabled=false;notice('drawerMsg',err.message,true)}
 };
}
function bulkVariantEditor(productId){
 if(!roleCan('owner','manager'))return;
 const p=products.find(p=>p.id===productId);if(!p)return;
 drawer('Add Multiple Colors — '+p.name,`<p class="muted">Add several color variants in one save. Each color can have its own price, stock, SKU and photos afterward. Names must be unique within this product.</p>
 <div class="badge">Step 1: Add colors → Step 2: Save all → Step 3: Manage photos per color.</div>
 <form id="bulkVariantForm"><div id="bulkVariantRows"></div>
 <div class="editor-actions"><button class="btn" type="button" id="bulkAddRow">＋ Add Color Row</button><button class="btn" type="button" id="bulkBack">← Back to Product</button><button type="submit" class="btn primary" id="bulkSave">Save All Colors</button></div></form>`);
 const rows=$('bulkVariantRows');
 const addRow=()=>{
  if(rows.children.length>=20)return notice('drawerMsg','Maximum 20 colors per batch.',true);
  const row=document.createElement('div');row.className='bulk-variant-row';row.innerHTML=`<div class="bulk-color-name"><label>Color Name</label><input name="bulkColor" maxlength="70" required placeholder="e.g. Purple"></div>
  <div><label>Color Code</label><input name="bulkHex" type="color" value="#888888"></div>
  <div><label>Price BDT</label><input name="bulkPrice" type="number" min="0" step=".01" placeholder="Base price"></div>
  <div><label>Stock</label><input name="bulkStock" type="number" min="0" step="1" placeholder="Unlimited"></div>
  <div><label>SKU</label><input name="bulkSku" maxlength="90" placeholder="Optional"></div>
  <button type="button" class="btn small danger" data-bulk-remove>Remove</button>`;
  row.querySelector('[data-bulk-remove]').onclick=()=>{if(rows.children.length>1)row.remove()};
  rows.append(row);
 };
 $('bulkAddRow').onclick=addRow;
 $('bulkBack').onclick=()=>editProduct(productId);
 addRow();addRow();addRow();
 $('bulkVariantForm').onsubmit=async e=>{
  e.preventDefault();const button=$('bulkSave');button.disabled=true;
  try{
   const data=[...rows.children].map(el=>({
     product_id:productId,color:el.querySelector('[name=bulkColor]').value.trim(),
     hex:el.querySelector('[name=bulkHex]').value,
     price:el.querySelector('[name=bulkPrice]').value===''?null:Number(el.querySelector('[name=bulkPrice]').value),
     stock:el.querySelector('[name=bulkStock]').value===''?null:Number(el.querySelector('[name=bulkStock]').value),
     sku:el.querySelector('[name=bulkSku]').value.trim()||null,active:true
   }));
   const names=data.map(x=>x.color.toLowerCase());
   if(data.some(x=>!x.color||x.color.length>70)||new Set(names).size!==names.length)throw Error('Each color must have a unique name.');
   const existing=new Set(variants.filter(v=>v.product_id===productId).map(v=>v.color.toLowerCase()));
   if(names.some(x=>existing.has(x)))throw Error('This product already has one of the color names. Edit it instead.');
   if(data.some(x=>x.stock!==null&&(!Number.isInteger(x.stock)||x.stock<0)))throw Error('Stock must be a non-negative whole number.');
   const result=await db.from('sh_variants').insert(data).select('id,color');
   if(result.error)throw result.error;
   await refresh();editProduct(productId);notice('drawerMsg',result.data.length+' colors added successfully. Open each color to add its photos.');
  }catch(err){button.disabled=false;notice('drawerMsg',err.message,true)}
 };
}
function editPhotos(productId,variantId){
 const product=products.find(x=>x.id===productId),variant=variants.find(x=>x.id===variantId);
 const selected=images.filter(i=>i.product_id===productId&&(i.variant_id||'')===(variantId||''));
 const heading=variant?variant.color+' Gallery':'General Product Gallery';
 drawer(heading,`<p class="muted">${esc(product?.name||'Product')} — upload JPG, PNG or WebP up to 4MB each, or add public image links.</p>
 <div class="photo-main-display-wrap">${selected.length?'<img id="photoHeroImage" class="photo-main-display" src="'+esc(imageUrl(selected[0].image_url))+'" alt="Selected product photo">':'<p class="muted">No photos yet. Select images below to add them.</p>'}</div>
 <div class="photos">${productPhotoTiles(selected,variant?.color||product?.name)}</div>
 <label>Upload Photos (multiple)</label><input id="photoFiles" type="file" accept="image/jpeg,image/png,image/webp" multiple>
 <div class="photo-upload-preview photo-preview-list" id="photoFilePreview"></div>
 <button class="btn primary" id="uploadPhotos" type="button">Upload Selected Photos</button>
 <div class="divider"></div><label>Add existing public URLs (one per line)</label><textarea id="photoUrls" placeholder="https://..."></textarea>
 <button class="btn" id="savePhotoUrls" type="button">Add Image URLs</button>`);
 setupLocalPhotoPreview('photoFiles','photoFilePreview');
 $('uploadPhotos').onclick=async()=>{
 const files=[...$('photoFiles').files];if(!files.length)return notice('drawerMsg','Select files first.',true);
 $('uploadPhotos').disabled=true;let done=0;
 try{done=await uploadProductFiles(productId,variantId,files);
 await refresh();editPhotos(productId,variantId);notice('drawerMsg',done+' photos uploaded.')}
 catch(e){notice('drawerMsg',e.message,true)}finally{if($('uploadPhotos'))$('uploadPhotos').disabled=false}
 };
 $('savePhotoUrls').onclick=async()=>{
 const urls=[...new Set($('photoUrls').value.split(/[\n,]+/).map(s=>s.trim()).filter(Boolean))];
 if(!urls.length||urls.some(x=>!/^https:\/\//i.test(x)))return notice('drawerMsg','Enter valid HTTPS image URLs.',true);
 const existing=new Set(selected.map(i=>i.image_url));
 try{for(const [k,url] of urls.filter(u=>!existing.has(u)).entries()){
 const r=await db.from('sh_product_images').insert({product_id:productId,variant_id:variantId||null,image_url:url,sort_order:selected.length+k});if(r.error)throw r.error}
 await refresh();editPhotos(productId,variantId);notice('drawerMsg','Photos added.')}
 catch(e){notice('drawerMsg',e.message,true)}};
}
async function deletePhoto(id){if(!roleCan('owner','manager'))return;if(!confirm(window.SHOPYHAT_I18N?.text('Remove this image from the product gallery?')||'Remove this image from the product gallery?'))return;const i=images.find(x=>x.id===id);if(!i)return;
 const r=await db.from('sh_product_images').delete().eq('id',id);if(r.error)return notice('drawerMsg',r.error.message,true);
 // Clean up Supabase-hosted files only when no other gallery references that URL.
 const base=SUPABASE_URL+'/storage/v1/object/public/shopyhat-products/';
 if(i.image_url.startsWith(base)&&images.filter(x=>x.id!==id&&x.image_url===i.image_url).length===0){
  try{const storagePath=decodeURIComponent(i.image_url.slice(base.length).split('?')[0]);await db.storage.from('shopyhat-products').remove([storagePath])}
  catch(e){console.warn('Storage cleanup unavailable',e)}
 }
 await refresh();editPhotos(i.product_id,i.variant_id||'');notice('drawerMsg','Image removed from gallery.')}
async function editOrder(id){
 const o=orders.find(o=>o.id===id);if(!o)return;
 drawer('Order '+o.order_number,'<p>Loading order items…</p>');
 try{
 const [items,history,deliveryConfig,mailStatus]=await Promise.all([db.from('sh_order_items').select('*').eq('order_id',id),db.from('sh_order_history').select('*').eq('order_id',id).order('created_at',{ascending:false}),db.from('sh_settings').select('value').eq('key','shipping').maybeSingle(),db.rpc('sh_admin_order_mail_status',{p_order:id})]);
 if(items.error||history.error)throw items.error||history.error;
 const editable=roleCan('owner','manager','operator'),deliveryEditable=editable&&['Pending','Confirmed','Processing'].includes(o.status);
 $('drawerBody').innerHTML=`<div class="split"><section><h3>Customer</h3><b>${esc(o.customer_name)}</b><p>${esc(o.customer_phone)}<br>${esc(o.address)}<br>${esc(o.zone)}</p></section>
 <section><h3>Payment</h3><p>${esc(o.payment_method)}<br>${esc(o.payment_status)}<br>Transaction: ${esc(o.transaction_id||'—')}<br>Sender last 4: ${esc(o.sender_last4||'—')}</p></section></div>
 ${deliveryEditable?'<details class="badge" style="margin:12px 0"><summary style="cursor:pointer;font-weight:700">Edit customer and delivery details</summary><form id="deliveryEditForm"><label>Customer name</label><input name="name" value="'+esc(o.customer_name)+'" required minlength="2" maxlength="120"><label>Customer mobile</label><input name="phone" inputmode="tel" value="'+esc(o.customer_phone)+'" required><label>Customer email (optional)</label><input name="email" type="email" maxlength="254" value="'+esc(o.customer_email||'')+'"><label>Delivery address</label><textarea name="address" required minlength="10" maxlength="400">'+esc(o.address)+'</textarea><label>Delivery zone</label><select name="zone" required><option value="">Select zone</option><option value="dhaka" '+(o.zone==='dhaka'?'selected':'')+'>Inside Dhaka</option><option value="outside" '+(o.zone==='outside'?'selected':'')+'>Outside Dhaka</option></select><p id="deliveryEstimate" class="muted" aria-live="polite"></p><button type="submit" class="btn primary">Save customer details</button><p id="deliveryStatus" role="status" aria-live="polite"></p></form></details>':(editable?'<p class="muted">Customer details are locked once the order is Ready to Ship.</p>':'<p class="muted">Only authorized staff can edit customer details.</p>')}
 <h3>Items</h3>${items.data.map(i=>'<div class="order-item-row"><div class="order-item-info">'+(orderItemImage(i)?imgTag(orderItemImage(i),i.product_name):'<span class="order-item-placeholder"></span>')+'<div><b>'+esc(i.product_name)+'</b><div class="muted">'+esc(i.color)+' · '+esc(i.size)+' · '+esc(i.sku)+'</div></div></div><b>'+i.qty+' × '+money(i.unit_price)+'</b></div>').join('')}
 <div class="badge">Subtotal ${money(o.subtotal)} − Discount ${money(o.discount)} + Delivery ${money(o.shipping)} = <b>${money(o.total)}</b></div>
 <form id="orderForm"><div class="fieldrow"><div><label>Order Status</label><select name="status">${['Pending','Confirmed','Processing','Ready to Ship','Shipped','Delivered','Cancelled','Return Requested','Returned'].map(v=>'<option '+(v===o.status?'selected':'')+'>'+v+'</option>').join('')}</select></div>
 <div><label>Courier</label><input name="courier" value="${esc(o.courier)}"></div><div><label>Tracking ID</label><input name="tracking_id" value="${esc(o.tracking_id)}"></div><div><label>Internal Note</label><textarea name="internal_note">${esc(o.internal_note)}</textarea></div></div>
 <button class="btn primary" ${editable?'':'disabled'} type="submit">Save Order Changes</button>
 <button class="btn" id="printInvoice" type="button">Print Invoice</button>
  ${editable&&roleCan('owner','manager')&&o.payment_method==='COD'&&o.status==='Delivered'&&o.payment_status!=='Collected - COD'?'<button class="btn" id="markCodCollected" type="button">Confirm COD Collection</button>':''}</form>
 <div class="divider"></div><h3>Email updates</h3><p class="muted">${mailStatus.error?'Email status unavailable.':(mailStatus.data||[]).map(m=>esc(m.event_type==='order_confirmed'?'Order confirmation':'Payment confirmation')+': '+esc(m.state==='sent'?'Accepted by email provider':m.state==='uncertain'?'Needs delivery review':m.state)+(m.sent_at?' · '+fmtDate(m.sent_at):'')+(m.error_code?' · '+esc(m.error_code):'')+(m.state==='failed'&&roleCan('owner','manager')?' <button type="button" class="btn small" data-mail-retry="'+esc(m.id)+'">Retry</button>':'')).join('<br>')||'No confirmation emails recorded. An email address is required.'}</p><h3>Activity History</h3><p class="muted">${(history.data||[]).map(h=>esc(h.action)+' · '+esc(h.actor||'system')+' · '+fmtDate(h.created_at)).join('<br>')||'No history yet'}</p>`;
 if(deliveryEditable){
  const df=$('deliveryEditForm'),status=$('deliveryStatus'),rate=deliveryConfig.data?.value||{};
  const preview=()=>{const zone=df.elements.zone.value,configured=rate[zone],fee=zone===o.zone?Number(o.shipping):configured===undefined||configured===null?null:Number(configured);$('deliveryEstimate').textContent=fee!==null&&Number.isFinite(fee)?'Delivery '+money(fee)+' · Updated order total '+money(Number(o.subtotal)-Number(o.discount)+fee):'Select a zone to calculate delivery.';};
  df.elements.zone.onchange=preview;preview();
  df.onsubmit=async e=>{e.preventDefault();const f=new FormData(df);let phone=String(f.get('phone')||'').trim().replace(/[\s-]/g,'');if(phone.startsWith('+88'))phone=phone.slice(3);else if(phone.startsWith('88'))phone=phone.slice(2);
   if(!/^01[3-9][0-9]{8}$/.test(phone)){status.textContent='Enter a valid Bangladesh mobile number.';return}
   if(String(f.get('zone'))!==o.zone&&!confirm(window.SHOPYHAT_I18N?.text('Changing the delivery zone may change the delivery charge and order total. Continue?')||'Changing the delivery zone may change the delivery charge and order total. Continue?'))return;
   const button=df.querySelector('[type=submit]');button.disabled=true;status.textContent='Saving…';
   try{const {data,error}=await db.rpc('sh_admin_update_order_delivery_v2',{p_order:o.id,p_name:String(f.get('name')||'').trim(),p_phone:phone,p_address:String(f.get('address')||'').trim(),p_zone:String(f.get('zone')||''),p_email:String(f.get('email')||'').trim()});if(error)throw error;await refresh();await editOrder(o.id);notice('drawerMsg','Customer and delivery details updated. Order total: '+money(data.total)+'.');}
   catch(error){status.textContent=error.message||'Could not save customer details.'}finally{button.disabled=false}
  };
 }
 $('orderForm').onsubmit=async e=>{e.preventDefault();if(!editable)return;const f=formData('orderForm');
 if(f.status==='Cancelled'&&['Shipped','Delivered','Returned'].includes(o.status))return notice('drawerMsg','Shipped/delivered orders require a return/refund review rather than direct cancellation.',true);
  const changes={status:f.status,courier:f.courier,tracking_id:f.tracking_id,internal_note:f.internal_note,updated_at:new Date().toISOString()};
 const r=await db.from('sh_orders').update(changes).eq('id',id);if(r.error)return notice('drawerMsg',r.error.message,true);
 await refresh();editOrder(id);notice('drawerMsg','Order saved.')};
 document.querySelectorAll('#drawerBody [data-mail-retry]').forEach(button=>button.onclick=async()=>{
  if(!confirm(window.SHOPYHAT_I18N?.text('Retry the email rejected by the provider?')||'Retry the email rejected by the provider?'))return;
  button.disabled=true;
  try{const {error}=await db.rpc('sh_admin_retry_order_mail',{p_id:button.dataset.mailRetry});if(error)throw error;await editOrder(id);notice('drawerMsg','Email queued for retry.');}
  catch(error){button.disabled=false;notice('drawerMsg',error.message||'Could not retry email.',true)}
 });
 $('printInvoice').onclick=()=>printInvoice(o,items.data);
  const codButton=$('markCodCollected');
  if(codButton)codButton.onclick=async()=>{
   if(!confirm(window.SHOPYHAT_I18N?.text('Confirm that the courier has handed over the actual COD payment for this delivered order?')||'Confirm that the courier has handed over the actual COD payment for this delivered order?'))return;
   codButton.disabled=true;
   try{
    const r=await db.from('sh_orders').update({payment_status:'Collected - COD'}).eq('id',o.id).eq('status','Delivered').eq('payment_method','COD').select('id');
    if(r.error)throw r.error;
    if(!r.data?.length)throw Error('Order changed before collection confirmation. Refresh first.');
    await refresh();await editOrder(o.id);notice('drawerMsg','COD payment collection confirmed and included in verified revenue.');
   }catch(e){notice('drawerMsg',e.message||'Could not mark COD as collected.',true)}
   finally{codButton.disabled=false}
  };

 }catch(e){notice('drawerMsg',e.message,true)}
}
function printInvoice(o,items){const w=window.open('','_blank','width=840,height=900');if(!w)return notice('drawerMsg','Allow pop-ups to print the invoice.',true);
 const html=`<!doctype html><title>Invoice ${esc(o.order_number)}</title><style>body{font:14px Arial;padding:32px;color:#222}h1{margin:0}table{width:100%;border-collapse:collapse;margin:25px 0}td,th{padding:10px;border-bottom:1px solid #ccc;text-align:left}.invoice-photo{width:56px;height:56px;object-fit:cover;border-radius:6px;background:#f7f2ec}.total{text-align:right;font-size:21px;font-weight:bold}</style><h1>SHOPYHAT</h1><p>Your Choice, Our Gift. · Since 2020</p><hr><h2>Invoice ${esc(o.order_number)}</h2><p>${fmtDate(o.created_at)}</p><b>Delivery to</b><p>${esc(o.customer_name)} · ${esc(o.customer_phone)}<br>${esc(o.address)}</p><table><tr><th>Photo</th><th>Product</th><th>Variant</th><th>Qty</th><th>Amount</th></tr>${items.map(i=>'<tr><td>'+(orderItemImage(i)?'<img class="invoice-photo" src="'+esc(imageUrl(orderItemImage(i)))+'" alt="'+esc(i.product_name)+'" referrerpolicy="no-referrer">':'—')+'</td><td>'+esc(i.product_name)+'</td><td>'+esc(i.color)+' / '+esc(i.size)+'</td><td>'+i.qty+'</td><td>'+money(i.line_total)+'</td></tr>').join('')}</table><p>Subtotal: ${money(o.subtotal)}<br>Discount: ${money(o.discount)}<br>Delivery: ${money(o.shipping)}</p><p class="total">Total ${money(o.total)}</p><p>Payment: ${esc(o.payment_method)} — ${esc(o.payment_status)}<br>Order status: ${esc(o.status)}</p>`;
 w.document.write(html);w.document.close();
 const photos=[...w.document.images];const wait=photos.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true})}));
 Promise.race([Promise.all(wait),new Promise(resolve=>setTimeout(resolve,5000))]).then(()=>{if(!w.closed){w.focus();w.print()}});
}
function reviewPayment(id){
 if(!roleCan('owner','manager'))return;
 const p=payments.find(x=>x.id===id),o=orders.find(x=>x.id===p?.order_id);if(!p)return;
 drawer('Review Payment',`<p class="audit-meta">${metaLabel('sh_payments',p)}</p><p>Order: <b>${esc(o?.order_number||'—')}</b></p><p>Method: ${esc(p.method)} · ${money(p.amount)}<br>Transaction: <b>${esc(p.transaction_id)}</b><br>Sender last 4: ${esc(p.sender_last4)}</p>
 <p class="badge">Check the actual bKash/Nagad transaction history before marking a payment verified.</p>
 <form id="paymentForm"><label>Review Result</label><select name="status">${['Pending Verification','Review Required','Verified - Paid','Refund Pending','Refunded','Rejected'].map(x=>'<option '+(p.status===x?'selected':'')+'>'+x+'</option>').join('')}</select><button class="btn primary" type="submit">Save Review</button></form>`);
 $('paymentForm').onsubmit=async e=>{e.preventDefault();const status=formData('paymentForm').status;if(status==='Verified - Paid'&&!confirm(window.SHOPYHAT_I18N?.text('I checked the transaction in the payment provider account. Confirm verified?')||'I checked the transaction in the payment provider account. Confirm verified?'))return;
 const r=await db.from('sh_payments').update({status}).eq('id',id);
 if(r.error)return notice('drawerMsg',r.error.message,true);await refresh();closeDrawer()};
}
function editStaff(email){
 if(role!=='owner')return;const s=staff.find(s=>s.email===email)||{email:'',display_name:'',role:'viewer',active:true};if(s.role==='owner')return;
 drawer('Staff Access',`<p class="audit-meta">${email?metaLabel('sh_staff',s,email):'New staff account'}</p><form id="staffForm"><label>Email</label><input type="email" required name="email" value="${esc(s.email)}" ${email?'readonly':''}><label>Display Name</label><input name="display_name" value="${esc(s.display_name)}">
 <div class="fieldrow"><div><label>Role</label><select name="role">${['manager','operator','viewer'].map(v=>'<option '+(s.role===v?'selected':'')+'>'+v+'</option>').join('')}</select></div><div><label>Status</label><select name="active"><option value="true" ${s.active?'selected':''}>Active</option><option value="false" ${!s.active?'selected':''}>Disabled</option></select></div></div>
 <button class="btn primary" type="submit">Save Staff Access</button></form>`);
 $('staffForm').onsubmit=async e=>{e.preventDefault();const f=formData('staffForm'),row={email:String(f.email).toLowerCase().trim(),display_name:String(f.display_name||''),role:f.role,active:f.active==='true'};
 const r=await db.from('sh_staff').upsert(row,{onConflict:'email'});
 if(r.error)return notice('drawerMsg',r.error.message,true);await refresh();closeDrawer()};
}
function addOrder(){if(!roleCan('owner','manager','operator'))return;
 const available=variants.filter(v=>v.active&&products.find(p=>p.id===v.product_id)?.status==='active'&&(v.stock===null||v.stock>0));
 drawer('Create Order',`<p class="muted">Manual COD order. Amount and stock are verified by the backend.</p><form id="newOrderForm">
 <label>Product / Color</label><select name="variant_id" required>${available.map(v=>'<option value="'+esc(v.id)+'">'+esc(products.find(p=>p.id===v.product_id)?.name)+' · '+esc(v.color)+'</option>').join('')}</select>
 <div class="fieldrow"><div><label>Qty</label><input name="qty" type="number" required min="1" max="20" value="1"></div><div><label>Size</label><input name="size" placeholder="Optional"></div></div>
 <label>Customer Name</label><input name="name" required minlength="2"><label>Phone (Bangladesh)</label><input name="phone" required placeholder="017XXXXXXXX"><label>Customer email (optional)</label><input name="email" type="email" maxlength="254"><label>Delivery Address</label><textarea name="address" required minlength="10"></textarea>
 <label>Delivery Zone</label><select name="zone"><option value="dhaka">Inside Dhaka</option><option value="outside">Outside Dhaka</option></select>
 <button class="btn primary" type="submit">Create Confirmed COD Order</button></form>`);
 $('newOrderForm').onsubmit=async e=>{e.preventDefault();const f=formData('newOrderForm'),btn=e.currentTarget.querySelector('button[type=submit]');btn.disabled=true;
 try{const {data:{session}}=await db.auth.getSession();const r=await fetch(CHECKOUT_URL,{method:'POST',
 headers:{'content-type':'application/json','apikey':SUPABASE_PUBLISHABLE_KEY,...(session?{'authorization':'Bearer '+session.access_token}:{})},
 body:JSON.stringify({request_id:crypto.randomUUID(),name:f.name,phone:f.phone,email:f.email,address:f.address,zone:f.zone,payment_method:'cod',
 items:[{variant_id:f.variant_id,qty:Number(f.qty),size:f.size||''}]})});const j=await r.json();if(!r.ok||!j.ok)throw Error(j.error||'Order not created');
 await refresh();closeDrawer();notice('appMsg','Created '+j.orderId);}
 catch(err){notice('drawerMsg',err.message,true)}finally{btn.disabled=false}};
}

function exportOrders(){
 const exportRows=dateFiltered(orders).filter(o=>{
 const q=($('orderSearch')?.value||'').toLowerCase().trim(),status=$('statusFilter')?.value||'',pay=$('orderPaymentFilter')?.value||'',payStatus=$('orderPaymentState')?.value||'';
 return (!status||o.status===status)&&(!pay||String(o.payment_method||'').toLowerCase()===pay)&&(!payStatus||String(o.payment_status||'').toLowerCase()===payStatus)
  &&(!q||[o.order_number,o.customer_name,o.customer_phone].some(v=>String(v||'').toLowerCase().includes(q)));
 });if(!exportRows.length)return notice('appMsg','No orders match the selected date range.',true);
 const columns=['order_number','created_at','customer_name','customer_phone','address','zone','status','payment_method','payment_status','subtotal','discount','shipping','total','courier','tracking_id'];
 const cell=v=>'"'+String(v??'').replace(/^[=+\-@\t\r]/,"'$&").replace(/"/g,'""')+'"';
 const csv=[columns.join(','),...exportRows.map(o=>columns.map(k=>cell(o[k])).join(','))].join('\r\n');
 const blob=new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'});
 const u=URL.createObjectURL(blob);const a=document.createElement('a');
 a.href=u;a.download='SHOPYHAT_Orders_'+($('dateFrom').value||'all')+'_'+($('dateTo').value||todayBD())+'.csv';
 document.body.append(a);a.click();a.remove();URL.revokeObjectURL(u);
}
$('exportOrders').onclick=exportOrders;
$('exportInsight').onclick=exportInsightReport;
$('generateArchiveRequest').onclick=generateArchiveRequest;
$('exportAudit').onclick=()=>{if(!roleCan('owner','manager'))return;const rows=filteredAudit().map(a=>({...a,changes:JSON.stringify(a.changes||{})}));exportCSV('SHOPYHAT_Audit_'+todayBD()+'.csv',['created_at','actor_email','actor_role','entity','action','record_id','record_label','changes'],rows)};
for(const field of ['dateFrom','dateTo','dateBasis','auditEntity','auditAction','auditSearch','reviewStatusFilter','caseStatusFilter','casePriorityFilter','caseSearch']){const el=$(field);if(el)el.addEventListener(['auditSearch','caseSearch'].includes(field)?'input':'change',()=>{document.querySelectorAll('[data-range]').forEach(b=>b.classList.remove('on'));render()})}
document.querySelectorAll('[data-range]').forEach(b=>b.onclick=()=>setDatePreset(b.dataset.range));

$('sendOtp').onclick=loginSend;$('verifyOtp').onclick=loginVerify;
$('email').onkeydown=e=>{if(e.key==='Enter')loginSend()};$('otp').onkeydown=e=>{if(e.key==='Enter')loginVerify()};
$('logout').onclick=async()=>{await db.auth.signOut();location.reload()};
window.addEventListener('sh:reseller-order-created',()=>refresh());
$('refresh').onclick=()=>{refresh();resellers.refreshPending()};$('closeDrawer').onclick=closeDrawer;
$('productSearch').oninput=render;
$('productCategoryFilter').onchange=()=>{catalog.refreshProductFilterOptions();render()};
$('productSubcategoryFilter').onchange=render;$('orderSearch').oninput=render;$('statusFilter').onchange=render;$('orderPaymentFilter').onchange=render;$('orderPaymentState').onchange=render;
$('bulkProducts').onclick=bulkProductEditor;$('newProduct').onclick=()=>editProduct(null);$('addStaff').onclick=()=>editStaff(null);$('newOrder').onclick=addOrder;
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.addEventListener('keydown',e=>{
 if(e.key==='Escape')closeDrawer();
 if((e.key==='Enter'||e.key===' ')&&e.target?.hasAttribute('data-view-photo')){
  e.preventDefault();
  const hero=$('photoHeroImage');if(hero)hero.src=e.target.dataset.viewPhoto;
 }
});
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-bulk-variants],[data-review-customer],[data-edit-case],[data-audit-details],[data-edit-product],[data-delete-product],[data-new-variant],[data-edit-variant],[data-photos],[data-delete-photo],[data-view-photo],[data-edit-order],[data-review],[data-edit-staff]');
 if(!el)return;
 if(el.dataset.bulkVariants)bulkVariantEditor(el.dataset.bulkVariants);
 else if(el.dataset.reviewCustomer)moderateReview(el.dataset.reviewCustomer);
 else if(el.dataset.editCase)manageCase(el.dataset.editCase);
 else if(el.dataset.auditDetails)openAuditDetails(el.dataset.auditDetails);
 else if(el.dataset.editProduct)editProduct(el.dataset.editProduct);
 else if(el.dataset.deleteProduct)confirmProductDelete(el.dataset.deleteProduct);
 else if(el.dataset.newVariant)editVariant(null,el.dataset.newVariant);
 else if(el.dataset.editVariant)editVariant(el.dataset.editVariant);
 else if(el.hasAttribute('data-photos'))editPhotos(el.dataset.photos,el.dataset.variant||'');
 else if(el.dataset.deletePhoto)deletePhoto(el.dataset.deletePhoto);
 else if(el.dataset.viewPhoto){const hero=$('photoHeroImage');if(hero)hero.src=el.dataset.viewPhoto;}
 else if(el.dataset.editOrder)editOrder(el.dataset.editOrder);
 else if(el.dataset.review)reviewPayment(el.dataset.review);
 else if(el.dataset.editStaff)editStaff(el.dataset.editStaff);
});
db.auth.onAuthStateChange((_event,session)=>{if(_event==='SIGNED_OUT'){show('login',true);show('dashboard',false);show('logout',false)}});
boot().catch(e=>notice('loginMsg',e.message,true));

