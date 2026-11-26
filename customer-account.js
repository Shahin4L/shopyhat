import {bindPasswordStrength,passwordStrengthMarkup} from './password-strength.js?v=1';
/* SHOPYHAT customer account, password-based login without SMS OTP. Guest checkout stays optional. */
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.49.10';
const URL='https://xwfqgmgiunlxzvzoermn.supabase.co',KEY='sb_publishable_Tk-PzYsM3YxnDsjicnMdzQ_mQsREdkP';
const initialCustomerCallback=(()=>{const p=new URLSearchParams(location.hash.slice(1));return p.get('type')==='signup'&&p.has('access_token')})();
const db=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'sh_customer_auth_v1'},global:{headers:{'X-Client-Info':'shopyhat-customer-v1'}}});
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'৳'+Number(n||0).toLocaleString('en-BD');
const normalPhone=s=>{let n=String(s||'').trim().replace(/[\s-]/g,'');if(n.startsWith('+88'))n=n.slice(3);else if(n.startsWith('88'))n=n.slice(2);return /^01[3-9]\d{8}$/.test(n)?n:null};
let accountReady=false, currentTab='', requestedTab='profile';
let profile=null,profileExists=false,pendingName='',pendingPhone='',signedUser=null,inboxTimer=null;
window.SHOPYHAT_CUSTOMER={getProfile:()=>profile,getUser:()=>signedUser,show:open,route:routeAccount,addressFields,readAddress,formatAddress,addressError,checkoutAddresses,bindCheckoutAddresses,db};
const message=(s,bad=false)=>{const n=$('shAccountMessage');if(n){n.textContent=s;n.classList.toggle('error',bad)}};
const view=(html)=>{$('shAccountBody').innerHTML=html};
const field=(name,label,type='text',more='')=>'<label>'+label+'<input name="'+name+'" type="'+type+'" '+more+' required></label>';
const formButton=text=>'<button class="sh-account-primary" type="submit">'+text+'</button>';
const tabs={profile:'Profile',orders:'Orders',address:'Delivery addresses',cart:'Cart',saved:'Saved items',notifications:'Notifications',security:'Security'};
const isAccountPage=()=>Boolean($('p-account')&&!$('p-account').classList.contains('hidden'));
const focusedTab=tab=>Object.hasOwn(tabs,tab)?tab:'profile';
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
function connectPasswordGuide(form,id){
 const input=form.elements.namedItem('password');
 input.setAttribute('aria-describedby',id);
 bindPasswordStrength(input,$(id));
}
function passwordView(phone){
 message('');
 view(authIntro('Secure your account','Choose a password and add an email for account recovery.','signup','Step 2 of 2 · Account security')+
 '<div class="sh-signup-summary"><span>Creating account for</span><strong>'+esc(pendingName)+'</strong><small>'+esc(phone)+'</small></div>'+
 '<form id="shSignup2" class="sh-auth-form">'+field('email','Email address','email','maxlength="180" autocomplete="email" placeholder="name@example.com"')+
 passInput('password','Create password','new-password')+passwordStrengthMarkup('shSignupStrength')+passInput('confirm','Confirm password','new-password')+
 '<p class="sh-form-hint">Email verification is required.</p>'+
 formButton('Create my account →')+'</form><button type="button" class="sh-auth-back" id="shBackAccount">← Back to personal details</button>');
 bindTabs();bindPassword();$('shBackAccount').onclick=signupStep1;
 connectPasswordGuide($('shSignup2'),'shSignupStrength');
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
 const {data:{user}}=await db.auth.getUser();signedUser=user||null;profile=null;profileExists=false;
 if(!signedUser){clearInterval(inboxTimer);inboxTimer=null;window.dispatchEvent(new Event('sh:account'));return}
 const result=await db.from('sh_customer_profiles').select('*').eq('user_id',user.id).maybeSingle();
 const metadata=user.user_metadata||{};
 const priorPhone=[metadata.mobile,metadata.phone,metadata.phone_number,metadata.mobile_number,user.phone].map(normalPhone).find(Boolean);
 const priorName=String(metadata.name||metadata.full_name||'').slice(0,120);
 if(!result.error&&result.data)profile=result.data;
 else if(!result.error&&user.email&&(priorPhone||normalPhone(pendingPhone))){
  const fullName=pendingName||priorName||'Customer';
  const {data}=await db.from('sh_customer_profiles').insert({user_id:user.id,full_name:fullName,phone:'+88'+(priorPhone||normalPhone(pendingPhone)),email:user.email.toLowerCase()}).select().maybeSingle();
  if(data)profile=data;
 }
 profileExists=Boolean(profile);
 if(!profile)profile={user_id:user.id,full_name:pendingName||priorName,phone:priorPhone?'+88'+priorPhone:null,email:user.email,preferred_address:''};
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
const accountContact=()=>[signedUser?.email,normalPhone(profile?.phone)].filter(Boolean).join(' · ');
function render(){
 if(!isAccountPage())return;
 restoreShopping();
 message('');
 const page=$('p-account');
 page.classList.toggle('sh-account-signed-in',Boolean(signedUser));
 page.classList.toggle('sh-account-signed-out',!signedUser);
 if(!signedUser){currentTab='';loginView();return}
 view('<div class="sh-account-greeting"><h2 id="shAccountGreeting">Hello, '+esc(profile?.full_name||'Customer')+'</h2><p id="shAccountContact">'+esc(accountContact())+'</p></div><div class="sh-account-layout"><aside class="sh-account-menu"><nav aria-label="Account sections">'+Object.entries(tabs).map(([key,label])=>'<a href="#account/'+key+'" data-account-tab="'+key+'">'+label+'</a>').join('')+'</nav><button class="sh-text-button" id="shSignOut" type="button">Sign out</button></aside><div id="shAccountPanel"></div></div>');
 $('shSignOut').onclick=async e=>{
  const button=e.currentTarget, label=(window.SHOPYHAT_I18N?.sourceText(button)||button.textContent);
  button.disabled=true;button.textContent='Signing out…';
  try{
   const {error}=await db.auth.signOut();
   if(error)throw error;
   signedUser=null;profile=null;profileExists=false;clearInterval(inboxTimer);inboxTimer=null;
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
function orderDate(value){
 return new Date(value).toLocaleString('en-BD',{timeZone:'Asia/Dhaka',day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'});
}
async function ordersView(version,page=0){
 const {data,error}=await db.rpc('sh_customer_order_history',{p_page:page});
 if(!isCurrentTab('orders',version))return;
 if(error)throw error;
 const orders=Array.isArray(data)?data:[];
 panel('<h3>Order history</h3><p class="sh-account-note">See your account orders, track delivery or get help with an order. To find a guest order, <a href="/#track">track it by order number and mobile</a>.</p>'+
 (orders.length?orders.slice(0,20).map(o=>'<article class="sh-order-card"><div class="sh-order-heading"><div><strong>'+esc(o.order_number)+'</strong><small>'+esc(orderDate(o.created_at))+'</small></div><strong>'+money(o.total)+'</strong></div><div class="sh-order-facts"><span>Status: '+esc(o.status||'Pending')+'</span>'+(o.payment_status?'<span>Payment: '+esc(o.payment_status)+'</span>':'')+'</div><div class="sh-order-actions"><button type="button" class="sh-account-secondary" data-track-order="'+esc(o.order_number)+'">Track order</button><a class="sh-account-secondary" href="/#care/report/'+encodeURIComponent(o.order_number)+'">Report an issue</a></div></article>').join(''):(page===0?'<p>No orders yet.</p><a class="btn" href="/#shop">Start shopping</a>':'<p>There are no more orders.</p>'))+
 (page>0||orders.length>20?'<div class="sh-order-pages">'+(page>0?'<button id="shOrdersPrev" class="sh-account-secondary" type="button">Previous</button>':'')+'<span>Page '+(page+1)+'</span>'+(orders.length>20?'<button id="shOrdersNext" class="sh-account-secondary" type="button">Next</button>':'')+'</div>':''));
 const go=async (event,nextPage)=>{
  const button=event.currentTarget;button.disabled=true;
  try{await ordersView(version,nextPage);if(isCurrentTab('orders',version))$('shAccountPanel').scrollIntoView({block:'start'})}
  catch{if(isCurrentTab('orders',version))message('Could not load that page. Please try again.',true)}
  finally{button.disabled=false}
 };
 if($('shOrdersPrev'))$('shOrdersPrev').onclick=e=>go(e,page-1);
 if($('shOrdersNext'))$('shOrdersNext').onclick=e=>go(e,page+1);
 document.querySelectorAll('[data-track-order]').forEach(button=>button.onclick=()=>{
  const number=button.dataset.trackOrder;
  const order=orders.find(o=>o.order_number===number);
  const mobile=normalPhone(order?.customer_phone)||'';
  history.pushState(null,'','/#track');
  window.dispatchEvent(new Event('hashchange'));
  const input=$('tId'),phoneInput=$('tPhone');
  if(input)input.value=number;
  if(phoneInput)phoneInput.value=mobile;
  if(mobile)$('trackForm')?.requestSubmit();
  else phoneInput?.focus();
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
const addressFieldId=(prefix,key)=>key==='line'&&prefix==='k'?'kAddr':prefix+addressKeys[key];
function addressFields(prefix,structured={},legacy=''){
 const address=structured&&Object.keys(addressKeys).some(key=>structured[key])?structured:{line:legacy};
 const name=key=>prefix+addressKeys[key];
 const id=key=>addressFieldId(prefix,key);
 const labelFor=(key,label,required)=>'<label for="'+id(key)+'">'+label+(required?' <span class="sh-required" aria-hidden="true">*</span>':' <span class="sh-optional">(optional)</span>')+'</label>';
 const input=(key,label,hint,limit,required)=>'<div class="sh-address-field fld">'+labelFor(key,label,required)+'<input id="'+id(key)+'" name="'+name(key)+'" value="'+esc(address[key]||'')+'" placeholder="'+hint+'" maxlength="'+limit+'"'+(required?' required':'')+'></div>';
 return (prefix==='k'?'':'<p class="sh-field-guide"><span aria-hidden="true">*</span> Required fields</p>')+'<div class="sh-address-grid"><div class="sh-address-field fld">'+labelFor('division','Division',true)+'<select id="'+id('division')+'" name="'+name('division')+'" required><option value="">Select division</option>'+divisions.map(division=>'<option'+(address.division===division?' selected':'')+'>'+division+'</option>').join('')+'</select></div>'+
 input('district','District','e.g. Dhaka',60,true)+input('thana','Thana / Upazila','e.g. Dhanmondi',70,true)+input('area','Area / Village','e.g. West Dhanmondi',80,false)+
 '<div class="sh-address-field sh-address-wide fld">'+labelFor('line','House, road or village details',true)+'<textarea id="'+id('line')+'" name="'+name('line')+'" rows="3" minlength="4" maxlength="400" placeholder="House and road, block, or village and local directions" required>'+esc(address.line||'')+'</textarea></div>'+
 input('landmark','Landmark or delivery point','e.g. Near the main gate',100,false)+'</div>';
}
function readAddress(form,prefix){
 return Object.fromEntries(Object.entries(addressKeys).map(([key,name])=>[key,String(form.elements.namedItem(prefix+name)?.value||'').trim()]));
}
function formatAddress(address){
 if(!address)return '';
 return [address.line,address.area,address.thana,address.district,address.division,address.landmark?'Landmark: '+address.landmark:''].filter(Boolean).join(', ');
}
function addressError(address,prefix){
 const error=(key,message)=>({id:addressFieldId(prefix,key),message});
 if(!divisions.includes(address.division))return error('division','Select your division.');
 if(!address.district)return error('district','Enter your district.');
 if(!address.thana)return error('thana','Enter your thana or upazila.');
 if(address.line.length<4)return error('line','Enter at least four characters of house, road or village details.');
 if(formatAddress(address).length>400)return error('line','Shorten your full address to 400 characters or fewer.');
 return null;
}
function savedAddresses(){
 if(profile?.saved_delivery_addresses?.length)return profile.saved_delivery_addresses;
 if(!profile?.preferred_address)return [];
 const address=profile.delivery_address;
 return [{id:'legacy',label:'Saved address',formatted:profile.preferred_address,address:address&&Object.keys(address).length?address:{line:profile.preferred_address}}];
}
function checkoutAddresses(){
 const addresses=savedAddresses();
 if(!addresses.length)return '';
 return '<div class="fld"><label for="kSavedAddress">Saved delivery address</label><select id="kSavedAddress">'+addresses.map((item,index)=>'<option value="'+esc(item.id)+'">'+esc(item.label+(index===0?' (default)':'')+' · '+item.formatted.slice(0,65))+'</option>').join('')+'<option value="">Enter a different address</option></select><small>Any edits here apply only to this order.</small></div>';
}
function bindCheckoutAddresses(form){
 const select=form.querySelector('#kSavedAddress');
 if(!select)return;
 select.onchange=()=>{
  const address=savedAddresses().find(item=>item.id===select.value)?.address;
  for(const [key,name] of Object.entries(addressKeys)){
   const field=form.elements.namedItem('k'+name);
   if(field)field.value=address?.[key]||'';
  }
  form.querySelectorAll('.fld.bad').forEach(field=>field.classList.remove('bad'));
  const error=form.querySelector('#kErr');if(error)error.textContent='';
 };
}
function saveFeedback(form,text,error=false){
 const status=form.querySelector('[role=status]');
 status.textContent=text;
 status.classList.toggle('error',error);
}
async function submitAccountChange(form,working,success,task){
 const button=form.querySelector('[type=submit]'),cancel=form.querySelector('#shCancelProfile,#shCancelAddress'),label=(window.SHOPYHAT_I18N?.sourceText(button)||button.textContent);
 button.disabled=true;button.textContent=working;
 if(cancel)cancel.disabled=true;
 saveFeedback(form,working);
 try{await task();saveFeedback(form,success)}
 catch(error){saveFeedback(form,error.message||'Could not save. Please try again.',true)}
 finally{button.disabled=false;button.textContent=label;if(cancel)cancel.disabled=false}
}
async function saveCustomerProfile(values){
 const owner=signedUser.id;
 const {data,error}=await db.rpc('sh_save_customer_profile',{p_changes:values}).single();
 if(error)throw error.code==='22023'||error.code==='42501'?Error(error.message):Error('Could not save your changes. Try again in a moment.');
 if(!data)throw Error('Could not confirm the save. Reload My Account and try again.');
 if(signedUser?.id!==owner)return;
 profile=data;
 profileExists=true;
 const greeting=$('shAccountGreeting'),contact=$('shAccountContact');
 if(greeting)greeting.textContent='Hello, '+(profile.full_name||'Customer');
 if(contact)contact.textContent=accountContact();
 window.dispatchEvent(new Event('sh:account'));
}
const formStatus='<p class="sh-action-status" role="status" aria-live="polite"></p>';
async function loadActivity(host){
 const labels={full_name:'Name',phone:'Mobile number',delivery_address:'Delivery address'};
 try{
  const {data,error}=await db.from('sh_customer_profile_changes').select('id,fields,changed_at').order('changed_at',{ascending:false}).order('id',{ascending:false}).limit(20);
  if(error)throw error;
  host.innerHTML=data?.length?'<ul class="sh-profile-activity">'+data.map(item=>'<li><strong>'+esc(item.fields.map(key=>labels[key]).filter(Boolean).join(', '))+'</strong><time datetime="'+esc(item.changed_at)+'">'+esc(orderDate(item.changed_at))+'</time></li>').join('')+'</ul>':'<p>No profile changes recorded yet.</p>';
 }catch{host.textContent='Could not load recent changes. Reopen Profile to try again.'}
}
async function manageAddress(action,id=null,label=null,address=null){
 const owner=signedUser.id;
 const {data,error}=await db.rpc('sh_manage_delivery_address',{p_action:action,p_id:id,p_label:label,p_address:address}).single();
 if(error)throw Error(['22023','42501'].includes(error.code)?error.message:'Could not update your saved addresses. Try again.');
 if(!data)throw Error('Could not confirm the update. Reload My Account and try again.');
 if(signedUser?.id!==owner)return;
 profile=data;
 window.dispatchEvent(new Event('sh:account'));
}
function addressView(){
 if(!profileExists){
  panel('<h3>Delivery addresses</h3><p>Save your name and mobile number in Profile first.</p><a class="sh-account-secondary" href="#account/profile">Go to Profile</a>');
  return;
 }
 const list=savedAddresses();
 panel('<div class="sh-profile-heading"><h3>Delivery addresses</h3><button id="shEditAddress" class="sh-account-secondary" type="button"'+(list.length>=10?' disabled':'')+'>Add address</button></div><p>Save up to 10 addresses. Your default appears first at checkout, where you can choose a different one.</p>'+
 (list.length?list.map((item,index)=>'<article class="sh-profile-summary"><div class="sh-profile-heading"><strong>'+esc(item.label)+'</strong>'+(index===0?'<span class="sh-default-address">Default</span>':'')+'</div><p>'+esc(item.formatted)+'</p><div class="sh-order-actions"><button type="button" class="sh-account-secondary" data-address-action="edit" data-address-id="'+esc(item.id)+'">Edit address</button>'+(index?'<button type="button" class="sh-account-secondary" data-address-action="default" data-address-id="'+esc(item.id)+'">Make default</button>':'')+'<button type="button" class="sh-account-secondary" data-address-action="delete" data-address-id="'+esc(item.id)+'">Remove</button></div></article>').join(''):'<p>No delivery addresses saved yet.</p>'));
 $('shEditAddress').onclick=()=>editAddressView();
 const host=$('shAccountPanel');
 host.querySelectorAll('[data-address-action]').forEach(button=>button.onclick=async()=>{
  const item=list.find(entry=>entry.id===button.dataset.addressId);
  if(!item)return;
  const action=button.dataset.addressAction;
  if(action==='edit')return editAddressView(item);
  if(action==='delete'&&!window.confirm(window.SHOPYHAT_I18N?.text('Remove this saved address from your account?')||'Remove this saved address from your account?'))return;
  const controls=Array.from(host.querySelectorAll('button')).filter(control=>!control.disabled);
  controls.forEach(control=>control.disabled=true);
  message(action==='delete'?'Removing address…':'Updating default…');
  try{
   await manageAddress(action,item.id);
   if(currentTab==='address'&&button.isConnected){addressView();message(action==='delete'?'Address removed.':'Default address updated.');$('shEditAddress')?.focus()}
  }catch(error){if(button.isConnected)message(error.message,true)}
  finally{controls.forEach(control=>control.disabled=false)}
 });
}
function editAddressView(item){
 message('');
 panel('<h3>'+(item?'Edit delivery address':'Add delivery address')+'</h3><p>Enter enough detail for the courier to find you.</p><form id="shAddressForm" novalidate><label for="shAddressLabel">Address label <span class="sh-optional">(optional)</span><input id="shAddressLabel" maxlength="40" placeholder="Home, office, or another name" value="'+esc(item?.label||'')+'"></label>'+addressFields('account',item?.address)+formButton('Save address')+' <button id="shCancelAddress" type="button" class="sh-account-secondary">Cancel</button>'+formStatus+'</form>');
 $('shCancelAddress').onclick=()=>{addressView();$('shEditAddress')?.focus()};
 $('shAddressLabel')?.focus();
 $('shAddressForm').onsubmit=async e=>{
  e.preventDefault();
  const form=e.currentTarget,address=readAddress(form,'account'),invalid=addressError(address,'account');
  if(invalid){$(invalid.id)?.focus();return saveFeedback(form,invalid.message,true)}
  await submitAccountChange(form,'Saving…','Address saved.',async()=>{
   await manageAddress('save',item?.id,$('shAddressLabel').value.trim(),address);
   if(form.isConnected){addressView();message('Address saved.');$('shEditAddress')?.focus()}
  });
 };
}
function profileView(){
 panel('<div class="sh-profile-heading"><h3>Profile</h3><button id="shEditProfile" class="sh-account-secondary" type="button">Edit profile</button></div><p>Manage your contact details for delivery and support.</p><dl class="sh-profile-details"><div><dt>Full name</dt><dd>'+esc(profile?.full_name||'Not added')+'</dd></div><div><dt>Mobile number</dt><dd>'+esc(normalPhone(profile?.phone)||'Not added')+'</dd></div><div><dt>Sign-in email</dt><dd>'+esc(signedUser.email||'Not added')+'</dd></div></dl><h4>Recent changes</h4><div id="shProfileActivity" role="status">Loading recent changes…</div>');
 $('shEditProfile').onclick=editProfileView;
 loadActivity($('shProfileActivity'));
}
function editProfileView(){
 panel('<h3>Edit profile</h3><p>Enter the mobile number you want us to use for deliveries and support. Your sign-in email stays the same.</p><form id="shProfileForm">'+field('full_name','Full name','text','autocomplete="name" minlength="2" maxlength="120" value="'+esc(profile?.full_name||'')+'"')+field('phone','Mobile number','tel','autocomplete="tel" maxlength="20" placeholder="01XXXXXXXXX" value="'+esc(normalPhone(profile?.phone)||'')+'"')+'<p>Use a Bangladesh mobile number, for example 01XXXXXXXXX.</p>'+formButton('Save changes')+' <button id="shCancelProfile" type="button" class="sh-account-secondary">Cancel</button>'+formStatus+'</form>');
 $('shCancelProfile').onclick=()=>{profileView();$('shEditProfile')?.focus()};
 $('shProfileForm').elements.namedItem('full_name')?.focus();
 $('shProfileForm').onsubmit=async e=>{
  e.preventDefault();
  const form=e.currentTarget,fields=new FormData(form),name=String(fields.get('full_name')||'').trim(),phone=normalPhone(fields.get('phone'));
  if(name.length<2)return saveFeedback(form,'Enter a name with at least 2 characters.',true);
  if(!phone){form.elements.namedItem('phone')?.focus();return saveFeedback(form,'Enter a valid Bangladesh mobile number.',true)}
  const changes={};
  if(!profileExists||name!==profile?.full_name)changes.full_name=name;
  if(!profileExists||phone!==normalPhone(profile?.phone))changes.phone='+88'+phone;
  if(!Object.keys(changes).length)return saveFeedback(form,'You have no changes to save.');
  await submitAccountChange(form,'Saving…','Profile updated.',async()=>{
   await saveCustomerProfile(changes);
   if(form.isConnected){profileView();message('Profile updated.');$('shEditProfile')?.focus()}
  });
 };
}
function securityView(){
 panel('<h3>Security</h3><p>Change the password you use to sign in.</p><form id="shPasswordForm">'+passInput('password','New password','new-password')+passwordStrengthMarkup('shSecurityStrength')+passInput('confirm','Confirm new password','new-password')+formButton('Update password')+formStatus+'</form>');
 bindPassword();
 connectPasswordGuide($('shPasswordForm'),'shSecurityStrength');
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

