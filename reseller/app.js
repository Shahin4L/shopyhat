import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.49.10';
const url='https://xwfqgmgiunlxzvzoermn.supabase.co',key='sb_publishable_Tk-PzYsM3YxnDsjicnMdzQ_mQsREdkP';
const db=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'sh_reseller_auth_v1'}});
const $=id=>document.getElementById(id),escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'৳'+Number(n||0).toLocaleString('en-BD',{maximumFractionDigits:2});
const mobile=s=>{let v=String(s||'').trim().replace(/[\s-]/g,'');if(v.startsWith('+88'))v=v.slice(3);else if(v.startsWith('88'))v=v.slice(2);return /^01[3-9][0-9]{8}$/.test(v)?v:null};
const message=(text,bad=false)=>{const el=$('alert');el.textContent=text;el.classList.toggle('error',bad);if(text)el.scrollIntoView({behavior:'smooth',block:'nearest'})};
let user=null,account=null,selection=null,catalog=[],catalogPage=1,catalogTotal=0;
const CATALOG_PAGE_SIZE=12;
const mediaURL=raw=>{const url=String(raw||'').trim();const match=url.match(/drive\.google\.com\/file\/d\/([\w-]+)/)||url.match(/[?&]id=([\w-]+)/);if(match&&url.includes('google.com'))return 'https://drive.google.com/thumbnail?id='+encodeURIComponent(match[1])+'&sz=w800';try{const u=new URL(url);return u.protocol==='https:'?u.href:''}catch{return ''}};
function productFallback(){const el=document.createElement('div');el.className='product-placeholder';el.innerHTML='<span aria-hidden="true">▧</span><strong>SHOPYHAT</strong><small>Image unavailable</small>';return el}

async function logout(){await db.auth.signOut();user=null;account=null;showLogin()}
function showLogin(){ $('auth').hidden=false;$('passwordPanel').hidden=true;$('dashboard').hidden=true;}
function showPanel(name){
 $('auth').hidden=name!=='auth';$('passwordPanel').hidden=name!=='password';$('dashboard').hidden=name!=='dashboard';
}
async function restore(){
 try{
  const {data}=await db.auth.getUser();user=data?.user||null;
  if(!user)return showLogin();
  const r=await db.from('sh_reseller_accounts').select('user_id,business_name,login_name,shop_slug,status,must_change_password').eq('user_id',user.id).maybeSingle();
  if(r.error||!r.data||r.data.status!=='approved'){
   await logout();return message('Your reseller account is not approved or has been suspended. Contact SHOPYHAT Admin.',true);
  }
  account=r.data;
  if(account.must_change_password){showPanel('password');return}
  showPanel('dashboard');
  $('welcome').textContent=account.business_name||'SHOPYHAT Partner';
  $('resellerMeta').textContent='Reseller ID: '+account.login_name+' · Shop URL: '+(account.shop_slug||'Not configured');
  const partnerURL=location.origin+'/?ref='+encodeURIComponent(account.shop_slug||'');
  $('resellerShareURL').textContent=account.shop_slug?partnerURL:'Ask Admin to assign your shop URL';
  $('openStoreLink').href=account.shop_slug?partnerURL:location.origin;
  $('copyStoreLink').disabled=!account.shop_slug;

  await loadDashboard();
 }catch(err){showLogin();message(err.message||'Unable to load account',true)}
}
function tab(which){
 for(const t of ['catalog','requests','links','security']){
  $(t+'Tab').hidden=which!==t;
  document.querySelector('[data-tab="'+t+'"]')?.classList.toggle('selected',which===t);
 }
}
async function loadDashboard(){
 const [requests,referrals]=await Promise.all([
  db.from('sh_reseller_fulfillment_requests').select('id,status,quantity,retail_unit_price,wholesale_unit_price,margin_total,created_at').order('created_at',{ascending:false}).limit(80),
  db.from('sh_reseller_referrals').select('id,status,margin_total,created_at').order('created_at',{ascending:false}).limit(80)
 ]);
 if(requests.error||referrals.error){message('Unable to load reseller orders. Please try again.',true);return}
 await loadCatalog();
 const list=(target,items,formatter)=>{
  $(target).replaceChildren();
  if(!items.length){$(''+target).textContent='No records yet.';return}
  for(const item of items){const entry=document.createElement('div');entry.className='entry';entry.innerHTML=formatter(item);$(target).append(entry)}
 };
 list('requestList',requests.data||[],r=>'<span><b>'+escape(r.status)+'</b><small>'+new Date(r.created_at).toLocaleDateString('en-BD')+' · '+r.quantity+' piece(s)</small></span><span>'+money(r.margin_total)+' gross margin</span>');
 list('referralList',referrals.data||[],r=>'<span><b>'+escape(r.status)+'</b><small>'+new Date(r.created_at).toLocaleDateString('en-BD')+'</small></span><span>'+money(r.margin_total)+' provisional</span>');
}
async function loadCatalog(){
 const query=String($('catalogSearch')?.value||'').trim(),stock=$('catalogStock')?.value||'all',sort=$('catalogSort')?.value||'name';
 let q=db.from('sh_reseller_catalog').select('variant_id,product_id,legacy_id,name,color,stock,public_price,wholesale,resale_price,customized,image_url,created_at',{count:'exact'});
 if(query)q=q.or('name.ilike.%'+query.replace(/[%,()]/g,'')+'%,color.ilike.%'+query.replace(/[%,()]/g,'')+'%');
 if(stock==='available')q=q.gt('stock',0);
 if(stock==='out')q=q.eq('stock',0);
 if(sort==='margin')q=q.order('gross_margin',{ascending:false});
 else if(sort==='price')q=q.order('public_price',{ascending:true});
 else if(sort==='latest')q=q.order('created_at',{ascending:false});
 else q=q.order('name',{ascending:true});
 const from=(catalogPage-1)*CATALOG_PAGE_SIZE;
 const {data,error,count}=await q.range(from,from+CATALOG_PAGE_SIZE-1);
 if(error){message('Cannot load product catalog: '+error.message,true);return}
 catalogTotal=count||0;
 if(!data?.length&&catalogPage>1){catalogPage=1;return loadCatalog()}
 catalog=(data||[]).map(x=>({...x,public_price:Number(x.public_price||0),wholesale:Number(x.wholesale||0),resale_price:Number((x.resale_price??x.public_price)||0),customized:!!x.customized,image:x.image_url||''}));
 renderCatalog();
}
function renderCatalog(){
 const results=catalog;
 const totalPages=Math.max(1,Math.ceil(catalogTotal/CATALOG_PAGE_SIZE));
 catalogPage=Math.max(1,Math.min(catalogPage,totalPages));
 const host=$('products');host.replaceChildren();
 for(const p of results){
  const card=document.createElement('article');card.className='product';
  const visual=document.createElement('div');visual.className='product-image';
  const url=mediaURL(p.image);
  if(url){
   const image=document.createElement('img');image.src=url;image.alt=p.name+' - '+p.color;image.loading='lazy';
   image.referrerPolicy='no-referrer';
   image.onerror=()=>visual.replaceChildren(productFallback());
   visual.append(image);
  }else visual.append(productFallback());
  card.append(visual);
  const body=document.createElement('div');body.className='body';
  const title=document.createElement('div');title.className='product-title';title.textContent=p.name;
  const meta=document.createElement('div');meta.className='product-meta';meta.textContent='Color: '+p.color+' · '+(p.stock===null?'Stock: Ask Admin':p.stock>0?'Available: '+p.stock:'Out of stock');
  const prices=document.createElement('div');prices.className='pricebar';
  prices.innerHTML='<span>Store price<b>'+money(p.public_price)+'</b></span><span>Wholesale cost<b>'+money(p.wholesale)+'</b></span><span>Gross margin<b>'+money(Math.max(0,p.resale_price-p.wholesale))+'</b></span>';
  const editor=document.createElement('div');editor.className='reseller-price-editor';
  const label=document.createElement('label');label.textContent='Your customer selling price (৳)';
  const input=document.createElement('input');input.type='number';input.min=String(p.wholesale);input.max=String(Math.max(p.public_price*5,p.wholesale));input.step='0.01';input.value=String(p.resale_price);input.setAttribute('aria-label','Your selling price for '+p.name+' '+p.color);
  const margin=document.createElement('small');margin.className='resale-margin';margin.textContent='Estimated margin: '+money(Math.max(0,p.resale_price-p.wholesale));
  input.oninput=()=>{const n=Number(input.value);margin.textContent=n>=p.wholesale?'Estimated margin: '+money(n-p.wholesale):'Minimum price: '+money(p.wholesale)};
  label.append(input);editor.append(label,margin);
  const tools=document.createElement('div');tools.className='reseller-price-actions';
  const save=document.createElement('button');save.type='button';save.textContent=p.customized?'Update Price':'Save Selling Price';
  save.onclick=async()=>{
   const value=Number(input.value);
   if(!Number.isFinite(value)||value<p.wholesale||value>Math.max(p.public_price*5,p.wholesale))return message('Selling price must be between '+money(p.wholesale)+' and '+money(Math.max(p.public_price*5,p.wholesale)),true);
   save.disabled=true;
   try{const {data,error}=await db.rpc('sh_reseller_set_price',{p_variant:p.variant_id,p_price:value});
    if(error||!data?.ok)throw error||Error('Unable to update price');
    p.resale_price=value;p.customized=true;message('Selling price saved. New share-link orders use your updated price.');renderCatalog();
   }catch(e){message(e.message||'Price save failed',true)}finally{save.disabled=false}
  };
  const reset=document.createElement('button');reset.type='button';reset.textContent='Use Store Price';reset.className='reseller-reset-price';reset.disabled=!p.customized;
  reset.onclick=async()=>{
   reset.disabled=true;
   try{const {data,error}=await db.rpc('sh_reseller_set_price',{p_variant:p.variant_id,p_price:null});
    if(error||!data?.ok)throw error||Error('Reset failed');
    p.resale_price=p.public_price;p.customized=false;message('Selling price reset to SHOPYHAT store price.');renderCatalog();
   }catch(e){message(e.message||'Reset failed',true)}finally{reset.disabled=false}
  };
  tools.append(save,reset);editor.append(tools);
  const actions=document.createElement('div');actions.className='actions';
  const share=document.createElement('button');share.type='button';share.textContent='Copy Link';
  share.disabled=!p.legacy_id||!account?.shop_slug;
  share.onclick=async()=>{
   if(Number(input.value)!==p.resale_price)return message('Save your new selling price before sharing this product link.',true);
   const url=location.origin+'/?ref='+encodeURIComponent(account.shop_slug)+'#p/'+encodeURIComponent(p.legacy_id);
   try{await navigator.clipboard.writeText(url);message('Reseller product link copied.')}catch{message('Copy this link: '+url)}
  };
  const order=document.createElement('button');order.type='button';order.textContent=p.stock!==null&&p.stock<=0?'Out of Stock':'Create Request';order.disabled=p.stock!==null&&p.stock<=0;
  order.onclick=()=>openRequest(p);
  const media=document.createElement('button');media.type='button';media.textContent='Download Photos';media.onclick=()=>openMediaLibrary(p);
  actions.append(share,media,order);body.append(title,meta,prices,editor,actions);card.append(body);host.append(card);
 }
 if(!results.length){const empty=document.createElement('div');empty.className='catalog-empty';empty.textContent='No matching reseller products. Try another filter or ask SHOPYHAT Admin to enable products.';host.append(empty)}
 $('catalogSummary').textContent=catalogTotal+' published product variants · Showing '+results.length+' on this page';
 $('catalogPageLabel').textContent='Page '+catalogPage+' of '+totalPages;
 $('catalogPrev').disabled=catalogPage<=1;$('catalogNext').disabled=catalogPage>=totalPages;
}
async function openMediaLibrary(product){
 const modal=$('mediaDialog'),host=$('mediaList');
 $('mediaProductTitle').textContent=product.name+' · '+product.color;
 host.textContent='Loading approved product photos…';modal.showModal();
 const {data,error}=await db.from('sh_product_images').select('id,image_url,alt_text,variant_id,sort_order')
  .eq('product_id',product.product_id).order('sort_order',{ascending:true}).limit(24);
 if(error){host.textContent='Unable to load product images: '+error.message;return}
 host.replaceChildren();
 if(!data?.length){host.textContent='No product images available yet. Ask SHOPYHAT Admin to add them.';return}
 for(const photo of data){
  const tile=document.createElement('div');tile.className='media-tile';
  const visual=document.createElement('div');visual.className='media-preview';
  const imageURL=mediaURL(photo.image_url);
  if(imageURL){const image=document.createElement('img');image.src=imageURL;image.alt=photo.alt_text||product.name;image.loading='lazy';image.onerror=()=>visual.replaceChildren(productFallback());visual.append(image)}
  else visual.append(productFallback());
  const label=document.createElement('small');label.textContent=photo.variant_id===product.variant_id?'Selected variant':'Other product image';
  const button=document.createElement('button');button.type='button';button.className='outline';button.textContent='Download Photo';
  button.onclick=()=>downloadMedia(photo,button);
  tile.append(visual,label,button);host.append(tile);
 }
}
async function downloadMedia(photo,button){
 const initial=button.textContent;button.disabled=true;button.textContent='Preparing…';
 try{
  const {data:{session},error}=await db.auth.getSession();
  if(error||!session?.access_token)throw Error('Please sign in again to download.');
  const response=await fetch(url+'/functions/v1/shopyhat-reseller-media',{
   method:'POST',headers:{apikey:key,authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
   body:JSON.stringify({image_id:photo.id}),cache:'no-store'
  });
  if(!response.ok){const payload=await response.json().catch(()=>({}));throw Error(payload.error||'Image not available')}
  const blob=await response.blob();
  const ext=blob.type==='image/png'?'png':blob.type==='image/webp'?'webp':'jpg';
  const href=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=href;link.download='SHOPYHAT-product-'+photo.id.slice(0,8)+'.'+ext;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(href),5000);message('Photo download started.');
 }catch(error){message(error.message||'Photo could not be downloaded',true)}
 finally{button.disabled=false;button.textContent=initial}
}
function openRequest(p){selection=p;$('requestProduct').textContent=p.name+' — '+p.color+' · Wholesale '+money(p.wholesale)+' · Selling '+money(p.resale_price);
 const f=$('requestForm');f.reset();f.elements.retail.value=p.resale_price;
 f.elements.retail.min=p.wholesale;f.elements.retail.max=Math.max(p.public_price*5,p.wholesale);
 $('requestDialog').showModal();
}
$('openApply').onclick=()=>{$('loginPanel').hidden=true;$('applyPanel').hidden=false;$('applySuccess').hidden=true;message('')};
$('backLogin').onclick=()=>{$('loginPanel').hidden=false;$('applyPanel').hidden=true;$('applySuccess').hidden=true;message('')};
$('successLogin').onclick=()=>{$('applySuccess').hidden=true;$('loginPanel').hidden=false;message('')};
$('loginForm').onsubmit=async event=>{
 event.preventDefault();const form=event.currentTarget,login=$('loginName').value.trim().toLowerCase();
 if(!/^[a-z][a-z0-9_]{3,23}$/.test(login))return message('Enter your valid reseller ID.',true);
 const button=form.querySelector('[type=submit]');button.disabled=true;
 try{
  const {error}=await db.auth.signInWithPassword({email:login+'@reseller.shopyhat.com',password:$('loginPassword').value});
  if(error)throw error;
  $('loginPassword').value='';message('');await restore();
 }catch(err){message(err.message||'Sign in failed',true)}finally{button.disabled=false}
};
$('applyForm').onsubmit=async event=>{
 event.preventDefault();const f=new FormData(event.currentTarget),phone=mobile(f.get('phone'));
 if(!phone)return message('Enter a valid Bangladesh mobile number.',true);
 const form=event.currentTarget;const applicantName=String(f.get('full_name')||'').trim();
 const button=form.querySelector('[type=submit]');button.disabled=true;
 try{
  const {data,error}=await db.rpc('sh_apply_reseller',{
   p_name:String(f.get('full_name')||'').trim(),p_business:String(f.get('business_name')||'').trim(),
   p_phone:phone,p_email:String(f.get('email')||'').trim()||null
  });
  if(error)throw error;
  if(!data?.ok){message(data?.message||'Unable to submit request.',true);return}
  form.reset();$('applyPanel').hidden=true;$('loginPanel').hidden=true;
  $('applySuccess').hidden=false;$('applicationName').textContent=applicantName;
  message('Application submitted successfully. No SMS was sent; this is your on-screen confirmation.');
 }catch(err){message(err.message,true)}finally{button.disabled=false}
};
$('passwordForm').onsubmit=async event=>{
 event.preventDefault();const f=new FormData(event.currentTarget),pass=String(f.get('password')||'');
 if(pass.length<10||pass!==String(f.get('confirm')))return message('Passwords must match and have at least 10 characters.',true);
 const form=event.currentTarget;const btn=form.querySelector('[type=submit]');btn.disabled=true;
 try{
  const result=await db.auth.updateUser({password:pass});if(result.error)throw result.error;
  // Password-change trigger on auth.users clears the first-login gate server-side.
  form.reset();await restore();message('Password updated. Welcome to your reseller dashboard.');
 }catch(err){message(err.message,true)}finally{btn.disabled=false}
};
$('selfPasswordForm').onsubmit=async event=>{
 event.preventDefault();
 const form=event.currentTarget,values=new FormData(form);
 const pass=String(values.get('new_password')||''),again=String(values.get('confirm_password')||'');
 if(pass.length<10||pass!==again)return message('New passwords must match and contain at least 10 characters.',true);
 const button=form.querySelector('[type=submit]');button.disabled=true;
 try{
  const {error}=await db.auth.updateUser({password:pass});
  if(error)throw error;
  form.reset();
  message('Password updated successfully. Use your new password the next time you sign in.');
 }catch(err){message(err.message||'Password update failed',true)}
 finally{button.disabled=false}
};
for(const id of ['catalogSearch','catalogStock','catalogSort']){
 const el=$(id);if(el)el.addEventListener(id==='catalogSearch'?'input':'change',()=>{catalogPage=1;loadCatalog()});
}
$('catalogPrev').onclick=()=>{catalogPage--;loadCatalog()};
$('catalogNext').onclick=()=>{catalogPage++;loadCatalog()};
$('resellerRefresh').onclick=()=>loadDashboard();
$('copyStoreLink').onclick=async()=>{
 if(!account?.shop_slug)return message('No shop URL has been assigned.',true);
 const url=location.origin+'/?ref='+encodeURIComponent(account.shop_slug);
 try{await navigator.clipboard.writeText(url);message('Your reseller storefront link was copied.')}catch{message('Copy this link: '+url)}
};
$('mediaClose').onclick=()=>$('mediaDialog').close();
$('logout').onclick=logout;$('logoutFirst').onclick=logout;$('closeRequest').onclick=()=>$('requestDialog').close();
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>tab(b.dataset.tab));
$('requestForm').onsubmit=async event=>{
 event.preventDefault();const f=new FormData(event.currentTarget),phone=mobile(f.get('phone'));
 if(!phone)return message('Enter a valid customer mobile number.',true);
 if(!f.has('consent'))return message('Customer permission is required.',true);
 const b=event.currentTarget.querySelector('[type=submit]');b.disabled=true;
 try{
  const {data,error}=await db.rpc('sh_reseller_request',{
   p_variant:selection.variant_id,p_qty:Number(f.get('qty')),p_customer:String(f.get('customer')||'').trim(),
   p_phone:phone,p_address:String(f.get('address')||'').trim(),p_retail:Number(f.get('retail'))
  });
  if(error)throw error;
  $('requestDialog').close();message('Fulfillment request received: '+data+'. SHOPYHAT Admin must approve it.');
  await loadDashboard();tab('requests');
 }catch(err){message(err.message,true)}finally{b.disabled=false}
};
db.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'){user=null;account=null;showLogin()}});
restore();
