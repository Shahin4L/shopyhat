import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.49.10';
const url='https://xwfqgmgiunlxzvzoermn.supabase.co',key='sb_publishable_Tk-PzYsM3YxnDsjicnMdzQ_mQsREdkP';
const db=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'sh_reseller_auth_v1'}});
const $=id=>document.getElementById(id),escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'৳'+Number(n||0).toLocaleString('en-BD',{maximumFractionDigits:2});
const mobile=s=>{let v=String(s||'').trim().replace(/[\s-]/g,'');if(v.startsWith('+88'))v=v.slice(3);else if(v.startsWith('88'))v=v.slice(2);return /^01[3-9][0-9]{8}$/.test(v)?v:null};
const message=(text,bad=false)=>{const el=$('alert');el.textContent=text;el.classList.toggle('error',bad);if(text)el.scrollIntoView({behavior:'smooth',block:'nearest'})};
let user=null,account=null,selection=null,catalog=[],catalogPage=1;
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
 const [products,variants,prices,images,requests,referrals]=await Promise.all([
  db.from('sh_products').select('id,legacy_id,name,base_price,status').eq('status','active').limit(350),
  db.from('sh_variants').select('id,product_id,color,price,stock,active').eq('active',true).limit(1200),
  db.from('sh_reseller_prices').select('product_id,wholesale_price').eq('active',true).limit(350),
  db.from('sh_product_images').select('product_id,variant_id,image_url,sort_order').order('sort_order').limit(600),
  db.from('sh_reseller_fulfillment_requests').select('id,status,quantity,retail_unit_price,wholesale_unit_price,margin_total,created_at').order('created_at',{ascending:false}).limit(80),
  db.from('sh_reseller_referrals').select('id,status,margin_total,created_at').order('created_at',{ascending:false}).limit(80)
 ]);
 if([products,variants,prices,images,requests,referrals].some(r=>r.error)){
  message('Unable to load the reseller catalog. Please try again.',true);return;
 }
 const allowed=new Map((prices.data||[]).map(p=>[p.product_id,Number(p.wholesale_price)]));
 const productMap=new Map((products.data||[]).map(p=>[p.id,p]));
 catalog=(variants.data||[]).map(v=>{
  const p=productMap.get(v.product_id),wholesale=allowed.get(v.product_id);
  if(!p||wholesale===undefined)return null;
  const image=(images.data||[]).find(im=>im.variant_id===v.id)||(images.data||[]).find(im=>im.product_id===p.id);
  return{variant_id:v.id,product_id:p.id,legacy_id:p.legacy_id,name:p.name,color:v.color||'Standard',
   stock:v.stock,public_price:Number(v.price??p.base_price),wholesale,image:image?.image_url||''};
 }).filter(Boolean);
 renderCatalog();
 const list=(target,items,formatter)=>{
  $(target).replaceChildren();
  if(!items.length){$(''+target).textContent='No records yet.';return}
  for(const item of items){const entry=document.createElement('div');entry.className='entry';entry.innerHTML=formatter(item);$(target).append(entry)}
 };
 list('requestList',requests.data||[],r=>'<span><b>'+escape(r.status)+'</b><small>'+new Date(r.created_at).toLocaleDateString('en-BD')+' · '+r.quantity+' piece(s)</small></span><span>'+money(r.margin_total)+' gross margin</span>');
 list('referralList',referrals.data||[],r=>'<span><b>'+escape(r.status)+'</b><small>'+new Date(r.created_at).toLocaleDateString('en-BD')+'</small></span><span>'+money(r.margin_total)+' provisional</span>');
}
function renderCatalog(){
 const query=String($('catalogSearch')?.value||'').trim().toLowerCase(),stock=$('catalogStock')?.value||'all',sort=$('catalogSort')?.value||'name';
 let results=catalog.filter(p=>{
   if(stock==='available'&&p.stock!==null&&p.stock<=0)return false;
   if(stock==='out'&&(p.stock===null||p.stock>0))return false;
   return !query||(p.name+' '+p.color+' '+p.legacy_id).toLowerCase().includes(query);
 });
 results.sort((a,b)=>sort==='margin'?(b.public_price-b.wholesale)-(a.public_price-a.wholesale):sort==='price'?a.public_price-b.public_price:sort==='latest'?String(b.legacy_id||'').localeCompare(String(a.legacy_id||'')):a.name.localeCompare(b.name));
 const totalPages=Math.max(1,Math.ceil(results.length/CATALOG_PAGE_SIZE));catalogPage=Math.max(1,Math.min(catalogPage,totalPages));
 const host=$('products');host.replaceChildren();
 for(const p of results.slice((catalogPage-1)*CATALOG_PAGE_SIZE,catalogPage*CATALOG_PAGE_SIZE)){
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
  prices.innerHTML='<span>Public<b>'+money(p.public_price)+'</b></span><span>Your price<b>'+money(p.wholesale)+'</b></span><span>Gross margin<b>'+money(Math.max(0,p.public_price-p.wholesale))+'</b></span>';
  const actions=document.createElement('div');actions.className='actions';
  const share=document.createElement('button');share.type='button';share.textContent='Copy Link';
  share.disabled=!p.legacy_id||!account?.shop_slug;
  share.onclick=async()=>{
   const url=location.origin+'/?ref='+encodeURIComponent(account.shop_slug)+'#p/'+encodeURIComponent(p.legacy_id);
   try{await navigator.clipboard.writeText(url);message('Reseller product link copied.')}catch{message('Copy this link: '+url)}
  };
  const order=document.createElement('button');order.type='button';order.textContent=p.stock!==null&&p.stock<=0?'Out of Stock':'Create Request';order.disabled=p.stock!==null&&p.stock<=0;
  order.onclick=()=>openRequest(p);
  actions.append(share,order);body.append(title,meta,prices,actions);card.append(body);host.append(card);
 }
 if(!results.length){const empty=document.createElement('div');empty.className='catalog-empty';empty.textContent=catalog.length?'No products match this filter. Try another search.':'No products enabled for reseller sales. SHOPYHAT Admin can select and publish items in the Reseller Product Pricing panel.';host.append(empty)}
 $('catalogSummary').textContent=results.length+' available catalog entries · '+catalog.length+' published variants';
 $('catalogPageLabel').textContent='Page '+catalogPage+' of '+totalPages;
 $('catalogPrev').disabled=catalogPage<=1;$('catalogNext').disabled=catalogPage>=totalPages;
}
function openRequest(p){selection=p;$('requestProduct').textContent=p.name+' — '+p.color+' · Your price '+money(p.wholesale);
 const f=$('requestForm');f.reset();f.elements.retail.value=p.public_price;
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
 const el=$(id);if(el)el.addEventListener(id==='catalogSearch'?'input':'change',()=>{catalogPage=1;renderCatalog()});
}
$('catalogPrev').onclick=()=>{catalogPage--;renderCatalog()};
$('catalogNext').onclick=()=>{catalogPage++;renderCatalog()};
$('resellerRefresh').onclick=()=>loadDashboard();
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
