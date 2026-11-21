import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.49.10';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,CHECKOUT_URL} from './config.js';
const db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>'৳'+Number(v||0).toLocaleString('en-BD',{maximumFractionDigits:2});
const fmtDate=v=>v?new Date(v).toLocaleString('en-BD'):'—';
const roleCan=(...r)=>r.includes(role);
const imageUrl=v=>{const s=String(v||'');const m=s.match(/drive\.google\.com\/file\/d\/([\w-]+)/)||s.match(/[?&]id=([\w-]+)/);return m&&s.includes('google.com')?'https://drive.google.com/thumbnail?id='+m[1]+'&sz=w1000':s};
let actor=null,role='',products=[],variants=[],images=[],orders=[],orderItems=[],payments=[],staff=[],activePage='products';
function notice(id,message,error=false){$(id).textContent=message;$(id).classList.toggle('error',!!error)}
function show(id,on){$(id).classList.toggle('hidden',!on)}
function drawer(title,html){$('drawerTitle').textContent=title;$('drawerBody').innerHTML=html;notice('drawerMsg','');show('overlay',true)}
function closeDrawer(){show('overlay',false)}
function formData(id){return Object.fromEntries(new FormData($(id)).entries())}
function imgTag(url,label='Product photo'){return url?'<img src="'+esc(imageUrl(url))+'" alt="'+esc(label)+'" loading="lazy" onerror="this.style.visibility=\'hidden\'">':''}

function orderThumb(o){
 const item=orderItems.find(i=>i.order_id===o.id && i.image_url);
 if(!item)return '<span class="order-thumb" aria-label="No image">—</span>';
 const src=esc(imageUrl(item.image_url)),title=esc(item.product_name);
 return '<span class="order-thumb" tabindex="0" aria-label="Preview '+title+'"><img src="'+src+'" alt="'+title+'" loading="lazy"><span class="image-popover" aria-hidden="true"><img src="'+src+'" alt=""></span></span>';
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
async function query(table,selection='*',limit=1000){const q=await db.from(table).select(selection).limit(limit);if(q.error)throw q.error;return q.data||[]}
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
 show('login',false);show('dashboard',true);show('logout',true);show('usersTab',role==='owner');show('addStaff',role==='owner');
 show('newProduct',roleCan('owner','manager'));show('newOrder',roleCan('owner','manager','operator'));
 await refresh()}
async function refresh(){notice('appMsg','Loading live data…');
 try{
 const [p,v,i,o,oi,pa,st]=await Promise.all([query('sh_products'),query('sh_variants'),query('sh_product_images'),query('sh_orders'),query('sh_order_items'),query('sh_payments'),query('sh_staff')]);
 products=p;variants=v;images=i;orders=o.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));orderItems=oi;payments=pa;staff=st;
 $('kProducts').textContent=p.length;$('kActive').textContent=p.filter(x=>x.status==='active').length;$('kOrders').textContent=o.length;$('kPending').textContent=o.filter(x=>x.status==='Pending').length;
 render();notice('appMsg','Last refreshed '+new Date().toLocaleTimeString('en-BD'))}
 catch(e){notice('appMsg',e.message,true)}}
function showPage(page){activePage=page;for(const n of ['products','orders','payments','users'])show('page-'+n,page===n);document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page))}
function cover(product){const base=images.find(i=>i.product_id===product.id&&!i.variant_id);if(base)return base.image_url;
 const v=variants.find(x=>x.product_id===product.id);return images.find(i=>i.variant_id===v?.id)?.image_url||''}
function render(){
 const search=$('productSearch').value.toLowerCase().trim(),oq=$('orderSearch').value.toLowerCase().trim(),filter=$('statusFilter').value;
 $('productRows').innerHTML=products.filter(p=>(p.name+' '+p.legacy_id+' '+p.category).toLowerCase().includes(search)).map(p=>
 '<tr><td><div class="row" style="justify-content:flex-start">'+imgTag(cover(p),p.name)+'<div><b>'+esc(p.name)+'</b><div class="muted">#'+esc(p.legacy_id||p.id.slice(0,7))+' · '+esc(p.category)+'</div></div></div></td><td>'+money(p.base_price)+'</td><td><span class="pill">'+esc(p.status)+'</span></td><td>'+variants.filter(v=>v.product_id===p.id).length+'</td><td><button class="btn small" data-edit-product="'+p.id+'">Edit / Photos</button></td></tr>').join('')||'<tr><td colspan="5">No products found</td></tr>';
 $('orderRows').innerHTML=orders.filter(o=>(!filter||o.status===filter)&&(!oq||[o.order_number,o.customer_name,o.customer_phone].some(v=>String(v||'').toLowerCase().includes(oq)))).map(o=>
 '<tr><td>'+orderThumb(o)+'</td><td><b>'+esc(o.order_number)+'</b><div class="muted">'+fmtDate(o.created_at)+'</div></td><td>'+esc(o.customer_name)+'<div class="muted">'+esc(o.customer_phone)+'</div></td><td>'+money(o.total)+'</td><td><span class="pill">'+esc(o.status)+'</span></td><td>'+esc(o.payment_status)+'</td><td><button class="btn small" data-edit-order="'+o.id+'">Process / Invoice</button></td></tr>').join('')||'<tr><td colspan="7">No matching orders</td></tr>';
 $('paymentRows').innerHTML=payments.map(p=>'<tr><td>'+esc(orders.find(o=>o.id===p.order_id)?.order_number||'—')+'</td><td>'+esc(p.method)+'</td><td>'+esc(p.transaction_id)+'</td><td>'+money(p.amount)+'</td><td><span class="pill">'+esc(p.status)+'</span></td><td>'+ (roleCan('owner','manager')?'<button class="btn small" data-review="'+p.id+'">Review</button>':'Read only')+'</td></tr>').join('')||'<tr><td colspan="6">No payment reviews</td></tr>';
 $('staffRows').innerHTML=staff.map(x=>'<tr><td>'+esc(x.email)+'</td><td>'+esc(x.display_name)+'</td><td>'+esc(x.role)+'</td><td>'+ (x.active?'Active':'Disabled')+'</td><td>'+(x.role==='owner'?'Protected':'<button class="btn small" data-edit-staff="'+esc(x.email)+'">Edit</button>')+'</td></tr>').join('')||'<tr><td colspan="5">No staff</td></tr>';
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
 drawer(id?'Edit Product':'Add Product',`
 <form id="productForm"><label>Product name</label><input name="name" required minlength="3" value="${esc(p.name)}">
 <div class="fieldrow"><div><label>Category</label><input name="category" required value="${esc(p.category)}"></div><div><label>Status</label><select name="status">${['active','draft','hidden','sold_out'].map(v=>'<option '+(p.status===v?'selected':'')+'>'+v+'</option>').join('')}</select></div>
 <div><label>Price (BDT)</label><input name="base_price" type="number" min="0" step=".01" required value="${esc(p.base_price)}"></div><div><label>Previous price</label><input name="old_price" type="number" min="0" step=".01" value="${esc(p.old_price||'')}"></div></div>
 <label>Sizes (comma separated)</label><input name="sizes" value="${esc((p.sizes||[]).join(', '))}"><label>Description</label><textarea name="description">${esc(p.description)}</textarea>
 <label>Product details</label><textarea name="details">${esc(p.details)}</textarea>
 <label><input type="checkbox" name="is_new" ${p.is_new?'checked':''} style="width:auto"> New Arrival</label>
 <div class="media-section">
 <div class="section-heading"><h3>Step 1 · Product Photos</h3><span class="step-number">PHOTO FIRST</span></div>
 <p class="muted">Choose JPG, PNG or WebP images (maximum 4 MB each). They upload when the product is saved.</p>
 <input id="productInitialFiles" type="file" accept="image/jpeg,image/png,image/webp" multiple>
 <div id="productInitialPreview" class="photo-upload-preview photo-preview-list"></div></div>
 <button class="btn primary" ${editable?'':'disabled'} type="submit">Save Product & Photos</button></form>
 ${id?`<div class="media-section">
 <div class="section-heading"><h3>Saved Product Photos</h3><button type="button" class="btn small" data-photos="${id}" data-variant="">Manage Photos</button></div>
 <div class="photos">${productPhotoTiles(group,p.name)}</div>
 <p class="muted">Use × to remove an image.</p></div>
 <div class="media-section"><div class="section-heading"><h3>Step 2 · Color Variants</h3><button type="button" class="btn primary small" data-new-variant="${p.id}">＋ Choose / Add Color</button></div>
 ${variantList.map(v=>'<div class="variant-card"><div class="topline"><div><b>'+esc(v.color)+'</b> · '+esc(v.sku||'No SKU')+'<div class="muted">Stock: '+esc(v.stock??'Unlimited')+' · '+money(v.price??p.base_price)+'</div></div><button type="button" class="btn small" data-edit-variant="'+v.id+'">Edit Color / Photos</button></div><div class="photos">'+productPhotoTiles(images.filter(i=>i.variant_id===v.id),v.color)+'</div></div>').join('')||'<p class="muted">No colors yet. Choose a color to create a separate gallery.</p>'}
 </div>`:''}`);
 setupLocalPhotoPreview('productInitialFiles','productInitialPreview');
 $('productForm').onsubmit=async e=>{e.preventDefault();if(!editable)return;const f=formData('productForm');const payload={name:String(f.name).trim(),category:String(f.category).trim(),base_price:Number(f.base_price),old_price:f.old_price?Number(f.old_price):null,description:String(f.description||''),details:String(f.details||''),sizes:String(f.sizes||'').split(',').map(s=>s.trim()).filter(Boolean),status:f.status,is_new:!!f.is_new};
 try{
 const files=[...($('productInitialFiles')?.files||[])];
 const q=id?db.from('sh_products').update(payload).eq('id',id).select('id').single():db.from('sh_products').insert(payload).select('id').single();
 const r=await q;if(r.error)throw r.error;
 let uploaded=0;
 try{uploaded=await uploadProductFiles(r.data.id,null,files)}
 catch(uploadError){await refresh();editProduct(r.data.id);return notice('drawerMsg','Product saved, photo failed: '+uploadError.message,true)}
 await refresh();editProduct(r.data.id);
 notice('drawerMsg','Product saved'+(uploaded?' · '+uploaded+' photos uploaded':'')+'. Choose / Add Color below.');
 }catch(err){notice('drawerMsg',err.message,true)}};
}
function editVariant(id,productId){
 const v=variants.find(v=>v.id===id)||{product_id:productId,color:'',hex:'#888888',sku:'',price:null,stock:null,active:true};
 const p=products.find(p=>p.id===v.product_id);
 drawer('Color / Variant',`<form id="variantForm"><div class="fieldrow"><div><label>Color name</label><input required name="color" value="${esc(v.color)}"></div><div><label>Color hex</label><input name="hex" type="color" value="${esc(/^#[a-f0-9]{6}$/i.test(v.hex||'')?v.hex:'#888888')}"></div>
 <div><label>Variant price (leave blank for product price)</label><input name="price" type="number" min="0" step=".01" value="${esc(v.price??'')}"></div><div><label>Stock (blank = unlimited)</label><input name="stock" type="number" min="0" step="1" value="${esc(v.stock??'')}"></div></div>
 <label>SKU</label><input name="sku" value="${esc(v.sku||'')}"><label><input name="active" type="checkbox" style="width:auto" ${v.active?'checked':''}> Variant enabled</label>
 <button class="btn primary" type="submit">Save Color</button></form>
 ${id?'<div class="media-section"><div class="section-heading"><h3>Photos for '+esc(v.color)+'</h3><button type="button" class="btn small" data-photos="'+v.product_id+'" data-variant="'+id+'">＋ Manage Photos</button></div><div class="photos">'+productPhotoTiles(images.filter(i=>i.variant_id===id),v.color)+'</div></div>':''}
 <p class="muted">One color can have multiple photos. Black and Purple maintain separate galleries.</p>`);
 $('variantForm').onsubmit=async e=>{e.preventDefault();if(!roleCan('owner','manager'))return;const f=formData('variantForm');
 const row={product_id:v.product_id,color:String(f.color).trim(),hex:String(f.hex),sku:String(f.sku||'').trim()||null,price:f.price?Number(f.price):null,stock:f.stock===''?null:Number(f.stock),active:!!f.active};
 try{const r=id?await db.from('sh_variants').update(row).eq('id',id).select('id').single():await db.from('sh_variants').insert(row).select('id').single();if(r.error)throw r.error;await refresh();editVariant(r.data.id,v.product_id);notice('drawerMsg','Color saved.')}catch(err){notice('drawerMsg',err.message,true)}};
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
async function deletePhoto(id){if(!roleCan('owner','manager'))return;if(!confirm('Remove this image from the product gallery?'))return;const i=images.find(x=>x.id===id);if(!i)return;
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
 const [items,history]=await Promise.all([db.from('sh_order_items').select('*').eq('order_id',id),db.from('sh_order_history').select('*').eq('order_id',id).order('created_at',{ascending:false})]);
 if(items.error||history.error)throw items.error||history.error;
 const editable=roleCan('owner','manager','operator');
 $('drawerBody').innerHTML=`<div class="split"><section><h3>Customer</h3><b>${esc(o.customer_name)}</b><p>${esc(o.customer_phone)}<br>${esc(o.address)}<br>${esc(o.zone)}</p></section>
 <section><h3>Payment</h3><p>${esc(o.payment_method)}<br>${esc(o.payment_status)}<br>Transaction: ${esc(o.transaction_id||'—')}<br>Sender last 4: ${esc(o.sender_last4||'—')}</p></section></div>
 <h3>Items</h3>${items.data.map(i=>'<div class="order-item-row"><div class="order-item-info">'+(i.image_url?imgTag(i.image_url,i.product_name):'<span class="order-item-placeholder"></span>')+'<div><b>'+esc(i.product_name)+'</b><div class="muted">'+esc(i.color)+' · '+esc(i.size)+' · '+esc(i.sku)+'</div></div></div><b>'+i.qty+' × '+money(i.unit_price)+'</b></div>').join('')}
 <div class="badge">Subtotal ${money(o.subtotal)} − Discount ${money(o.discount)} + Delivery ${money(o.shipping)} = <b>${money(o.total)}</b></div>
 <form id="orderForm"><div class="fieldrow"><div><label>Order Status</label><select name="status">${['Pending','Confirmed','Processing','Ready to Ship','Shipped','Delivered','Cancelled','Return Requested','Returned'].map(v=>'<option '+(v===o.status?'selected':'')+'>'+v+'</option>').join('')}</select></div>
 <div><label>Courier</label><input name="courier" value="${esc(o.courier)}"></div><div><label>Tracking ID</label><input name="tracking_id" value="${esc(o.tracking_id)}"></div><div><label>Internal Note</label><textarea name="internal_note">${esc(o.internal_note)}</textarea></div></div>
 <button class="btn primary" ${editable?'':'disabled'} type="submit">Save Order Changes</button>
 <button class="btn" id="printInvoice" type="button">Print Invoice</button></form>
 <div class="divider"></div><h3>Activity History</h3><p class="muted">${(history.data||[]).map(h=>esc(h.action)+' · '+fmtDate(h.created_at)).join('<br>')||'No history yet'}</p>`;
 $('orderForm').onsubmit=async e=>{e.preventDefault();if(!editable)return;const f=formData('orderForm');
 const changes={status:f.status,courier:f.courier,tracking_id:f.tracking_id,internal_note:f.internal_note,updated_at:new Date().toISOString()};
 const r=await db.from('sh_orders').update(changes).eq('id',id);if(r.error)return notice('drawerMsg',r.error.message,true);
 await refresh();editOrder(id);notice('drawerMsg','Order saved.')};
 $('printInvoice').onclick=()=>printInvoice(o,items.data);
 }catch(e){notice('drawerMsg',e.message,true)}
}
function printInvoice(o,items){const w=window.open('','_blank','width=840,height=900');if(!w)return notice('drawerMsg','Allow pop-ups to print the invoice.',true);
 const html=`<!doctype html><title>Invoice ${esc(o.order_number)}</title><style>body{font:14px Arial;padding:32px;color:#222}h1{margin:0}table{width:100%;border-collapse:collapse;margin:25px 0}td,th{padding:10px;border-bottom:1px solid #ccc;text-align:left}.total{text-align:right;font-size:21px;font-weight:bold}</style><h1>SHOPYHAT</h1><p>Your Choice, Our Gift. · Since 2020</p><hr><h2>Invoice ${esc(o.order_number)}</h2><p>${fmtDate(o.created_at)}</p><b>Delivery to</b><p>${esc(o.customer_name)} · ${esc(o.customer_phone)}<br>${esc(o.address)}</p><table><tr><th>Product</th><th>Variant</th><th>Qty</th><th>Amount</th></tr>${items.map(i=>'<tr><td>'+esc(i.product_name)+'</td><td>'+esc(i.color)+' / '+esc(i.size)+'</td><td>'+i.qty+'</td><td>'+money(i.line_total)+'</td></tr>').join('')}</table><p>Subtotal: ${money(o.subtotal)}<br>Discount: ${money(o.discount)}<br>Delivery: ${money(o.shipping)}</p><p class="total">Total ${money(o.total)}</p><p>Payment: ${esc(o.payment_method)} — ${esc(o.payment_status)}<br>Order status: ${esc(o.status)}</p>`;
 w.document.write(html);w.document.close();w.focus();w.print()}
function reviewPayment(id){
 if(!roleCan('owner','manager'))return;
 const p=payments.find(x=>x.id===id),o=orders.find(x=>x.id===p?.order_id);if(!p)return;
 drawer('Review Payment',`<p>Order: <b>${esc(o?.order_number||'—')}</b></p><p>Method: ${esc(p.method)} · ${money(p.amount)}<br>Transaction: <b>${esc(p.transaction_id)}</b><br>Sender last 4: ${esc(p.sender_last4)}</p>
 <p class="badge">Check the actual bKash/Nagad transaction history before marking a payment verified.</p>
 <form id="paymentForm"><label>Review Result</label><select name="status">${['Pending Verification','Review Required','Verified - Paid','Refund Pending','Refunded','Rejected'].map(x=>'<option '+(p.status===x?'selected':'')+'>'+x+'</option>').join('')}</select><button class="btn primary" type="submit">Save Review</button></form>`);
 $('paymentForm').onsubmit=async e=>{e.preventDefault();const status=formData('paymentForm').status;if(status==='Verified - Paid'&&!confirm('I checked the transaction in the payment provider account. Confirm verified?'))return;
 const r=await db.from('sh_payments').update({status}).eq('id',id);
 if(r.error)return notice('drawerMsg',r.error.message,true);await refresh();closeDrawer()};
}
function editStaff(email){
 if(role!=='owner')return;const s=staff.find(s=>s.email===email)||{email:'',display_name:'',role:'viewer',active:true};if(s.role==='owner')return;
 drawer('Staff Access',`<form id="staffForm"><label>Email</label><input type="email" required name="email" value="${esc(s.email)}" ${email?'readonly':''}><label>Display Name</label><input name="display_name" value="${esc(s.display_name)}">
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
 <label>Customer Name</label><input name="name" required minlength="2"><label>Phone (Bangladesh)</label><input name="phone" required placeholder="017XXXXXXXX"><label>Delivery Address</label><textarea name="address" required minlength="10"></textarea>
 <label>Delivery Zone</label><select name="zone"><option value="dhaka">Inside Dhaka</option><option value="outside">Outside Dhaka</option></select>
 <button class="btn primary" type="submit">Create Confirmed COD Order</button></form>`);
 $('newOrderForm').onsubmit=async e=>{e.preventDefault();const f=formData('newOrderForm'),btn=e.currentTarget.querySelector('button[type=submit]');btn.disabled=true;
 try{const {data:{session}}=await db.auth.getSession();const r=await fetch(CHECKOUT_URL,{method:'POST',
 headers:{'content-type':'application/json','apikey':SUPABASE_PUBLISHABLE_KEY,...(session?{'authorization':'Bearer '+session.access_token}:{})},
 body:JSON.stringify({request_id:crypto.randomUUID(),name:f.name,phone:f.phone,address:f.address,zone:f.zone,payment_method:'cod',
 items:[{variant_id:f.variant_id,qty:Number(f.qty),size:f.size||''}]})});const j=await r.json();if(!r.ok||!j.ok)throw Error(j.error||'Order not created');
 await refresh();closeDrawer();notice('appMsg','Created '+j.orderId);}
 catch(err){notice('drawerMsg',err.message,true)}finally{btn.disabled=false}};
}

function exportOrders(){
 if(!orders.length)return notice('appMsg','No orders available to export.',true);
 const columns=['order_number','created_at','customer_name','customer_phone','address','zone','status','payment_method','payment_status','subtotal','discount','shipping','total','courier','tracking_id'];
 const cell=v=>'"'+String(v??'').replace(/^[=+\-@\t\r]/,"'$&").replace(/"/g,'""')+'"';
 const csv=[columns.join(','),...orders.map(o=>columns.map(k=>cell(o[k])).join(','))].join('\r\n');
 const blob=new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'});
 const u=URL.createObjectURL(blob);const a=document.createElement('a');
 a.href=u;a.download='SHOPYHAT_Orders_'+new Date().toISOString().slice(0,10)+'.csv';
 document.body.append(a);a.click();a.remove();URL.revokeObjectURL(u);
}
$('exportOrders').onclick=exportOrders;
$('sendOtp').onclick=loginSend;$('verifyOtp').onclick=loginVerify;
$('email').onkeydown=e=>{if(e.key==='Enter')loginSend()};$('otp').onkeydown=e=>{if(e.key==='Enter')loginVerify()};
$('logout').onclick=async()=>{await db.auth.signOut();location.reload()};
$('refresh').onclick=refresh;$('closeDrawer').onclick=closeDrawer;
$('productSearch').oninput=render;$('orderSearch').oninput=render;$('statusFilter').onchange=render;
$('newProduct').onclick=()=>editProduct(null);$('addStaff').onclick=()=>editStaff(null);$('newOrder').onclick=addOrder;
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.addEventListener('keydown',e=>{
 if(e.key==='Escape')closeDrawer();
 if((e.key==='Enter'||e.key===' ')&&e.target?.hasAttribute('data-view-photo')){
  e.preventDefault();
  const hero=$('photoHeroImage');if(hero)hero.src=e.target.dataset.viewPhoto;
 }
});
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-edit-product],[data-new-variant],[data-edit-variant],[data-photos],[data-delete-photo],[data-view-photo],[data-edit-order],[data-review],[data-edit-staff]');
 if(!el)return;
 if(el.dataset.editProduct)editProduct(el.dataset.editProduct);
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
