/* SHOPYHAT Reseller Operations — staff-only approvals, wholesale pricing and fulfillment queue. */
export function setupResellerOperations({db,roleCan,notify}){
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=n=>'৳'+Number(n||0).toLocaleString('en-BD',{maximumFractionDigits:2});
 const allowed=()=>roleCan('owner','manager');
 let accounts=[],orders=[],referrals=[],applications=[],pricePage=0,priceTotal=0,activeSubpage='applications';
 const pricingPageSize=20;
 const uniqueLogin=()=>('sh'+crypto.randomUUID().replace(/-/g,'').slice(0,9));
 function mount(){
  if($('resellerTab'))return;
  const nav=$('nav'),target=nav.querySelector('[data-page="promos"]')||nav.querySelector('[data-page="experience"]');
  const tab=document.createElement('button');tab.id='resellerTab';tab.className='btn';tab.type='button';tab.dataset.page='resellers';tab.textContent='Resellers';
  target?.after(tab);tab.onclick=()=>window.SHOPYHAT_SHOW_PAGE?.('resellers');
  const panel=document.createElement('section');panel.id='page-resellers';panel.className='panel hidden';
  panel.innerHTML=`<div class="topline"><div><h2>Reseller & Fulfillment Studio</h2><p class="muted">Approve reseller accounts, set wholesale prices and review customer fulfillment requests.</p></div><button id="resellerRefresh" type="button" class="btn">Refresh</button></div>
  <div class="ops-filters" aria-label="Reseller date and status filters">
  <div class="date-field"><label for="resellerFrom">From</label><input id="resellerFrom" type="date"></div>
  <div class="date-field"><label for="resellerTo">To</label><input id="resellerTo" type="date"></div>
  <div class="date-field"><label for="resellerState">Account / Request Status</label><select id="resellerState"><option value="">All Statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="suspended">Suspended</option><option value="rejected">Rejected</option><option value="fulfilled">Fulfilled</option><option value="settled">Settled</option></select></div>
  <div class="range-actions"><button type="button" class="btn small" data-reseller-range="7">7 Days</button><button type="button" class="btn small" data-reseller-range="30">30 Days</button><button type="button" class="btn small" data-reseller-range="90">90 Days</button><button type="button" class="btn small" data-reseller-range="all">All</button></div>
  <p class="muted" style="width:100%;margin:0">Filters apply to applications, accounts, fulfillment and referral histories. Product wholesale pricing always shows the current catalog.</p></div>
  <h3>New Reseller Requests</h3><p class="muted">Review an application, choose a login ID and Shop URL. Admin creates the account and receives a one-time temporary password; no Supabase User UUID is required.</p>
<div id="resellerCredentials" class="media-section hidden" style="padding:18px;border:1px solid #e5b986;background:#fff8ef">
<div class="topline"><h3>One-time Reseller Access</h3><button class="btn small" type="button" id="resellerCredentialsClose">Hide</button></div>
<p><strong>Reseller ID: </strong><code id="resellerCreatedUsername"></code></p><p><strong>Temporary Password: </strong><code id="resellerCreatedPassword"></code></p>
<p class="muted">Copy this password now and share privately. Reseller must change it on first login. Passwords are never stored in this Admin interface.</p>
<div class="tools"><button type="button" class="btn primary" id="resellerCredentialsCopy">Copy Login Details</button><a href="/reseller/" target="_blank" rel="noopener" class="btn">Reseller Login</a></div></div>
  <div class="scroll"><table><thead><tr><th>Applicant</th><th>Mobile</th><th>Status</th><th>Admin action</th></tr></thead><tbody id="resellerApplications"></tbody></table></div>
  <h3>Approved Reseller Accounts</h3><div class="scroll"><table><thead><tr><th>Business</th><th>Status</th><th>Registered</th><th>Decision</th></tr></thead><tbody id="resellerAccounts"></tbody></table></div>
  <h3>Reseller Product Pricing</h3><p class="muted">Only enabled products appear in the reseller catalog. Search your full active catalog and publish exactly the items you want to offer.</p><div class="reseller-price-toolbar"><label>Search Product<input id="resellerPriceSearch" type="search" placeholder="Find a product by name" autocomplete="off"></label><label>Availability<select id="resellerPriceMode"><option value="all">All Active Products</option><option value="enabled">Enabled for Resellers</option><option value="disabled">Not Enabled</option></select></label></div><p id="resellerPriceCount" class="muted" role="status"></p>
  <div class="scroll"><table><thead><tr><th>Product</th><th>Public Selling Price</th><th>Reseller Wholesale Price</th><th>Publish</th><th>Save</th></tr></thead><tbody id="resellerPrices"></tbody></table></div><div class="reseller-price-paging"><button id="resellerPricePrev" class="btn small" type="button">← Previous</button><span id="resellerPricePageLabel">Page 1</span><button id="resellerPriceNext" class="btn small" type="button">Next →</button></div>
  <h3>Customer Fulfillment Requests</h3><p class="muted">Reseller requests are not paid orders. Review payment collection, shipping and settlement separately.</p>
  <div class="scroll"><table><thead><tr><th>Reseller</th><th>Customer</th><th>Quantity</th><th>Retail</th><th>Wholesale</th><th>Margin</th><th>Request Status</th><th>Settlement</th><th>Update</th></tr></thead><tbody id="resellerOrders"></tbody></table></div>
  <h3>Referral Link Orders</h3><p class="muted">Attributed margin is provisional. Approve settlement only after the SHOPYHAT order is delivered and payment is verified.</p>
  <div class="scroll"><table><thead><tr><th>Reseller</th><th>Order ID</th><th>Net eligible sale</th><th>Wholesale</th><th>Margin</th><th>Referral status</th><th>Update</th></tr></thead><tbody id="resellerReferrals"></tbody></table></div><p id="resellerMsg" class="msg" role="status"></p>`;
  // Create compact, keyboard-accessible subnavigation without duplicating the main Admin sidebar.
  const headings=[...panel.children].filter(node=>node.tagName==='H3');
  const labels=[['applications','Requests'],['accounts','Accounts'],['pricing','Product Pricing'],['fulfillment','Fulfillment'],['referrals','Referral Sales']];
  headings.forEach((heading,index)=>{
   const wrapper=document.createElement('section');wrapper.className='reseller-subpanel';wrapper.dataset.resellerPanel=labels[index][0];
   heading.before(wrapper);let node=heading;
   while(node&&node.tagName!=='H3' || node===heading){
    const next=node.nextElementSibling;wrapper.append(node);
    if(!next||next.tagName==='H3')break;node=next;
   }
  });
  const commonMessage=panel.querySelector('#resellerMsg');commonMessage?.remove();
  const courier=document.createElement('section');courier.className='reseller-subpanel';courier.dataset.resellerPanel='courier';
  courier.innerHTML='<h3>Courier API Connections</h3><p class="muted">Connect SHOPYHAT to a courier without exposing private API credentials in a browser. Manual booking means you decide exactly which order is sent.</p>'+
   '<div class="courier-setup"><div><h4>Steadfast Courier <span id="courierConnectionStatus" class="pill">Not checked</span></h4><p>API credentials are configured securely in Supabase Edge Function Secrets. Do not paste them into product forms or public pages.</p>'+
   '<div class="tools"><button id="courierStatusButton" type="button" class="btn">Check Configuration</button><button id="courierTestButton" type="button" class="btn">Test Connection</button></div><p id="courierMessage" class="msg" role="status"></p></div>'+
   '<div><h4>Setup Guide</h4><ol><li>Create or sign in to your <a target="_blank" rel="noopener" href="https://steadfast.com.bd/">Steadfast Merchant account</a>.</li><li>Request API credentials from the merchant panel/support.</li><li>Open <a target="_blank" rel="noopener" href="https://supabase.com/dashboard/project/xwfqgmgiunlxzvzoermn/settings/functions">Supabase Edge Function Secrets</a>.</li><li>Add <code>SHOPYHAT_STEADFAST_API_KEY</code> and <code>SHOPYHAT_STEADFAST_SECRET_KEY</code>.</li><li>Use Test Connection before booking orders. Shipping is never automatic.</li></ol><p class="muted">Credential setup is free from SHOPYHAT, but your courier account and delivery services may have costs.</p></div></div>'+
   '<h4>Book an Existing Confirmed Order</h4><p>Enter a SHOPYHAT order UUID. Verify customer address, payment method and order status first. A duplicate booking is blocked.</p><div class="courier-book-controls"><input id="courierOrderId" placeholder="Order UUID from Order Management" aria-label="SHOPYHAT order UUID"><button id="courierBookButton" class="btn primary" type="button">Book with Steadfast</button></div><p class="muted">Courier booking changes real logistics records. Confirm carefully; there is no automatic retry after an uncertain response.</p>';
  panel.append(courier);
  if(commonMessage)panel.append(commonMessage);
  const subnav=document.createElement('nav');subnav.className='reseller-subnav';subnav.setAttribute('aria-label','Reseller management');
  for(const [key,label] of [...labels,['courier','Courier API']]){
   const btn=document.createElement('button');btn.type='button';btn.className='btn small';btn.dataset.resellerGoto=key;btn.textContent=label;
   btn.onclick=()=>subpage(key);subnav.append(btn);
  }
  panel.querySelector('.topline')?.after(subnav);
  panel.querySelector('#resellerCredentials')?.classList.add('reseller-credentials-panel');
  function subpage(key){
   activeSubpage=key;
   panel.querySelectorAll('[data-reseller-panel]').forEach(el=>el.classList.toggle('hidden',el.dataset.resellerPanel!==key));
   panel.querySelectorAll('[data-reseller-goto]').forEach(btn=>{btn.classList.toggle('active',btn.dataset.resellerGoto===key);btn.setAttribute('aria-pressed',String(btn.dataset.resellerGoto===key))});
   const filter=panel.querySelector('.ops-filters');if(filter)filter.classList.toggle('hidden',['pricing','courier'].includes(key));
   if(key==='pricing')loadPrices();
   if(key==='courier')courierStatus(false);
  }
  subpage('applications');
  const css=document.createElement('style');css.textContent=`
  .reseller-subnav{display:flex;align-items:center;gap:8px;padding:11px 0 15px;margin:10px 0 14px;overflow-x:auto;border-bottom:1px solid #e8ddd1;scrollbar-width:thin}
  .reseller-subnav .btn{white-space:nowrap;flex:none;padding:10px 13px}.reseller-subnav .btn.active{background:#f47721;color:#fff;border-color:#f47721}
  .reseller-subpanel{min-width:0;animation:shResellerSlide .16s ease}.reseller-subpanel>h3{margin:12px 0}.reseller-subpanel>.scroll{border:1px solid #eee0d2;border-radius:13px}
  .reseller-price-toolbar{display:flex;flex-wrap:wrap;gap:12px;align-items:end;background:#faf6f0;padding:13px;border-radius:13px;margin:14px 0}.reseller-price-toolbar label{flex:1 1 195px;min-width:160px;margin:0}
  .reseller-price-paging{display:flex;align-items:center;justify-content:center;gap:12px;padding:16px}.reseller-action-details{border:1px solid #e9ded1;border-radius:10px;padding:9px;background:#fcfaf7;min-width:190px}
  .reseller-action-details summary{cursor:pointer;color:#9d501e;font-weight:700;padding:4px 0}.reseller-action-details .tools{margin-top:9px;display:flex;justify-content:flex-start}
  .reseller-action-details .tools .btn{flex:1 1 115px;min-height:38px}.reseller-action-details input{min-width:0;width:100%}
  .reseller-subpanel .scroll table{min-width:660px}.reseller-subpanel td{vertical-align:top;white-space:normal}
  .reseller-price-editor{display:flex;align-items:center;gap:6px}.reseller-price-editor input[type=number]{width:115px}
  .courier-setup{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px;margin:16px 0}.courier-setup>div{border:1px solid #e9ddd0;border-radius:13px;padding:16px;background:#fffaf5}
  .courier-setup h4{margin:0 0 9px}.courier-setup p{font-size:13px;color:#70665f}.courier-setup li{font-size:13px;line-height:1.7}
  .courier-book-controls{display:flex;align-items:center;gap:10px;max-width:670px}.courier-book-controls input{flex:1;min-width:0}.courier-book-controls button{min-height:43px}
  @keyframes shResellerSlide{from{opacity:.6;transform:translateY(4px)}to{opacity:1;transform:none}}
  @media(max-width:950px){.reseller-subnav{gap:5px}.courier-setup{grid-template-columns:1fr}.reseller-action-details{min-width:0}}
  @media(max-width:600px){.reseller-subpanel>.scroll table{min-width:620px}.courier-book-controls{flex-direction:column;align-items:stretch}.reseller-price-toolbar label{flex:1 1 100%}.reseller-subnav .btn{padding:9px 11px}.reseller-subpanel .scroll{margin-inline:-6px}}
  @media(prefers-reduced-motion:reduce){.reseller-subpanel{animation:none}}
  `;document.head.append(css);
  $('dashboard').append(panel);
  $('resellerRefresh').onclick=reload;
  $('resellerCredentialsClose').onclick=hideCredentials;
  $('resellerCredentialsCopy').onclick=async()=>{
   const text='SHOPYHAT Reseller Login\nURL: '+location.origin+'/reseller/\nLogin ID: '+$('resellerCreatedUsername').textContent+'\nTemporary Password: '+$('resellerCreatedPassword').textContent+'\nChange password on first login.';
   try{await navigator.clipboard.writeText(text);notify('resellerMsg','Credentials copied. Share privately.')}catch(e){notify('resellerMsg','Copy manually if browser clipboard is blocked.',true)}
  };
  for(const name of ['resellerFrom','resellerTo','resellerState'])$(name).addEventListener('change',renderFiltered);
  panel.querySelectorAll('[data-reseller-range]').forEach(b=>b.onclick=()=>{
   const mode=b.dataset.resellerRange,to=new Date(),from=new Date();
   from.setDate(from.getDate()-(Number(mode)||1)+1);
   const day=d=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
   $('resellerFrom').value=mode==='all'?'':day(from);$('resellerTo').value=mode==='all'?'':day(to);
   renderFiltered();
  });
  panel.addEventListener('submit',e=>{if(e.target.matches('.sh-provision-form')){e.preventDefault();provision(e.target)}});
  panel.addEventListener('click',async e=>{
   const target=e.target.closest('[data-reseller-action]');if(!target||!allowed())return;
   const action=target.dataset.resellerAction,id=target.dataset.id;
   target.disabled=true;
   try{
    if(action==='application-reject'){
     const {error}=await db.from('sh_reseller_applications').update({status:'rejected',updated_at:new Date().toISOString()}).eq('id',id);
     if(error)throw error;
    }else if(action==='account'){
     const status=target.dataset.status;
     if(!['approved','suspended','rejected'].includes(status))throw Error('Invalid reseller status');
     const {error}=await db.from('sh_reseller_accounts').update({status,approved_at:status==='approved'?new Date().toISOString():null}).eq('user_id',id);
     if(error)throw error;
    }else if(action==='reset-password'){
     if(!confirm('Reset this reseller password? Old password will stop working.'))return;
     const credentials=await credentialRequest('reset',{user_id:id});
     showCredentials(credentials);
    }else if(action==='slug'){
     const row=target.closest('tr'),slug=String(row.querySelector('[data-edit-slug]').value||'').trim().toLowerCase();
     if(!/^[a-z0-9][a-z0-9-]{2,39}$/.test(slug))throw Error('Shop URL must be 3–40 lowercase letters, digits or hyphens');
     const {error}=await db.from('sh_reseller_accounts').update({shop_slug:slug}).eq('user_id',id);
     if(error)throw error;
    }else if(action==='price'){
     const row=target.closest('tr'),amount=Number(row.querySelector('[data-price-value]').value);
     const active=row.querySelector('[data-price-active]').checked;
     const publicPrice=Number(target.dataset.publicPrice||0);
     if(!Number.isFinite(amount)||amount<0||amount>publicPrice)throw Error('Wholesale price must be between ৳0 and selling price');
     const {error}=await db.from('sh_reseller_prices').upsert({product_id:id,wholesale_price:amount,active,updated_at:new Date().toISOString()},{onConflict:'product_id'});
     if(error)throw error;
    }else if(action==='referral'){
     const row=target.closest('tr'),status=row.querySelector('[data-ref-status]').value;
     if(!['pending','approved','rejected','settled'].includes(status))throw Error('Invalid referral status');
     const {error}=await db.from('sh_reseller_referrals').update({status,settled_at:status==='settled'?new Date().toISOString():null}).eq('id',id);
     if(error)throw error;
    }else if(action==='request'){
     const row=target.closest('tr'),status=row.querySelector('[data-request-status]').value,settlement_status=row.querySelector('[data-request-settlement]').value;
     if(!['pending','approved','rejected','fulfilled','cancelled'].includes(status)||!['unsettled','pending','settled'].includes(settlement_status))throw Error('Invalid fulfillment status');
     const {error}=await db.from('sh_reseller_fulfillment_requests').update({status,settlement_status,updated_at:new Date().toISOString()}).eq('id',id);
     if(error)throw error;
    }
    await reload();notify('resellerMsg','Changes saved.');
   }catch(err){notify('resellerMsg',err.message,true)}finally{target.disabled=false}
  });
 }
 function hideCredentials(){
  $('resellerCreatedUsername').textContent='';$('resellerCreatedPassword').textContent='';
  $('resellerCredentials').classList.add('hidden');
 }
 function showCredentials(d){
  $('resellerCreatedUsername').textContent=d.username||'';
  $('resellerCreatedPassword').textContent=d.temporary_password||'';
  $('resellerCredentials').classList.remove('hidden');
  $('resellerCredentials').scrollIntoView({behavior:'smooth',block:'nearest'});
 }
 async function credentialRequest(action,params){
  const {data:{session},error}=await db.auth.getSession();
  if(error||!session?.access_token)throw Error('Admin login expired. Please sign in again.');
  const response=await fetch('https://xwfqgmgiunlxzvzoermn.supabase.co/functions/v1/shopyhat-reseller-access',{
    method:'POST',headers:{'Content-Type':'application/json','apikey':'sb_publishable_Tk-PzYsM3YxnDsjicnMdzQ_mQsREdkP','Authorization':'Bearer '+session.access_token},
    body:JSON.stringify({action,...params}),cache:'no-store'});
  const out=await response.json().catch(()=>({error:'Unexpected response'}));
  if(!response.ok||!out?.ok)throw Error(out.error||'Reseller access operation failed');
  return out;
 }
 function filtered(items){
  const from=$('resellerFrom')?.value||'',to=$('resellerTo')?.value||'',status=$('resellerState')?.value||'';
  if(from&&to&&from>to){notify('resellerMsg','From date must be before To date.',true);return []}
  return items.filter(x=>{
   if(status&&x.status!==status)return false;
   if(!from&&!to)return true;
   const date=x.created_at?new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(x.created_at)):'';
   return date&&(!from||date>=from)&&(!to||date<=to);
  });
 }
 function renderFiltered(){
  renderApplications();
  renderAccounts();
  renderOrdersAndReferrals();
 }
 function renderApplications(){
  const host=$('resellerApplications');if(!host)return;
  host.innerHTML=filtered(applications).map(a=>{
   const active=a.status==='pending';
   return '<tr><td><b>'+esc(a.full_name)+'</b><div>'+esc(a.business_name)+'</div><small>'+esc(a.email||'No email supplied')+'</small></td>'+
    '<td>'+esc(a.phone)+'</td><td>'+esc(a.status)+'</td><td>'+
    (active?'<form class="sh-provision-form" data-id="'+esc(a.id)+'" style="min-width:250px"><label>Reseller Login ID<input name="login" required pattern="[a-z][a-z0-9_]{3,23}" maxlength="24" placeholder="rahatshop"></label>'+
    '<label>Shop URL Alias<input name="slug" required pattern="[a-z0-9][a-z0-9-]{2,39}" maxlength="40" placeholder="rahat-shop"></label>'+
    
    '<small>Internal reseller identity: <b id="resellerAliasHint">[login]@reseller.shopyhat.com</b> when creating the Auth user.</small>'+
    '<div class="tools"><button type="submit" class="btn primary small">Create Reseller ID</button>'+
    '<button type="button" class="btn small danger" data-reseller-action="application-reject" data-id="'+esc(a.id)+'">Reject</button></div></form>':
     '<small>'+(a.reseller_id?'Linked User: '+esc(a.reseller_id):'No linked account')+'</small>')+'</td></tr>';
  }).join('')||'<tr><td colspan="4">No reseller registration requests yet.</td></tr>';
  host.querySelectorAll('.sh-provision-form').forEach(form=>{
   const login=form.elements.namedItem('login'),hint=form.querySelector('#resellerAliasHint');
   login.addEventListener('input',()=>hint.textContent=(login.value.trim().toLowerCase()||'[login]')+'@reseller.shopyhat.com');
  });
 }
 async function provision(form){
  if(!allowed())return;
  const app=applications.find(x=>x.id===form.dataset.id);
  if(!app||app.status!=='pending')return notify('resellerMsg','Application no longer pending.',true);
  const login=String(form.elements.namedItem('login').value||'').trim().toLowerCase();
  const slug=String(form.elements.namedItem('slug').value||'').trim().toLowerCase();
  if(!/^[a-z][a-z0-9_]{3,23}$/.test(login)||!/^[a-z0-9][a-z0-9-]{2,39}$/.test(slug))
   return notify('resellerMsg','Check login ID and Shop URL.',true);
  const submit=form.querySelector('[type=submit]');submit.disabled=true;
  try{
   hideCredentials();
   const credentials=await credentialRequest('create',{application_id:app.id,login_name:login,shop_slug:slug});
   await reload();
   showCredentials(credentials);
   notify('resellerMsg','New reseller account created successfully. Send the password privately.');
  }catch(err){notify('resellerMsg',err.message,true)}finally{submit.disabled=false}
 }
 function renderAccounts(){
   $('resellerAccounts').innerHTML=filtered(accounts).map(x=>`<tr><td><b>${esc(x.business_name||'Reseller')}</b><div class="muted">Login: ${esc(x.login_name||'Not configured')}</div><small>${esc(x.user_id)}</small></td>
    <td><span>${esc(x.status)}</span>${x.must_change_password?'<small class="muted">Password change required</small>':''}</td>
    <td>${new Date(x.created_at).toLocaleDateString('en-BD')}</td>
    <td><label>Shop URL <input data-edit-slug value="${esc(x.shop_slug||'')}" maxlength="40" placeholder="partner-shop"></label>
    <div class="tools"><button type="button" class="btn small" data-reseller-action="slug" data-id="${esc(x.user_id)}">Save URL</button>
    <button type="button" class="btn small" data-reseller-action="account" data-status="approved" data-id="${esc(x.user_id)}">Approve</button>
    <button type="button" class="btn small" data-reseller-action="account" data-status="suspended" data-id="${esc(x.user_id)}">Suspend</button>
    <button type="button" class="btn small" data-reseller-action="reset-password" data-id="${esc(x.user_id)}">Reset Password</button>
    <button type="button" class="btn small danger" data-reseller-action="account" data-status="rejected" data-id="${esc(x.user_id)}">Reject</button></div></td></tr>`).join('')||'<tr><td colspan="4">No reseller accounts created yet.</td></tr>';
 }
 function renderOrdersAndReferrals(){
   const statusOpts=['pending','approved','rejected','fulfilled','cancelled'],settlementOpts=['unsettled','pending','settled'];
   const dropdown=(key,values,current)=>'<select data-'+key+' aria-label="'+key+'">'+values.map(v=>'<option value="'+v+'" '+(current===v?'selected':'')+'>'+v+'</option>').join('')+'</select>';
   $('resellerOrders').innerHTML=filtered(orders).map(x=>`<tr><td>${esc(accounts.find(a=>a.user_id===x.reseller_id)?.business_name||x.reseller_id.slice(0,8))}</td><td>${esc(x.customer_name)}<small class="muted">${esc(x.customer_phone)}</small><small class="muted">${esc(x.delivery_address)}</small></td><td>${x.quantity}</td><td>${money(x.retail_unit_price)}</td><td>${money(x.wholesale_unit_price)}</td><td>${money(x.margin_total)}</td><td>${dropdown('request-status',statusOpts,x.status)}</td><td>${dropdown('request-settlement',settlementOpts,x.settlement_status)}</td><td><button type="button" class="btn small" data-reseller-action="request" data-id="${esc(x.id)}">Save</button></td></tr>`).join('')||'<tr><td colspan="9">No fulfillment requests yet.</td></tr>';
   const referralStatuses=['pending','approved','rejected','settled'];
   $('resellerReferrals').innerHTML=filtered(referrals).map(x=>`<tr><td>${esc(accounts.find(a=>a.user_id===x.reseller_id)?.business_name||x.reseller_id.slice(0,8))}</td>
    <td>${esc(x.order_id)}</td><td>${money(x.retail_net)}</td><td>${money(x.wholesale_total)}</td><td><b>${money(x.margin_total)}</b></td>
    <td>${dropdown('ref-status',referralStatuses,x.status)}</td><td><button class="btn small" type="button" data-reseller-action="referral" data-id="${esc(x.id)}">Save</button></td></tr>`).join('')||'<tr><td colspan="7">No referral-linked orders yet.</td></tr>';
 }
 async function reload(){
  if(!allowed())return;
  try{
   const [a,p,r,o,rf,apps]=await Promise.all([
    db.from('sh_reseller_accounts').select('*').order('created_at',{ascending:false}).limit(200),
    db.from('sh_products').select('id,name,base_price,status').eq('status','active').limit(250),
    db.from('sh_reseller_prices').select('*').limit(250),
    db.from('sh_reseller_fulfillment_requests').select('*').order('created_at',{ascending:false}).limit(100),
    db.from('sh_reseller_referrals').select('*').order('created_at',{ascending:false}).limit(100),
    db.from('sh_reseller_applications').select('*').order('created_at',{ascending:false}).limit(100)
   ]);
   for(const q of [a,p,r,o,rf,apps])if(q.error)throw q.error;
   accounts=a.data||[];products=p.data||[];prices=r.data||[];orders=o.data||[];referrals=rf.data||[];applications=apps.data||[];
   renderFiltered();
   $('resellerPrices').innerHTML=products.map(x=>{
    const p=prices.find(p=>p.product_id===x.id),retail=Number(x.base_price);
    return `<tr><td>${esc(x.name)}</td><td>${money(retail)}</td><td><input data-price-value type="number" step="0.01" min="0" max="${retail}" value="${p?Number(p.wholesale_price):retail}" aria-label="Wholesale price for ${esc(x.name)}"></td><td><input data-price-active type="checkbox" ${p?.active?'checked':''} style="width:auto"></td><td><button type="button" class="btn small" data-reseller-action="price" data-id="${esc(x.id)}" data-public-price="${retail}">Save</button></td></tr>`;
   }).join('')||'<tr><td colspan="5">No active products.</td></tr>';
   notify('resellerMsg',accounts.length+' resellers, '+orders.length+' fulfillment requests, '+referrals.length+' referral orders loaded.');
  }catch(e){notify('resellerMsg',e.message,true)}
 }
 return{mount,reload};
}
