/* SHOPYHAT customer account, password-based login without SMS OTP. Guest checkout stays optional. */
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.49.10';
const URL='https://xwfqgmgiunlxzvzoermn.supabase.co',KEY='sb_publishable_Tk-PzYsM3YxnDsjicnMdzQ_mQsREdkP';
const initialCustomerCallback=(()=>{const p=new URLSearchParams(location.hash.slice(1));return p.get('type')==='signup'&&p.has('access_token')})();
const db=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'sh_customer_auth_v1'},global:{headers:{'X-Client-Info':'shopyhat-customer-v1'}}});
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'৳'+Number(n||0).toLocaleString('en-BD');
const normalPhone=s=>{let n=String(s||'').trim().replace(/[\s-]/g,'');if(n.startsWith('+88'))n=n.slice(3);else if(n.startsWith('88'))n=n.slice(2);return /^01[3-9]\d{8}$/.test(n)?n:null};
let profile=null,pendingName='',pendingPhone='',signedUser=null,inboxTimer=null;
window.SHOPYHAT_CUSTOMER={getProfile:()=>profile,getUser:()=>signedUser,show:()=>open(),db};
const message=(s,bad=false)=>{const n=$('shAccountMessage');if(n){n.textContent=s;n.classList.toggle('error',bad)}};
const view=(html)=>{$('shAccountBody').innerHTML=html};
const field=(name,label,type='text',more='')=>'<label>'+label+'<input name="'+name+'" type="'+type+'" '+more+' required></label>';
const formButton=text=>'<button class="sh-account-primary" type="submit">'+text+'</button>';
function shell(){
 if($('shAccountModal'))return;
 const btn=document.createElement('button');btn.type='button';btn.className='ibtn sh-account-trigger';btn.id='shAccountTrigger';btn.title='My Account';btn.setAttribute('aria-label','Open My Account');
 btn.innerHTML='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2"/></svg>';
 document.querySelector('#hdr .icons')?.append(btn);
 const dialog=document.createElement('dialog');dialog.id='shAccountModal';dialog.className='sh-account-dialog';dialog.setAttribute('aria-labelledby','shAccountHeading');
 dialog.innerHTML='<div class="sh-account-head"><div class="sh-account-brand"><span class="sh-account-logo" aria-hidden="true">S</span><div><small>SHOPYHAT · SINCE 2020</small><h2 id="shAccountHeading">My Account</h2></div></div><button type="button" id="shAccountClose" aria-label="Close account window">×</button></div><div id="shAccountMessage" role="status" aria-live="polite"></div><div id="shAccountBody"></div><div class="sh-account-bottom"><span>Secure shopping, simple checkout.</span><a href="#shop" id="shAccountGuest">Continue as guest →</a></div>';
 document.body.append(dialog);btn.onclick=open;$('shAccountClose').onclick=()=>dialog.close();
 $('shAccountGuest').onclick=()=>dialog.close();
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
}
function open(){shell();const dialog=$('shAccountModal');if(!dialog.open)dialog.showModal();render()}
const authIntro=(title,desc,active,step='')=>'<div class="sh-auth-intro"><div class="sh-auth-eyebrow">YOUR CHOICE, OUR GIFT.</div><h3>'+title+'</h3><p>'+desc+'</p></div><nav class="sh-auth-nav" aria-label="Customer account access"><button type="button" id="shAuthLogin" class="'+(active==='login'?'active':'')+'">Sign in</button><button type="button" id="shAuthSignup" class="'+(active==='signup'?'active':'')+'">Create account</button></nav>'+(step?'<div class="sh-auth-progress">'+step+'<div class="sh-progress-bars"><i class="on"></i><i class="'+(step.includes('2')?'on':'')+'"></i></div></div>':'');
const bindTabs=()=>{$('shAuthLogin').onclick=loginView;$('shAuthSignup').onclick=signupStep1};
const passInput=(name,label,mode)=>'<label class="sh-auth-field"><span>'+label+'</span><span class="sh-password-input"><input name="'+name+'" type="password" '+(mode==='new-password'?'minlength="8"':'')+' autocomplete="'+mode+'" required><button class="sh-eye" type="button" data-toggle-password aria-label="Show password">Show</button></span></label>';
const bindPassword=()=>document.querySelectorAll('#shAccountBody [data-toggle-password]').forEach(b=>b.onclick=()=>{const i=b.parentNode.querySelector('input');i.type=i.type==='password'?'text':'password';b.textContent=i.type==='password'?'Show':'Hide';b.setAttribute('aria-label',i.type==='password'?'Show password':'Hide password')});
function signupStep1(){
 message('');
 view(authIntro('Create an account','Join SHOPYHAT and verify your email address.','signup','Step 1 of 2 · Your details')+
 '<form id="shSignup1" class="sh-auth-form">'+field('name','Full name','text','minlength="2" maxlength="100" autocomplete="name" placeholder="Your full name"')+
 field('phone','Mobile number','tel','placeholder="01XXXXXXXXX" inputmode="tel" maxlength="14" autocomplete="tel"')+
 '<p class="sh-form-hint">Your delivery address is only needed when you place an order.</p>'+formButton('Continue →')+'</form>');
 bindTabs();
 $('shSignup1').onsubmit=e=>{
  e.preventDefault();const f=new FormData(e.currentTarget),phone=normalPhone(f.get('phone'));
  if(!phone)return message('Enter a valid Bangladesh mobile number.',true);
  pendingName=String(f.get('name')||'').trim();pendingPhone=phone;
  if(pendingName.length<2)return message('Please enter your full name.',true);
  passwordView(phone);
 };
}
function passwordView(phone){
 message('');
 view(authIntro('Secure your account','Choose a password and add an email for account recovery.','signup','Step 2 of 2 · Account security')+
 '<div class="sh-signup-summary"><span>Creating account for</span><strong>'+esc(pendingName)+'</strong><small>'+esc(phone)+'</small></div>'+
 '<form id="shSignup2" class="sh-auth-form">'+field('email','Email address','email','maxlength="180" autocomplete="email" placeholder="name@example.com"')+
 passInput('password','Create password','new-password')+passInput('confirm','Confirm password','new-password')+
 '<p class="sh-form-hint" id="shPasswordStrength" aria-live="polite">Use at least 8 characters; a longer, unique password is safer.</p><p class="sh-form-hint">Email verification is required.</p>'+
 formButton('Create my account →')+'</form><button type="button" class="sh-auth-back" id="shBackAccount">← Back to personal details</button>');
 bindTabs();bindPassword();$('shBackAccount').onclick=signupStep1;
 const strengthInput=$('shSignup2').querySelector('[name=password]');strengthInput.addEventListener('input',()=>{const v=strengthInput.value,n=[/[a-z]/.test(v),/[A-Z]/.test(v),/[0-9]/.test(v),/[^a-zA-Z0-9]/.test(v)].filter(Boolean).length;const label=!v?'Use at least 8 characters; a longer, unique password is safer.':v.length<8?'Too short — use at least 8 characters.':v.length>=12&&n>=3?'Strength: strong':v.length>=10&&n>=2?'Strength: moderate':'Strength: weak — use a longer, unique password.';$('shPasswordStrength').textContent=label;});
 $('shSignup2').onsubmit=async e=>{
  e.preventDefault();const form=e.currentTarget,f=new FormData(form);
  const pass=String(f.get('password')||''),confirmation=String(f.get('confirm')||'');
  const email=String(f.get('email')||'').trim().toLowerCase();
  if(pass!==confirmation)return message('Passwords do not match.',true);
  if(pass.length<8)return message('Use a password of at least 8 characters.',true);
  const button=form.querySelector('[type=submit]');button.disabled=true;button.textContent='Creating account…';
  try{
   const {data,error}=await db.auth.signUp({email,password:pass,options:{emailRedirectTo:location.origin+'/account-confirmed.html',data:{name:pendingName,mobile:pendingPhone}}});
   if(error)throw error;
   if(data.session){await loadAccount();render();message('Welcome to SHOPYHAT! Your account has been created successfully.');return}
   if(data.user && Array.isArray(data.user.identities) && data.user.identities.length===0){view('<div class="sh-auth-complete"><h3>Check your account</h3><p>If an account already exists with this email, please sign in or use Forgot password. Otherwise, check your inbox for a verification message.</p><button class="sh-account-primary" type="button" id="shExistingLogin">Back to sign in</button><button class="sh-auth-back" type="button" id="shExistingVerify">Enter a verification code</button></div>');$('shExistingLogin').onclick=loginView;$('shExistingVerify').onclick=()=>verifySignupView(email);return;}
   verifySignupView(email);
  }catch(error){message(error.message||'Could not register. Please try again.',true)}
  finally{button.disabled=false;button.textContent='Create my account →'}
 };
}
function verifySignupView(email){
 message('');
 view('<div class="sh-auth-intro"><h3>Verify your email</h3><p>Check '+esc(email)+' for a verification code or confirmation link. Check your spam folder too.</p></div>'+
 '<form id="shVerifySignup" class="sh-auth-form">'+field('code','Verification code','text','inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,8}" minlength="6" maxlength="8"')+formButton('Verify and continue →')+'</form>'+
 '<button type="button" class="sh-auth-back" id="shResendSignup">Resend verification email</button><br><button type="button" class="sh-auth-back" id="shVerifyBack">Back to sign in</button>');
 $('shVerifyBack').onclick=loginView;
 $('shResendSignup').onclick=async e=>{const b=e.currentTarget;b.disabled=true;try{const {error}=await db.auth.resend({type:'signup',email,options:{emailRedirectTo:location.origin+'/account-confirmed.html'}});if(error)throw error;message('If eligible, a verification email has been sent. Please check your inbox.')}catch(err){message(err.message||'Unable to resend. Please try again later.',true)}finally{b.disabled=false}};
 $('shVerifySignup').onsubmit=async e=>{e.preventDefault();const b=e.currentTarget.querySelector('[type=submit]');b.disabled=true;try{const token=String(new FormData(e.currentTarget).get('code')||'').trim();const {data,error}=await db.auth.verifyOtp({email,token,type:'signup'});if(error)throw error;if(!data.session)throw Error('Verification completed. Please sign in.');await loadAccount();render();message('Email verified. Welcome to SHOPYHAT!')}catch(err){message(err.message||'Verification failed. Check the code and try again.',true)}finally{b.disabled=false}};
}
function loginView(){
 message('');
 view(authIntro('Welcome back','Sign in to manage orders, saved details and notifications.','login')+
 '<form id="shLogin" class="sh-auth-form">'+field('email','Email address','email','autocomplete="email" placeholder="name@example.com"')+
 passInput('password','Password','current-password')+
 '<div class="sh-forgot-row"><span>Protected account access</span><button class="sh-text-button" type="button" id="shForgot">Forgot password?</button></div>'+
 formButton('Sign in →')+'</form><div class="sh-auth-footnote">New to SHOPYHAT? <button type="button" class="sh-text-button" id="shGoSignup">Create an account</button></div>');
 bindTabs();bindPassword();$('shGoSignup').onclick=signupStep1;$('shForgot').onclick=forgotView;
 $('shLogin').onsubmit=async e=>{
  e.preventDefault();const form=e.currentTarget,f=new FormData(form);
  const email=String(f.get('email')||'').trim().toLowerCase();
  const button=form.querySelector('[type=submit]');button.disabled=true;button.textContent='Signing in…';
  try{
   const {data,error}=await db.auth.signInWithPassword({email,password:String(f.get('password')||'')});
   if(error)throw error;
   if(!data.session)throw Error('Unable to start a secure session. Please try again.');
   await loadAccount();render();
  }catch(error){message(error.code==='invalid_credentials'?'Email or password is incorrect. Please try again or select Forgot password.':error.code==='email_not_confirmed'?'Please verify your email before signing in.':error.message||'Sign in failed. Please try again.',true)}
  finally{button.disabled=false;button.textContent='Sign in →'}
 };
}
function forgotView(){
 message('');
 view('<div class="sh-auth-intro"><div class="sh-auth-eyebrow">ACCOUNT RECOVERY</div><h3>Forgot your password?</h3><p>Enter your account email to receive a secure recovery link. No SMS OTP is required.</p></div>'+
 '<form id="shForgotForm" class="sh-auth-form">'+field('email','Account email','email','autocomplete="email" placeholder="name@example.com"')+
 formButton('Send password reset link →')+'</form><button type="button" class="sh-auth-back" id="shForgotBack">← Back to sign in</button>');
 $('shForgotBack').onclick=loginView;
 $('shForgotForm').onsubmit=async e=>{
  e.preventDefault();const form=e.currentTarget,email=String(new FormData(form).get('email')||'').trim().toLowerCase();
  const btn=form.querySelector('[type=submit]');btn.disabled=true;btn.textContent='Sending…';
  try{
   const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:location.origin+'/reset-password.html'});
   if(error)throw error;
   recoveryCodeView(email);
  }catch(error){message(/error sending|smtp|unexpected/i.test(error.message||'')?'We could not send the recovery email right now. Please try again later or contact support.':error.message||'Unable to send your recovery link.',true)}
  finally{btn.disabled=false;btn.textContent='Send password reset link →'}
 };
}
function recoveryCodeView(email){
 message('');
 view('<div class="sh-auth-intro"><div class="sh-auth-eyebrow">ACCOUNT RECOVERY</div><h3>Check your inbox</h3><p>If the address is registered, a reset email has been sent. Enter its code below or follow the reset link. Check spam too.</p></div><form id="shRecoveryCode" class="sh-auth-form">'+field('code','Recovery code','text','inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,8}" minlength="6" maxlength="8"')+formButton('Verify code →')+'</form><button type="button" class="sh-auth-back" id="shForgotReturn">← Back to sign in</button>');
 $('shForgotReturn').onclick=loginView;
 $('shRecoveryCode').onsubmit=async e=>{e.preventDefault();const b=e.currentTarget.querySelector('[type=submit]');b.disabled=true;try{const token=String(new FormData(e.currentTarget).get('code')||'').trim();const {data,error}=await db.auth.verifyOtp({email,token,type:'recovery'});if(error)throw error;if(!data.session)throw Error('Verification could not be completed. Please request a new code.');location.assign('/reset-password.html')}catch(err){message('Code invalid or expired. Please request a new recovery email.',true)}finally{b.disabled=false}};
}
async function loadAccount(){
 const {data:{user}}=await db.auth.getUser();signedUser=user||null;profile=null;
 if(!signedUser){window.dispatchEvent(new Event('sh:account'));return}
 const result=await db.from('sh_customer_profiles').select('*').eq('user_id',user.id).maybeSingle();
 if(!result.error&&result.data)profile=result.data;
 else if(!result.error&&user.email&&normalPhone(user.user_metadata?.mobile||pendingPhone||'')){
  const fullName=pendingName||String(user.user_metadata?.name||'Customer').slice(0,100);
  const {data}=await db.from('sh_customer_profiles').insert({user_id:user.id,full_name:fullName,phone:'+88'+normalPhone(user.user_metadata?.mobile||pendingPhone||''),email:user.email.toLowerCase()}).select().maybeSingle();
  if(data)profile=data;
 }
 if(!profile){profile={user_id:user.id,full_name:pendingName||user.user_metadata?.name||'Customer',phone:normalPhone(user.user_metadata?.mobile||'')?'+88'+normalPhone(user.user_metadata?.mobile||''):null,email:user.email,preferred_address:''}}
 pendingName='';
 window.dispatchEvent(new Event('sh:account'));
 if(signedUser)scheduleWatchSync();
 if(inboxTimer)clearInterval(inboxTimer);
 checkInbox(true).catch(()=>{});
 inboxTimer=setInterval(()=>{if(!document.hidden&&signedUser)checkInbox(true)},45000);
}
function render(){
 message('');
 if(!signedUser){loginView();return}
 const phone=normalPhone(profile?.phone)||'';
 view('<div class="sh-account-greeting"><h3>Hello, '+esc(profile?.full_name||'Customer')+'</h3><p>'+esc(phone)+' · '+esc(signedUser.email||'')+'</p></div><div class="sh-account-tabs"><button type="button" data-account-tab="orders">My Orders</button><button type="button" data-account-tab="notifications">Notifications</button><button type="button" data-account-tab="profile">Profile</button></div><div id="shAccountPanel"></div><button class="sh-text-button" id="shSignOut" type="button">Sign out</button>');
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
  profileView();
}
async function ordersView(){
 const {data,error}=await db.rpc('sh_customer_orders');
 if(error)return panel('<p>'+esc(error.message)+'</p>');
 const orders=Array.isArray(data)?data:[];
 panel('<h3>Order History</h3><p class="sh-account-note">Your signed-in orders are saved securely. Previous guest orders still use order number and mobile tracking.</p>'+
 (orders.length?orders.map(o=>'<div class="sh-account-line"><div><b>'+esc(o.order_number)+'</b><small>'+esc(o.status||'Pending')+' · '+new Date(o.created_at).toLocaleDateString('en-BD')+'</small></div><div><span>'+money(o.total)+'</span><button type="button" class="sh-account-secondary" data-track-order="'+esc(o.order_number)+'">Track</button></div></div>').join(''):'<p>No orders yet. You can check out as a guest anytime.</p>'));
 document.querySelectorAll('[data-track-order]').forEach(button=>button.onclick=()=>{
  const number=String(button.dataset.trackOrder||'');
  const mobile=normalPhone(profile?.phone)||'';
  $('shAccountModal')?.close();
  window.location.hash='#track';
  setTimeout(()=>{
   const input=document.getElementById('tId'),phoneInput=document.getElementById('tPhone');
   if(input)input.value=number;
   if(phoneInput)phoneInput.value=mobile;
   document.getElementById('trackForm')?.requestSubmit();
  },50);
 });
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
 panel('<h3>Notifications</h3><p>Choose which alerts you want. Browser notifications are shown while the shop is open, after you grant permission.</p><form id="shPreferenceForm">'+opts.map(([key,label])=>'<label class="sh-account-check"><input type="checkbox" name="'+key+'" '+(preferences?preferences[key]:['restock','order_updates'].includes(key)?'checked':'')+'> '+label+'</label>').join('')+formButton('Save preferences')+'</form><div class="sh-account-actions"><button class="sh-account-secondary" id="shBrowserPermission">Allow browser notifications</button><button class="sh-account-secondary" id="shWatchSaved">Notify me about saved products</button></div><h3>Inbox</h3><button class="sh-account-secondary" id="shMarkRead" type="button">Mark all as read</button>'+(items?.length?items.map(n=>'<div class="sh-account-line"><div><b>'+esc(n.title)+'</b><small>'+esc(n.body)+'</small></div><small>'+new Date(n.created_at).toLocaleDateString()+'</small></div>').join(''):'<p>No notifications yet.</p>'));
 $('shPreferenceForm').onsubmit=async e=>{
  e.preventDefault();const f=new FormData(e.currentTarget),payload={user_id:signedUser.id};
  opts.forEach(([key])=>payload[key]=f.has(key));
  const {error}=await db.from('sh_customer_notification_preferences').upsert(payload);
  message(error?error.message:'Preferences saved.',!!error);
 };
 $('shMarkRead').onclick=async()=>{
  const ids=(items||[]).filter(n=>!n.read_at).map(n=>n.id);
  if(!ids.length)return message('All notifications are already read.');
  const {error}=await db.from('sh_customer_notifications').update({read_at:new Date().toISOString()}).eq('user_id',signedUser.id).in('id',ids);
  message(error?error.message:'Notifications marked as read.',!!error);
  if(!error)notificationsView();
 };
 $('shBrowserPermission').onclick=async()=>{if(!('Notification'in window))return message('Browser notifications are unavailable.',true);const p=await Notification.requestPermission();message(p==='granted'?'Notifications enabled while website is open.':'Permission not granted.',p!=='granted')};
 $('shWatchSaved').onclick=watchSaved;
}
async function watchSaved(){
 const count=await syncSavedWatches();
 message(count<0?'Unable to update saved product alerts.':count+' saved product variants are watched for restock alerts.',count<0);
}
let watchSyncTimer=null;
const localArray=key=>{try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x:[]}catch{return []}};
async function syncSavedWatches(){
 if(!signedUser)return -1;
 const wishIDs=new Set(localArray('sh_wish').map(String));
 const cartItems=localArray('sh_cart');
 const allIDs=[...new Set([...wishIDs,...cartItems.map(c=>String(c.id||''))].filter(x=>/^\d+$/.test(x)))].slice(0,70);
 if(!allIDs.length){
  const {error}=await db.from('sh_customer_watches').delete().eq('user_id',signedUser.id);
  return error?-1:0;
 }
 const productResult=await db.from('sh_products').select('id,legacy_id').in('legacy_id',allIDs);
 if(productResult.error)return -1;
 const matched=productResult.data||[];
 const variantsResult=matched.length?await db.from('sh_variants').select('id,product_id,color').in('product_id',matched.map(p=>p.id)).limit(250):{data:[],error:null};
 if(variantsResult.error)return -1;
 const wanted=new Set();
 for(const product of matched){
  const vs=(variantsResult.data||[]).filter(v=>v.product_id===product.id);
  if(wishIDs.has(String(product.legacy_id)))vs.forEach(v=>wanted.add(v.id));
  for(const item of cartItems){
   if(String(item.id)!==String(product.legacy_id))continue;
   const choice=vs.find(v=>String(v.color||'').toLowerCase()===String(item.color||'').toLowerCase());
   if(choice)wanted.add(choice.id);
   else vs.forEach(v=>wanted.add(v.id));
  }
 }
 const {data:previous,error:readErr}=await db.from('sh_customer_watches').select('variant_id').eq('user_id',signedUser.id).limit(250);
 if(readErr)return -1;
 const oldSet=new Set((previous||[]).map(x=>x.variant_id));
 const additions=[...wanted].filter(id=>!oldSet.has(id)).map(variant_id=>({user_id:signedUser.id,variant_id}));
 const removals=[...oldSet].filter(id=>!wanted.has(id));
 if(additions.length){const {error}=await db.from('sh_customer_watches').upsert(additions,{onConflict:'user_id,variant_id'});if(error)return -1}
 if(removals.length){const {error}=await db.from('sh_customer_watches').delete().eq('user_id',signedUser.id).in('variant_id',removals);if(error)return -1}
 return wanted.size;
}
function scheduleWatchSync(){
 if(watchSyncTimer)clearTimeout(watchSyncTimer);
 watchSyncTimer=setTimeout(()=>{syncSavedWatches().catch(e=>console.warn('Saved watches unavailable',e))},350);
}
window.addEventListener('sh:saved-items',scheduleWatchSync);
function profileView(){
 panel('<h3>Profile</h3><p>Delivery address remains optional until checkout.</p><form id="shProfileForm">'+field('full_name','Full name','text','maxlength="120" value="'+esc(profile?.full_name||'')+'"')+'<label>Preferred delivery address<textarea name="preferred_address" maxlength="400">'+esc(profile?.preferred_address||'')+'</textarea></label>'+formButton('Save profile')+'<p id="shProfileStatus" role="status" aria-live="polite" style="margin:12px 0;font-weight:600"></p></form><details><summary>Change password</summary><form id="shPasswordForm">'+field('password','New password','password','minlength="8" autocomplete="new-password"')+field('confirm','Confirm new password','password','minlength="8" autocomplete="new-password"')+formButton('Update password')+'<p id="shPasswordStatus" role="status" aria-live="polite" style="margin:12px 0;font-weight:600"></p></form></details>');
 const status=(id,text,bad=false)=>{const n=$(id);if(n){n.textContent=text;n.style.color=bad?'#b42318':'#167443'}};
 $('shProfileForm').onsubmit=async e=>{
  e.preventDefault();const form=e.currentTarget,btn=form.querySelector('[type=submit]'),f=new FormData(form),name=String(f.get('full_name')||'').trim();
  if(name.length<2){status('shProfileStatus','Please enter a name with at least 2 characters.',true);return}
  btn.disabled=true;btn.textContent='Saving…';status('shProfileStatus','Saving your profile…');
  try{const {data,error}=await db.from('sh_customer_profiles').update({full_name:name,preferred_address:String(f.get('preferred_address')||'').trim(),updated_at:new Date().toISOString()}).eq('user_id',signedUser.id).select().maybeSingle();
   if(error)throw error;if(!data)throw Error('Profile could not be saved. Please try again or contact support.');profile=data;window.dispatchEvent(new Event('sh:account'));status('shProfileStatus','✓ Profile updated successfully.');
  }catch(err){status('shProfileStatus',err.message||'Unable to save your profile. Please try again.',true)}
  finally{btn.disabled=false;btn.textContent='Save profile'}
 };
 $('shPasswordForm').onsubmit=async e=>{
  e.preventDefault();const form=e.currentTarget,btn=form.querySelector('[type=submit]'),f=new FormData(form),pass=String(f.get('password')||'');
  if(pass!==String(f.get('confirm')||'')){status('shPasswordStatus','Passwords do not match. Please try again.',true);return}
  btn.disabled=true;btn.textContent='Updating…';status('shPasswordStatus','Updating your password…');
  try{const {error}=await db.auth.updateUser({password:pass});if(error)throw error;form.reset();status('shPasswordStatus','✓ Password updated successfully. Use your new password next time you sign in.')}
  catch(err){status('shPasswordStatus',err.code==='same_password'?'Please choose a password different from your current password.':err.message||'Unable to update your password. Please try again.',true)}
  finally{btn.disabled=false;btn.textContent='Update password'}
 };
}
db.auth.onAuthStateChange((_event,session)=>{if(session?.user?.id!==signedUser?.id){setTimeout(()=>loadAccount().then(()=>{if($('shAccountModal')?.open)render()}),0)}});
/* Existing checkout/support forms remain usable for guests. Only populate blank fields of verified customers. */
function prefillCustomerForms(){
 const p=window.SHOPYHAT_CUSTOMER?.getProfile?.();
 if(!p||!signedUser)return;
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
document.addEventListener('DOMContentLoaded',()=>{shell();observeFormAutofill();loadAccount().then(()=>{if(initialCustomerCallback&&signedUser){open();message('Email verified. Welcome to SHOPYHAT!')}}).catch(e=>console.warn('Account unavailable',e))});

