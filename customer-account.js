/* SHOPYHAT Account Hub — verified mobile/password sign-in, guest checkout remains optional. */
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.49.10';
const URL='https://xwfqgmgiunlxzvzoermn.supabase.co',KEY='sb_publishable_Tk-PzYsM3YxnDsjicnMdzQ_mQsREdkP';
const db=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'sh_customer_auth_v1'},global:{headers:{'X-Client-Info':'shopyhat-customer-v1'}}});
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'৳'+Number(n||0).toLocaleString('en-BD');
const normalPhone=s=>{let n=String(s||'').trim().replace(/[\s-]/g,'');if(n.startsWith('+88'))n=n.slice(3);else if(n.startsWith('88'))n=n.slice(2);return /^01[3-9]\d{8}$/.test(n)?n:null};
let profile=null,pendingName='',signedUser=null,inboxTimer=null;
window.SHOPYHAT_CUSTOMER={getProfile:()=>profile,getUser:()=>signedUser,show:()=>open(),db};
const message=(s,bad=false)=>{const n=$('shAccountMessage');if(n){n.textContent=s;n.classList.toggle('error',bad)}};
const view=(html)=>{$('shAccountBody').innerHTML=html};
const field=(name,label,type='text',more='')=>'<label>'+label+'<input name="'+name+'" type="'+type+'" '+more+' required></label>';
const formButton=text=>'<button class="sh-account-primary" type="submit">'+text+'</button>';
function shell(){
 if($('shAccountModal'))return;
 const btn=document.createElement('button');btn.type='button';btn.className='ibtn sh-account-trigger';btn.id='shAccountTrigger';btn.title='Customer account';btn.setAttribute('aria-label','Open customer account');btn.textContent='◉';
 const icons=document.querySelector('#hdr .icons');icons?.append(btn);
 const dialog=document.createElement('dialog');dialog.id='shAccountModal';dialog.className='sh-account-dialog';
 dialog.innerHTML='<div class="sh-account-head"><div><small>SHOPYHAT</small><h2>My Account</h2></div><button type="button" id="shAccountClose" aria-label="Close account">×</button></div><div id="shAccountMessage" role="status"></div><div id="shAccountBody"></div>';
 document.body.append(dialog);btn.onclick=open;$('shAccountClose').onclick=()=>dialog.close();
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
}
function open(){shell();$('shAccountModal').showModal();render()}
function signupStep1(){
 view('<h3>Create an account</h3><p>Step 1 of 2 — name and mobile number. Delivery address is requested only when ordering.</p><form id="shSignup1">'+field('name','Full name','text','minlength="2" maxlength="100" autocomplete="name"')+field('phone','Bangladesh mobile','tel','placeholder="01XXXXXXXXX" inputmode="tel" autocomplete="tel"')+formButton('Continue')+'</form><p>Already registered? <button class="sh-text-button" id="shGoLogin">Sign in</button></p>');
 $('shGoLogin').onclick=loginView;
 $('shSignup1').onsubmit=e=>{
  e.preventDefault();const f=new FormData(e.currentTarget),phone=normalPhone(f.get('phone'));if(!phone)return message('Enter a valid Bangladesh mobile number.',true);
  pendingName=String(f.get('name')||'').trim();if(pendingName.length<2)return message('Enter your full name.',true);
  passwordView(phone);
 };
}
function passwordView(phone){
 view('<h3>Choose a password</h3><p>Step 2 of 2 — '+esc(phone)+'</p><form id="shSignup2">'+field('password','Password','password','minlength="8" autocomplete="new-password"')+field('confirm','Confirm password','password','minlength="8" autocomplete="new-password"')+formButton('Create account')+'</form><p><button class="sh-text-button" id="shBackAccount">Back</button></p>');
 $('shBackAccount').onclick=signupStep1;
 $('shSignup2').onsubmit=async e=>{
  e.preventDefault();const f=new FormData(e.currentTarget),pass=String(f.get('password')),confirmation=String(f.get('confirm'));
  if(pass!==confirmation)return message('Passwords do not match.',true);
  if(pass.length<8)return message('Use at least eight characters.',true);
  const b=e.currentTarget.querySelector('[type=submit]');b.disabled=true;
  try{
   const {data,error}=await db.auth.signUp({phone:'+88'+phone,password:pass,options:{data:{name:pendingName}}});
   if(error)throw error;
   if(data.session){await loadAccount();render();return}
   otpView(phone);
   message('Enter the verification code sent by SMS. SMS delivery requires the mobile provider to be enabled.');
  }catch(err){message(err.message,true)}finally{b.disabled=false}
 };
}
function otpView(phone,mode='signup'){
 view('<h3>Verify your number</h3><p>Enter the SMS code for '+esc(phone)+'.</p><form id="shVerifyOtp">'+field('otp','Verification code','text','inputmode="numeric" minlength="4" maxlength="8" autocomplete="one-time-code"')+formButton('Verify mobile')+'</form><p><button type="button" class="sh-text-button" id="shOtpBack">Back to sign in</button></p>');
 $('shOtpBack').onclick=loginView;
 $('shVerifyOtp').onsubmit=async e=>{
  e.preventDefault();const token=String(new FormData(e.currentTarget).get('otp')||'').trim();
  const {error}=await db.auth.verifyOtp({phone:'+88'+phone,token,type:'sms'});
  if(error){message(error.message,true);return}
  await loadAccount();render();
 };
}
function loginView(){
 view('<h3>Welcome back</h3><p>Sign in using your mobile and password.</p><form id="shLogin">'+field('phone','Mobile number','tel','inputmode="tel" placeholder="01XXXXXXXXX" autocomplete="tel"')+field('password','Password','password','autocomplete="current-password"')+formButton('Sign in')+'</form><p><button class="sh-text-button" id="shGoSignup">Create account</button> · <button class="sh-text-button" id="shForgot">Forgot password?</button></p>');
 $('shGoSignup').onclick=signupStep1;$('shForgot').onclick=forgotView;
 $('shLogin').onsubmit=async e=>{
  e.preventDefault();const f=new FormData(e.currentTarget),phone=normalPhone(f.get('phone'));
  if(!phone)return message('Invalid mobile number.',true);
  const b=e.currentTarget.querySelector('[type=submit]');b.disabled=true;
  try{const {error}=await db.auth.signInWithPassword({phone:'+88'+phone,password:String(f.get('password'))});if(error)throw error;await loadAccount();render()}
  catch(err){message(err.message,true)}finally{b.disabled=false}
 };
}
function forgotView(){
 view('<h3>Recover access</h3><p>Request an SMS verification code to recover your account.</p><form id="shForgotForm">'+field('phone','Mobile number','tel','inputmode="tel" placeholder="01XXXXXXXXX"')+formButton('Send recovery code')+'</form>');
 $('shForgotForm').onsubmit=async e=>{
  e.preventDefault();const phone=normalPhone(new FormData(e.currentTarget).get('phone'));
  if(!phone)return message('Invalid mobile number.',true);
  const {error}=await db.auth.signInWithOtp({phone:'+88'+phone,options:{shouldCreateUser:false}});
  if(error)return message(error.message,true);
  otpView(phone,'recovery');message('After verification, open Profile to update your password.');
 };
}
async function loadAccount(){
 const {data:{user}}=await db.auth.getUser();signedUser=user?.phone_confirmed_at?user:null;profile=null;
 if(!user){window.dispatchEvent(new Event('sh:account'));return}
 const result=await db.from('sh_customer_profiles').select('*').eq('user_id',user.id).maybeSingle();
 if(!result.error&&result.data)profile=result.data;
 else if(!result.error&&user.phone_confirmed_at&&user.phone){
  const fullName=pendingName||String(user.user_metadata?.name||'Customer').slice(0,100);
  const {data}=await db.from('sh_customer_profiles').insert({user_id:user.id,full_name:fullName,phone:user.phone}).select().maybeSingle();
  if(data)profile=data;
 }
 if(!profile&&user.phone_confirmed_at){profile={user_id:user.id,full_name:pendingName||user.user_metadata?.name||'Customer',phone:user.phone,preferred_address:''}}
 pendingName='';
 window.dispatchEvent(new Event('sh:account'));
 if(inboxTimer)clearInterval(inboxTimer);
 inboxTimer=setInterval(()=>{if(!document.hidden&&signedUser)checkInbox(true)},45000);
}
function render(){
 message('');
 if(!signedUser){loginView();return}
 const phone=normalPhone(profile?.phone||signedUser.phone)||'';
 view('<div class="sh-account-greeting"><h3>Hello, '+esc(profile?.full_name||'Customer')+'</h3><p>'+esc(phone)+'</p></div><div class="sh-account-tabs"><button type="button" data-account-tab="orders">My Orders</button><button type="button" data-account-tab="notifications">Notifications</button><button type="button" data-account-tab="reseller">Reseller</button><button type="button" data-account-tab="profile">Profile</button></div><div id="shAccountPanel"></div><button class="sh-text-button" id="shSignOut" type="button">Sign out</button>');
 $('shSignOut').onclick=async()=>{await db.auth.signOut();signedUser=null;profile=null;render()};
 document.querySelectorAll('[data-account-tab]').forEach(b=>b.onclick=()=>loadTab(b.dataset.accountTab));
 loadTab('orders');
}
function panel(html){$('shAccountPanel').innerHTML=html}
async function loadTab(tab){
 document.querySelectorAll('[data-account-tab]').forEach(b=>b.classList.toggle('active',b.dataset.accountTab===tab));
 panel('<p>Loading…</p>');
 if(tab==='orders')return ordersView();
 if(tab==='notifications')return notificationsView();
 if(tab==='reseller')return resellerView();
 profileView();
}
async function ordersView(){
 const {data,error}=await db.rpc('sh_customer_orders');
 if(error)return panel('<p>'+esc(error.message)+'</p>');
 const orders=Array.isArray(data)?data:[];
 panel('<h3>Order History</h3><p class="sh-account-note">Your verified mobile links previous guest orders as well.</p>'+
 (orders.length?orders.map(o=>'<div class="sh-account-line"><div><b>'+esc(o.order_number)+'</b><small>'+esc(o.status||'Pending')+' · '+new Date(o.created_at).toLocaleDateString('en-BD')+'</small></div><span>'+money(o.total)+'</span></div>').join(''):'<p>No orders yet. You can check out as a guest anytime.</p>'));
}
async function checkInbox(silent=false){
 if(!signedUser)return;
 const {data,error}=await db.from('sh_customer_notifications').select('id,kind,title,body,created_at,read_at').order('created_at',{ascending:false}).limit(30);
 if(error)return;
 const unread=(data||[]).filter(n=>!n.read_at);
 const bell=$('shAccountTrigger');if(bell)bell.title=unread.length?unread.length+' unread notifications':'Customer account';
 if(silent&&unread.length&&'Notification'in window&&Notification.permission==='granted'){
  const recent=unread[0];const k='sh_notified_'+recent.id;
  try{if(!sessionStorage.getItem(k)){new Notification(recent.title,{body:recent.body,tag:recent.id});sessionStorage.setItem(k,'1')}}catch{}
 }
 return data||[];
}
async function notificationsView(){
 const [{data:preferences},items]=await Promise.all([db.from('sh_customer_notification_preferences').select('*').eq('user_id',signedUser.id).maybeSingle(),checkInbox()]);
 const opts=[['restock','Restock alerts'],['low_stock','Low stock'],['new_arrivals','New arrivals'],['offers','New offers'],['order_updates','Order updates']];
 panel('<h3>Notifications</h3><p>Choose which alerts you want. Browser notifications are shown while the shop is open, after you grant permission.</p><form id="shPreferenceForm">'+opts.map(([key,label])=>'<label class="sh-account-check"><input type="checkbox" name="'+key+'" '+(preferences?preferences[key]:['restock','order_updates'].includes(key)?'checked':'')+'> '+label+'</label>').join('')+formButton('Save preferences')+'</form><div class="sh-account-actions"><button class="sh-account-secondary" id="shBrowserPermission">Allow browser notifications</button><button class="sh-account-secondary" id="shWatchSaved">Notify me about saved products</button></div><h3>Inbox</h3>'+(items?.length?items.map(n=>'<div class="sh-account-line"><div><b>'+esc(n.title)+'</b><small>'+esc(n.body)+'</small></div><small>'+new Date(n.created_at).toLocaleDateString()+'</small></div>').join(''):'<p>No notifications yet.</p>'));
 $('shPreferenceForm').onsubmit=async e=>{
  e.preventDefault();const f=new FormData(e.currentTarget),payload={user_id:signedUser.id};
  opts.forEach(([key])=>payload[key]=f.has(key));
  const {error}=await db.from('sh_customer_notification_preferences').upsert(payload);
  message(error?error.message:'Preferences saved.',!!error);
 };
 $('shBrowserPermission').onclick=async()=>{if(!('Notification'in window))return message('Browser notifications are unavailable.',true);const p=await Notification.requestPermission();message(p==='granted'?'Notifications enabled while website is open.':'Permission not granted.',p!=='granted')};
 $('shWatchSaved').onclick=watchSaved;
}
async function watchSaved(){
 const raw=(()=>{try{return JSON.parse(localStorage.getItem('sh_wish')||'[]')}catch{return []}})();
 if(!raw.length)return message('Save a product to your wishlist first.',true);
 const r=await db.from('sh_products').select('id,legacy_id').in('legacy_id',raw.map(String).slice(0,30));
 if(r.error)return message(r.error.message,true);
 const ids=(r.data||[]).map(x=>x.id);if(!ids.length)return message('No saved active products matched.',true);
 const v=await db.from('sh_variants').select('id').in('product_id',ids).limit(70);
 if(v.error)return message(v.error.message,true);
 const payload=(v.data||[]).map(x=>({user_id:signedUser.id,variant_id:x.id}));
 if(!payload.length)return message('No product variants found.',true);
 const {error}=await db.from('sh_customer_watches').upsert(payload,{onConflict:'user_id,variant_id'});
 message(error?error.message:'Saved items are now watched for restock alerts.',!!error);
}
function profileView(){
 panel('<h3>Profile</h3><p>Delivery address remains optional until checkout.</p><form id="shProfileForm">'+field('full_name','Full name','text','maxlength="120" value="'+esc(profile?.full_name||'')+'"')+'<label>Preferred delivery address<textarea name="preferred_address" maxlength="400">'+esc(profile?.preferred_address||'')+'</textarea></label>'+formButton('Save profile')+'</form><details><summary>Change password</summary><form id="shPasswordForm">'+field('password','New password','password','minlength="8"')+formButton('Update password')+'</form></details>');
 $('shProfileForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const {data,error}=await db.from('sh_customer_profiles').update({full_name:String(f.get('full_name')).trim(),preferred_address:String(f.get('preferred_address')||'').trim(),updated_at:new Date().toISOString()}).eq('user_id',signedUser.id).select().maybeSingle();if(data)profile=data;message(error?error.message:'Profile saved.',!!error)};
 $('shPasswordForm').onsubmit=async e=>{e.preventDefault();const pass=String(new FormData(e.currentTarget).get('password'));const {error}=await db.auth.updateUser({password:pass});message(error?error.message:'Password updated.',!!error)};
}
async function resellerView(){
 const {data:account,error}=await db.from('sh_reseller_accounts').select('*').eq('user_id',signedUser.id).maybeSingle();
 if(error)return panel('<p>'+esc(error.message)+'</p>');
 if(!account){
  panel('<h3>Become a SHOPYHAT Reseller</h3><p>Apply to see wholesale prices, public selling prices and available stock. Your margin is your selling price minus the wholesale price, excluding delivery, fees and returns.</p><form id="shResellerApply">'+field('business','Business or shop name','text','maxlength="120"')+formButton('Apply for reseller access')+'</form>');
  $('shResellerApply').onsubmit=async e=>{e.preventDefault();const name=String(new FormData(e.currentTarget).get('business')||'').trim();if(!name)return message('Enter business name.',true);const {error}=await db.from('sh_reseller_accounts').insert({user_id:signedUser.id,business_name:name});message(error?error.message:'Application sent. Approval is required.',!!error);if(!error)resellerView()};
  return;
 }
 if(account.status!=='approved')return panel('<h3>Reseller application</h3><p>Status: <b>'+esc(account.status)+'</b>. Approval is required before wholesale prices are available.</p>');
 const [p,v,prices,requests]=await Promise.all([
  db.from('sh_products').select('id,name,base_price,status').eq('status','active').limit(250),
  db.from('sh_variants').select('id,product_id,color,price,stock,active').eq('active',true).limit(800),
  db.from('sh_reseller_prices').select('product_id,wholesale_price,active').eq('active',true).limit(250),
  db.from('sh_reseller_fulfillment_requests').select('id,status,quantity,margin_total,created_at').order('created_at',{ascending:false}).limit(30)]);
 if([p,v,prices,requests].some(x=>x.error))return panel('<p>Reseller catalog is temporarily unavailable.</p>');
 const products=(p.data||[]).filter(x=>(prices.data||[]).some(z=>z.product_id===x.id));
 const optionRows=(v.data||[]).filter(x=>products.some(p=>p.id===x.product_id));
 const options=optionRows.map(x=>{const item=products.find(p=>p.id===x.product_id),wh=prices.data.find(z=>z.product_id===item.id);return{variant:x,item,wholesale:Number(wh.wholesale_price),retail:Number(x.price??item.base_price)}});
 const optionData=options.map(o=>({id:o.variant.id,name:o.item.name,color:o.variant.color,stock:o.variant.stock,retail:o.retail,wholesale:o.wholesale}));
 window.__shResellerCatalog=optionData;
 panel('<h3>Reseller Catalog</h3><p class="sh-account-note">Stock is live when refreshed. Listed margin is a gross estimate; fulfillment must be approved before shipping.</p><div class="sh-reseller-list">'+options.slice(0,60).map(o=>'<div class="sh-reseller-product"><div><b>'+esc(o.item.name)+'</b><small>'+esc(o.variant.color)+' · Stock: '+(o.variant.stock==null?'Ask availability':o.variant.stock)+'</small><small>Public: '+money(o.retail)+' · Your price: '+money(o.wholesale)+' · Margin: '+money(o.retail-o.wholesale)+'</small></div><button class="sh-account-secondary" data-resell="'+esc(o.variant.id)+'">Create order</button></div>').join('')+'</div><h3>My Fulfillment Requests</h3>'+(requests.data||[]).map(o=>'<div class="sh-account-line"><div><b>'+esc(o.status)+'</b><small>'+new Date(o.created_at).toLocaleDateString()+'</small></div><span>'+money(o.margin_total)+'</span></div>').join(''));
 document.querySelectorAll('[data-resell]').forEach(b=>b.onclick=()=>resellerOrder(optionData.find(o=>o.id===b.dataset.resell)));
}
function resellerOrder(item){
 if(!item)return;
 panel('<h3>Send customer order</h3><p>'+esc(item.name)+' — '+esc(item.color)+'</p><p>Public '+money(item.retail)+' · Wholesale '+money(item.wholesale)+' · Stock '+esc(item.stock??'Check availability')+'</p><form id="shResellerOrder">'+field('name','Customer full name','text','minlength="2" maxlength="120"')+field('phone','Customer mobile','tel','placeholder="01XXXXXXXXX"')+'<label>Customer delivery address<textarea name="address" required minlength="10" maxlength="400"></textarea></label>'+field('qty','Quantity','number','min="1" max="20" value="1"')+field('price','Selling price per piece (৳)','number','min="'+item.wholesale+'" step="0.01" value="'+item.retail+'"')+formButton('Submit fulfillment request')+'</form><p><button class="sh-text-button" id="shResellerBack">Back to catalog</button></p>');
 $('shResellerBack').onclick=resellerView;
 $('shResellerOrder').onsubmit=async e=>{
  e.preventDefault();const f=new FormData(e.currentTarget),phone=normalPhone(f.get('phone'));
  if(!phone)return message('Invalid customer mobile.',true);
  const {error}=await db.rpc('sh_reseller_request',{p_variant:item.id,p_qty:Number(f.get('qty')),p_customer:String(f.get('name')),p_phone:phone,p_address:String(f.get('address')),p_retail:Number(f.get('price'))});
  message(error?error.message:'Request created. SHOPYHAT will review and arrange fulfillment.',!!error);if(!error)resellerView();
 };
}
db.auth.onAuthStateChange((_event,session)=>{if(session?.user?.id!==signedUser?.id){setTimeout(()=>loadAccount().then(()=>{if($('shAccountModal')?.open)render()}),0)}});
/* Existing checkout/support forms remain usable for guests. Only populate blank fields of verified customers. */
function prefillCustomerForms(){
 const p=window.SHOPYHAT_CUSTOMER?.getProfile?.();
 if(!p||!signedUser?.phone_confirmed_at)return;
 const short=normalPhone(p.phone);const name=p.full_name||'';
 const fill=(selector,value)=>{const field=document.querySelector(selector);if(field&&!field.value&&value)field.value=value};
 fill('#kName',name);fill('#kPhone',short);fill('#kAddr',p.preferred_address);
 fill('#rvName',name);fill('#csName',name);fill('#csPhone',short);fill('#careCasePhone',short);
 fill('#tPhone',short);
}
function observeFormAutofill(){
 const host=document.getElementById('shCareContent'),checkout=document.getElementById('coBox');
 for(const node of [host,checkout].filter(Boolean)){
  const observer=new MutationObserver(()=>prefillCustomerForms());
  observer.observe(node,{childList:true,subtree:true});
 }
 window.addEventListener('sh:account',prefillCustomerForms);
}
document.addEventListener('DOMContentLoaded',()=>{shell();observeFormAutofill();loadAccount()});

