import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.49.10';
const url='https://xwfqgmgiunlxzvzoermn.supabase.co',key='sb_publishable_Tk-PzYsM3YxnDsjicnMdzQ_mQsREdkP';
const db=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'sh_reseller_auth_v1'}});
const $=id=>document.getElementById(id),escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'৳'+Number(n||0).toLocaleString('en-BD',{maximumFractionDigits:2});
const mobile=s=>{let v=String(s||'').trim().replace(/[\s-]/g,'');if(v.startsWith('+88'))v=v.slice(3);else if(v.startsWith('88'))v=v.slice(2);return /^01[3-9][0-9]{8}$/.test(v)?v:null};
const message=(text,bad=false)=>{const el=$('alert');el.textContent=text;el.classList.toggle('error',bad);if(text)el.scrollIntoView({behavior:'smooth',block:'nearest'})};
let user=null,account=null,selection=null,catalog=[];
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
 for(const t of ['catalog','requests','links']){
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
 $('products').replaceChildren();
 for(const p of catalog){
  const card=document.createElement('article');card.className='product';
  if(p.image&&/^https:\/\//i.test(p.image)){const image=document.createElement('img');image.className='image';image.src=p.image;image.loading='lazy';image.alt=p.name;card.append(image)}
  const body=document.createElement('div');body.className='body';
  body.innerHTML='<strong>'+escape(p.name)+'</strong><small>Variant: '+escape(p.color)+' · Stock: '+(p.stock===null?'Confirm availability':p.stock)+'</small>'+
  '<div class="pricebar"><span>Public <b>'+money(p.public_price)+'</b></span><span>Your Price <b>'+money(p.wholesale)+'</b></span><span>Gross Margin <b>'+money(p.public_price-p.wholesale)+'</b></span></div>';
  const actions=document.createElement('div');actions.className='actions';
  const share=document.createElement('button');share.type='button';share.textContent='Copy Share Link';
  share.disabled=!p.legacy_id||!account?.shop_slug;
  share.onclick=async()=>{
   const path=location.origin+'/?ref='+encodeURIComponent(account.shop_slug)+'#p/'+encodeURIComponent(p.legacy_id);
   try{await navigator.clipboard.writeText(path);message('Product share link copied.')}catch{message('Share this link: '+path)}
  };
  const order=document.createElement('button');order.type='button';order.textContent='Create Request';order.disabled=p.stock!==null&&p.stock<1;order.onclick=()=>openRequest(p);
  actions.append(share,order);body.append(actions);card.append(body);$('products').append(card);
 }
 if(!catalog.length)$('products').textContent='No active reseller products available. Ask SHOPYHAT Admin to publish wholesale prices.';
 const list=(target,items,formatter)=>{
  $(target).replaceChildren();
  if(!items.length){$(''+target).textContent='No records yet.';return}
  for(const item of items){const entry=document.createElement('div');entry.className='entry';entry.innerHTML=formatter(item);$(target).append(entry)}
 };
 list('requestList',requests.data||[],r=>'<span><b>'+escape(r.status)+'</b><small>'+new Date(r.created_at).toLocaleDateString('en-BD')+' · '+r.quantity+' piece(s)</small></span><span>'+money(r.margin_total)+' gross margin</span>');
 list('referralList',referrals.data||[],r=>'<span><b>'+escape(r.status)+'</b><small>'+new Date(r.created_at).toLocaleDateString('en-BD')+'</small></span><span>'+money(r.margin_total)+' provisional</span>');
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
