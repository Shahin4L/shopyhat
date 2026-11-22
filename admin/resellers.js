/* SHOPYHAT Reseller Operations — staff-only approvals, wholesale pricing and fulfillment queue. */
export function setupResellerOperations({db,roleCan,notify}){
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=n=>'৳'+Number(n||0).toLocaleString('en-BD',{maximumFractionDigits:2});
 const allowed=()=>roleCan('owner','manager');
 let accounts=[],products=[],prices=[],orders=[],referrals=[];
 function mount(){
  if($('resellerTab'))return;
  const nav=$('nav'),target=nav.querySelector('[data-page="promos"]')||nav.querySelector('[data-page="experience"]');
  const tab=document.createElement('button');tab.id='resellerTab';tab.className='btn';tab.type='button';tab.dataset.page='resellers';tab.textContent='Resellers';
  target?.after(tab);tab.onclick=()=>window.SHOPYHAT_SHOW_PAGE?.('resellers');
  const panel=document.createElement('section');panel.id='page-resellers';panel.className='panel hidden';
  panel.innerHTML=`<div class="topline"><div><h2>Reseller & Fulfillment Studio</h2><p class="muted">Approve reseller accounts, set wholesale prices and review customer fulfillment requests.</p></div><button id="resellerRefresh" type="button" class="btn">Refresh</button></div>
  <h3>Reseller Applications</h3><div class="scroll"><table><thead><tr><th>Business</th><th>Status</th><th>Registered</th><th>Decision</th></tr></thead><tbody id="resellerAccounts"></tbody></table></div>
  <h3>Reseller Product Pricing</h3><p class="muted">Wholesale prices are accessible only to approved resellers. Set a price at or below the public selling price.</p>
  <div class="scroll"><table><thead><tr><th>Product</th><th>Public Selling Price</th><th>Reseller Wholesale Price</th><th>Publish</th><th>Save</th></tr></thead><tbody id="resellerPrices"></tbody></table></div>
  <h3>Customer Fulfillment Requests</h3><p class="muted">Reseller requests are not paid orders. Review payment collection, shipping and settlement separately.</p>
  <div class="scroll"><table><thead><tr><th>Reseller</th><th>Customer</th><th>Quantity</th><th>Retail</th><th>Wholesale</th><th>Margin</th><th>Request Status</th><th>Settlement</th><th>Update</th></tr></thead><tbody id="resellerOrders"></tbody></table></div>
  <h3>Referral Link Orders</h3><p class="muted">Attributed margin is provisional. Approve settlement only after the SHOPYHAT order is delivered and payment is verified.</p>
  <div class="scroll"><table><thead><tr><th>Reseller</th><th>Order ID</th><th>Net eligible sale</th><th>Wholesale</th><th>Margin</th><th>Referral status</th><th>Update</th></tr></thead><tbody id="resellerReferrals"></tbody></table></div><p id="resellerMsg" class="msg" role="status"></p>`;
  $('dashboard').append(panel);
  $('resellerRefresh').onclick=reload;
  panel.addEventListener('click',async e=>{
   const target=e.target.closest('[data-reseller-action]');if(!target||!allowed())return;
   const action=target.dataset.resellerAction,id=target.dataset.id;
   target.disabled=true;
   try{
    if(action==='account'){
     const status=target.dataset.status;
     if(!['approved','suspended','rejected'].includes(status))throw Error('Invalid reseller status');
     const {error}=await db.from('sh_reseller_accounts').update({status,approved_at:status==='approved'?new Date().toISOString():null}).eq('user_id',id);
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
 async function reload(){
  if(!allowed())return;
  try{
   const [a,p,r,o,rf]=await Promise.all([
    db.from('sh_reseller_accounts').select('*').order('created_at',{ascending:false}).limit(200),
    db.from('sh_products').select('id,name,base_price,status').eq('status','active').limit(250),
    db.from('sh_reseller_prices').select('*').limit(250),
    db.from('sh_reseller_fulfillment_requests').select('*').order('created_at',{ascending:false}).limit(100),
    db.from('sh_reseller_referrals').select('*').order('created_at',{ascending:false}).limit(100)
   ]);
   for(const q of [a,p,r,o,rf])if(q.error)throw q.error;
   accounts=a.data||[];products=p.data||[];prices=r.data||[];orders=o.data||[];referrals=rf.data||[];
   $('resellerAccounts').innerHTML=accounts.map(x=>`<tr><td><b>${esc(x.business_name||'New reseller')}</b><div class="muted">${esc(x.user_id)}</div></td><td>${esc(x.status)}</td><td>${new Date(x.created_at).toLocaleDateString('en-BD')}</td>
    <td><div class="tools"><button type="button" class="btn small" data-reseller-action="account" data-status="approved" data-id="${esc(x.user_id)}">Approve</button><button type="button" class="btn small" data-reseller-action="account" data-status="suspended" data-id="${esc(x.user_id)}">Suspend</button><button type="button" class="btn small danger" data-reseller-action="account" data-status="rejected" data-id="${esc(x.user_id)}">Reject</button></div></td></tr>`).join('')||'<tr><td colspan="4">No reseller applications.</td></tr>';
   $('resellerPrices').innerHTML=products.map(x=>{
    const p=prices.find(p=>p.product_id===x.id),retail=Number(x.base_price);
    return `<tr><td>${esc(x.name)}</td><td>${money(retail)}</td><td><input data-price-value type="number" step="0.01" min="0" max="${retail}" value="${p?Number(p.wholesale_price):retail}" aria-label="Wholesale price for ${esc(x.name)}"></td><td><input data-price-active type="checkbox" ${p?.active?'checked':''} style="width:auto"></td><td><button type="button" class="btn small" data-reseller-action="price" data-id="${esc(x.id)}" data-public-price="${retail}">Save</button></td></tr>`;
   }).join('')||'<tr><td colspan="5">No active products.</td></tr>';
   const statusOpts=['pending','approved','rejected','fulfilled','cancelled'],settlementOpts=['unsettled','pending','settled'];
   const dropdown=(key,values,current)=>'<select data-'+key+' aria-label="'+key+'">'+values.map(v=>'<option value="'+v+'" '+(current===v?'selected':'')+'>'+v+'</option>').join('')+'</select>';
   $('resellerOrders').innerHTML=orders.map(x=>`<tr><td>${esc(accounts.find(a=>a.user_id===x.reseller_id)?.business_name||x.reseller_id.slice(0,8))}</td><td>${esc(x.customer_name)}<small class="muted">${esc(x.customer_phone)}</small><small class="muted">${esc(x.delivery_address)}</small></td><td>${x.quantity}</td><td>${money(x.retail_unit_price)}</td><td>${money(x.wholesale_unit_price)}</td><td>${money(x.margin_total)}</td><td>${dropdown('request-status',statusOpts,x.status)}</td><td>${dropdown('request-settlement',settlementOpts,x.settlement_status)}</td><td><button type="button" class="btn small" data-reseller-action="request" data-id="${esc(x.id)}">Save</button></td></tr>`).join('')||'<tr><td colspan="9">No fulfillment requests yet.</td></tr>';
   const referralStatuses=['pending','approved','rejected','settled'];
   $('resellerReferrals').innerHTML=referrals.map(x=>`<tr><td>${esc(accounts.find(a=>a.user_id===x.reseller_id)?.business_name||x.reseller_id.slice(0,8))}</td>
    <td>${esc(x.order_id)}</td><td>${money(x.retail_net)}</td><td>${money(x.wholesale_total)}</td><td><b>${money(x.margin_total)}</b></td>
    <td>${dropdown('ref-status',referralStatuses,x.status)}</td><td><button class="btn small" type="button" data-reseller-action="referral" data-id="${esc(x.id)}">Save</button></td></tr>`).join('')||'<tr><td colspan="7">No referral-linked orders yet.</td></tr>';
   notify('resellerMsg',accounts.length+' resellers, '+orders.length+' fulfillment requests, '+referrals.length+' referral orders loaded.');
  }catch(e){notify('resellerMsg',e.message,true)}
 }
 return{mount,reload};
}
