/* SHOPYHAT customer account, password-based login without SMS OTP. Guest checkout stays optional. */
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.49.10';
const URL='https://xwfqgmgiunlxzvzoermn.supabase.co',KEY='sb_publishable_Tk-PzYsM3YxnDsjicnMdzQ_mQsREdkP';
const initialCustomerCallback=(()=>{const p=new URLSearchParams(location.hash.slice(1));return p.get('type')==='signup'&&p.has('access_token')})();
const db=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'sh_customer_auth_v1'},global:{headers:{'X-Client-Info':'shopyhat-customer-v1'}}});
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'৳'+Number(n||0).toLocaleString('en-BD');
const normalPhone=s=>{let n=String(s||'').trim().replace(/[\s-]/g,'');if(n.startsWith('+88'))n=n.slice(3);else if(n.startsWith('88'))n=n.slice(2);return /^01[3-9]\d{8}$/.test(n)?n:null};
let accountReady=false, currentTab='', requestedTab='orders';
let profile=null,pendingName='',pendingPhone='',signedUser=null,inboxTimer=null;
window.SHOPYHAT_CUSTOMER={getProfile:()=>profile,getUser:()=>signedUser,show:open,route:routeAccount,addressFields,readAddress,formatAddress,db};
const message=(s,bad=false)=>{const n=$('shAccountMessage');if(n){n.textContent=s;n.classList.toggle('error',bad)}};
const view=(html)=>{$('shAccountBody').innerHTML=html};
const field=(name,label,type='text',more='')=>'<label>'+label+'<input name="'+name+'" type="'+type+'" '+more+' required></label>';
const formButton=text=>'<button class="sh-account-primary" type="submit">'+text+'</button>';
const tabs={orders:'Orders',cart:'Cart',saved:'Saved items',address:'Delivery address',notifications:'Notifications',profile:'Profile',security:'Security'};
const isAccountPage=()=>Boolean($('p-account')&&!$('p-account').classList.contains('hidden'));
const focusedTab=tab=>Object.hasOwn(tabs,tab)?tab:'orders';
function open(tab){
 if(tab&&Object.hasOwn(tabs,tab)&&isAccountPage()){
  const hash='#account/'+tab;
  if(location.hash!==hash)location.hash=hash;
  return;
 }
 location.assign('/account'+(tab&&Object.hasOwn(tabs,tab)?'#account/'+tab:''));
}
function routeAccount(tab){
 const section=$('p-account');
 if(!section)return;
 const prior=section.dataset.active==='true';
 if(!isAccountPage()){
  if(prior)restoreShopping();
  section.dataset.active='false';
  return;
 }
 section.dataset.active='true';
 requestedTab=focusedTab(tab);
 if(!accountReady)return;
 if(!prior||!$('shAccountBody').children.length)render();
 else if(signedUser&&currentTab!==requestedTab){message('');loadTab(requestedTab)}
}
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
 if(!signedUser){clearInterval(inboxTimer);inboxTimer=null;window.dispatchEvent(new Event('sh:account'));return}
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
function restoreShopping(){
 for(const [drawer,ids] of [['cartDrawer',['cartBody','cartFoot']],['wishDrawer',['wishBody']]]){
  for(const id of ids){
   const node=$(id);
   if(node?.closest('#shAccountPanel'))$(drawer)?.append(node);
  }
 }
}
function render(){
 if(!isAccountPage())return;
 restoreShopping();
 message('');
 const page=$('p-account');
 page.classList.toggle('sh-account-signed-in',Boolean(signedUser));
 page.classList.toggle('sh-account-signed-out',!signedUser);
 if(!signedUser){currentTab='';loginView();return}
 const phone=normalPhone(profile?.phone)||'';
 view('<div class="sh-account-greeting"><h2 id="shAccountGreeting">Hello, '+esc(profile?.full_name||'Customer')+'</h2><p>'+esc([signedUser.email,phone].filter(Boolean).join(' · '))+'</p></div><div class="sh-account-layout"><aside class="sh-account-menu"><nav aria-label="Account sections">'+Object.entries(tabs).map(([key,label])=>'<a href="#account/'+key+'" data-account-tab="'+key+'">'+label+'</a>').join('')+'</nav><button class="sh-text-button" id="shSignOut" type="button">Sign out</button></aside><div id="shAccountPanel"></div></div>');
 $('shSignOut').onclick=async e=>{
  const button=e.currentTarget, label=button.textContent;
  button.disabled=true;button.textContent='Signing out…';
  try{
   const {error}=await db.auth.signOut();
   if(error)throw error;
   signedUser=null;profile=null;clearInterval(inboxTimer);inboxTimer=null;
   $('shAccountUnread').hidden=true;
   $('shAccountTrigger').setAttribute('aria-label','My Account');
   window.dispatchEvent(new Event('sh:account'));
   render();
  }catch{message('Could not sign out. Please try again.',true)}
  finally{button.disabled=false;button.textContent=label}
 };
 loadTab(requestedTab);
}
function panel(html){$('shAccountPanel').innerHTML=html}
let tabVersion=0;
function loadTab(tab){
 restoreShopping();
 currentTab=tab;
 const version=++tabVersion;
 document.querySelectorAll('[data-account-tab]').forEach(a=>{
  if(a.dataset.accountTab===tab)a.setAttribute('aria-current','page');
  else a.removeAttribute('aria-current');
 });
 panel('<p role="status">Loading…</p>');
 if(tab==='orders'||tab==='notifications'){
  const load=tab==='orders'?ordersView:notificationsView;
  load(version).catch(()=>{
   if(isCurrentTab(tab,version))panel('<p role="alert">Could not load this section. Please try again.</p><button type="button" id="shAccountRetry" class="sh-account-secondary">Try again</button>');
   if(isCurrentTab(tab,version))$('shAccountRetry').onclick=()=>loadTab(tab);
  });
  return;
 }
 if(tab==='cart'||tab==='saved'){
  const cart=tab==='cart';
  panel('<h3>'+tabs[tab]+'</h3><div id="shShoppingPanel"></div>');
  const host=$('shShoppingPanel');
  if(cart){host.append($('cartBody'),$('cartFoot'));window.renderCart()}
  else {host.append($('wishBody'));window.renderWish()}
  return;
 }
 if(tab==='address')return addressView();
 if(tab==='security')return securityView();
 profileView();
}
const isCurrentTab=(tab,version)=>isAccountPage()&&signedUser&&currentTab===tab&&tabVersion===version;
async function ordersView(version){
 const {data,error}=await db.rpc('sh_customer_orders');
 if(!isCurrentTab('orders',version))return;
 if(error)throw error;
 const orders=Array.isArray(data)?data:[];
 panel('<h3>Order History</h3><p class="sh-account-note">Your signed-in orders are saved securely. Previous guest orders still use order number and mobile tracking.</p>'+
 (orders.length?orders.map(o=>'<div class="sh-account-line"><div><b>'+esc(o.order_number)+'</b><small>'+esc(o.status||'Pending')+' · '+new Date(o.created_at).toLocaleDateString('en-BD')+'</small></div><div><span>'+money(o.total)+'</span><button type="button" class="sh-account-secondary" data-track-order="'+esc(o.order_number)+'">Track</button></div></div>').join(''):'<p>No orders yet.</p><a class="btn" href="/#shop">Start shopping</a>'));
 document.querySelectorAll('[data-track-order]').forEach(button=>button.onclick=()=>{
  const number=String(button.dataset.trackOrder||'');
  const mobile=normalPhone(profile?.phone)||'';
  history.pushState(null,'','/#track');
  window.dispatchEvent(new Event('hashchange'));
  setTimeout(()=>{
   const input=document.getElementById('tId'),phoneInput=document.getElementById('tPhone');
   if(input)input.value=number;
   if(phoneInput)phoneInput.value=mobile;
   if(mobile)document.getElementById('trackForm')?.requestSubmit();
   else phoneInput?.focus();
  },50);
 });
}
async function checkInbox(silent=false){
 if(!signedUser)return;
 const userId=signedUser.id;
 const {data,error}=await db.from('sh_customer_notifications').select('id,kind,title,body,created_at,read_at').order('created_at',{ascending:false}).limit(30);
 if(error){if(!silent)throw error;return}
 if(!signedUser||signedUser.id!==userId)return;
 const unread=(data||[]).filter(n=>!n.read_at);
 const bell=$('shAccountTrigger'),badge=$('shAccountUnread');
 if(bell)bell.setAttribute('aria-label',unread.length?'My Account, '+unread.length+' unread notifications':'My Account');
 if(badge){badge.hidden=!unread.length;badge.textContent=unread.length||''}
 if(silent&&unread.length&&'Notification'in window&&Notification.permission==='granted'){
  const recent=unread[0];const k='sh_notified_'+recent.id;
  try{if(!sessionStorage.getItem(k)){new Notification(recent.title,{body:recent.body,tag:recent.id});sessionStorage.setItem(k,'1')}}catch{}
 }
 return data||[];
}
async function notificationsView(version){
 const [{data:preferences,error},items]=await Promise.all([db.from('sh_customer_notification_preferences').select('*').eq('user_id',signedUser.id).maybeSingle(),checkInbox()]);
 if(!isCurrentTab('notifications',version))return;
 if(error)throw error;
 const opts=[['restock','Restock alerts'],['low_stock','Low stock'],['new_arrivals','New arrivals'],['offers','New offers'],['order_updates','Order updates']];
 panel('<h3>Notifications</h3><p>Choose which alerts you want. Browser notifications are shown while the shop is open, after you grant permission.</p><form id="shPreferenceForm">'+opts.map(([key,label])=>'<label class="sh-account-check"><input type="checkbox" name="'+key+'" '+((preferences?preferences[key]:['restock','order_updates'].includes(key))?'checked':'')+'> '+label+'</label>').join('')+formButton('Save preferences')+'</form><div class="sh-account-actions"><button class="sh-account-secondary" id="shBrowserPermission">Allow browser notifications</button><button class="sh-account-secondary" id="shWatchSaved">Notify me about saved products</button></div><h3>Inbox</h3><button class="sh-account-secondary" id="shMarkRead" type="button">Mark all as read</button>'+(items?.length?items.map(n=>'<div class="sh-account-line"><div><b>'+esc(n.title)+'</b><small>'+esc(n.body)+'</small></div><small>'+new Date(n.created_at).toLocaleDateString()+'</small></div>').join(''):'<p>No notifications yet.</p>'));
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
  if(!error&&isCurrentTab('notifications',version))await notificationsView(version).catch(()=>message('Could not refresh the inbox. Please reopen Notifications.',true));
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
const divisions=['Barishal','Chattogram','Dhaka','Khulna','Mymensingh','Rajshahi','Rangpur','Sylhet'];
const addressKeys={division:'Division',district:'District',thana:'Thana',area:'Area',line:'Line',landmark:'Landmark'};
function addressFields(prefix,structured={},legacy=''){
 const address=structured&&Object.keys(addressKeys).some(key=>structured[key])?structured:{line:legacy};
 const name=key=>prefix+addressKeys[key];
 const id=key=>key==='line'&&prefix==='k'?'kAddr':name(key);
 const input=(key,label,hint,limit)=>'<div class="sh-address-field fld"><label for="'+id(key)+'">'+label+'</label><input id="'+id(key)+'" name="'+name(key)+'" value="'+esc(address[key]||'')+'" placeholder="'+hint+'" maxlength="'+limit+'"></div>';
 return '<div class="sh-address-grid"><div class="sh-address-field"><label for="'+id('division')+'">Division</label><select id="'+id('division')+'" name="'+name('division')+'"><option value="">Select division</option>'+divisions.map(division=>'<option'+(address.division===division?' selected':'')+'>'+division+'</option>').join('')+'</select></div>'+
 input('district','District','e.g. Dhaka',60)+input('thana','Thana / Upazila','e.g. Dhanmondi',70)+input('area','Area / Village','e.g. Satmasjid Road',80)+
 '<div class="sh-address-field sh-address-wide fld"><label for="'+id('line')+'">House, road and address details</label><textarea id="'+id('line')+'" name="'+name('line')+'" rows="3" maxlength="400" placeholder="House or building, road, block or village">'+esc(address.line||'')+'</textarea></div>'+
 input('landmark','Landmark or delivery point (optional)','e.g. Near the main gate',100)+'</div>';
}
function readAddress(form,prefix){
 return Object.fromEntries(Object.entries(addressKeys).map(([key,name])=>[key,String(form.elements.namedItem(prefix+name)?.value||'').trim()]));
}
function formatAddress(address){
 if(!address)return '';
 return [address.line,address.area,address.thana,address.district,address.division,address.landmark?'Landmark: '+address.landmark:''].filter(Boolean).join(', ');
}
function saveFeedback(form,text,error=false){
 const status=form.querySelector('[role=status]');
 status.textContent=text;
 status.classList.toggle('error',error);
}
async function submitAccountChange(form,working,success,task){
 const button=form.querySelector('[type=submit]'),label=button.textContent;
 button.disabled=true;button.textContent=working;
 saveFeedback(form,working);
 try{await task();saveFeedback(form,success)}
 catch(error){saveFeedback(form,error.message||'Could not save. Please try again.',true)}
 finally{button.disabled=false;button.textContent=label}
}
async function saveCustomerProfile(values){
 const user=signedUser;
 const {data,error}=await db.from('sh_customer_profiles').update({...values,updated_at:new Date().toISOString()}).eq('user_id',user.id).select().maybeSingle();
 if(error)throw error;
 if(!data)throw Error('Your changes could not be saved. Please contact SHOPYHAT support.');
 if(signedUser?.id!==user.id)return;
 profile=data;
 window.dispatchEvent(new Event('sh:account'));
}
const formStatus='<p class="sh-action-status" role="status" aria-live="polite"></p>';
function addressView(){
 panel('<h3>Delivery address</h3><p>Save your usual address for faster checkout. You can use a different address for an individual order.</p><form id="shAddressForm">'+addressFields('account',profile?.delivery_address,profile?.preferred_address)+formButton('Save delivery address')+formStatus+'</form>');
 $('shAddressForm').onsubmit=e=>{
  e.preventDefault();
  const form=e.currentTarget,address=readAddress(form,'account'),formatted=formatAddress(address);
  if(formatted&&(!address.line||formatted.length<10))return saveFeedback(form,'Enter your house, road or other details needed to find the address.',true);
  if(formatted.length>400)return saveFeedback(form,'The full address is too long. Shorten it to 400 characters or fewer.',true);
  submitAccountChange(form,'Saving…',formatted?'Delivery address saved.':'Saved delivery address cleared.',()=>saveCustomerProfile({delivery_address:formatted?address:{},preferred_address:formatted}));
 };
}
function profileView(){
 panel('<h3>Profile</h3><p>Your contact details help us identify your account and send order updates.</p><form id="shProfileForm">'+field('full_name','Full name','text','autocomplete="name" maxlength="120" value="'+esc(profile?.full_name||'')+'"')+'<label>Email address<input type="email" value="'+esc(signedUser.email||'')+'" readonly></label><label>Mobile number<input type="tel" value="'+esc(normalPhone(profile?.phone)||'')+'" readonly></label>'+formButton('Save profile')+formStatus+'</form>');
 $('shProfileForm').onsubmit=e=>{
  e.preventDefault();const form=e.currentTarget,name=String(new FormData(form).get('full_name')||'').trim();
  if(name.length<2)return saveFeedback(form,'Enter a name with at least 2 characters.',true);
  submitAccountChange(form,'Saving…','Profile updated.',async()=>{
   await saveCustomerProfile({full_name:name});
   if($('shAccountGreeting')&&signedUser)$('shAccountGreeting').textContent='Hello, '+(profile?.full_name||'Customer');
  });
 };
}
function securityView(){
 panel('<h3>Security</h3><p>Change the password you use to sign in.</p><form id="shPasswordForm">'+passInput('password','New password','new-password')+passInput('confirm','Confirm new password','new-password')+formButton('Update password')+formStatus+'</form>');
 bindPassword();
 $('shPasswordForm').onsubmit=e=>{
  e.preventDefault();const form=e.currentTarget,fields=new FormData(form),password=String(fields.get('password')||'');
  if(password!==fields.get('confirm'))return saveFeedback(form,'Passwords do not match.',true);
  submitAccountChange(form,'Updating…','Password updated. Use your new password next time you sign in.',async()=>{
   const {error}=await db.auth.updateUser({password});
   if(error)throw Error(error.code==='same_password'?'Choose a password different from your current password.':error.message);
   form.reset();
   for(const button of form.querySelectorAll('[data-toggle-password]')){
    if(button.parentNode.querySelector('input').type==='text')button.click();
   }
  });
 };
}
db.auth.onAuthStateChange((event,session)=>{
 if(event==='INITIAL_SESSION'||(session?.user?.id||null)===(signedUser?.id||null))return;
 setTimeout(()=>{
  if((session?.user?.id||null)===(signedUser?.id||null))return;
  loadAccount().then(render).catch(()=>{if(isAccountPage())message('Could not refresh your account. Please try again.',true)});
 },0);
});
/* Existing checkout/support forms remain usable for guests. Only populate blank fields of verified customers. */
function prefillCustomerForms(){
 const p=window.SHOPYHAT_CUSTOMER?.getProfile?.();
 if(!p||!signedUser)return;
 const short=normalPhone(p.phone);const name=p.full_name||'';
 const fill=(selector,value)=>{const field=document.querySelector(selector);if(field&&!field.value&&value)field.value=value};
 fill('#kName',name);fill('#kPhone',short);
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
document.addEventListener('DOMContentLoaded',async()=>{
 observeFormAutofill();
 try{await loadAccount()}
 catch(e){console.warn('Account unavailable',e)}
 accountReady=true;
 const tab=location.hash.startsWith('#account/')?location.hash.slice(9):'';
 routeAccount(tab);
 if(initialCustomerCallback&&signedUser){
  if(isAccountPage())message('Email verified. Welcome to SHOPYHAT!');
  else open();
 }
});

