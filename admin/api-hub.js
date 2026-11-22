/* Provider-neutral API Hub — separate inbound and outbound connection credentials. */
export function mountApiHub({panel,db,notify}){
 const root=panel.querySelector('[data-reseller-panel="courier"]');
 if(!root)return{refresh(){}};
 root.innerHTML=`<div class="api-hub">
 <div class="topline"><div><h3>API Connections</h3><p class="muted">Connect to any supported external service or give an authorized partner access to SHOPYHAT. No fixed courier provider and no automatic shipment booking.</p></div><button type="button" class="btn small" id="apiHubRefresh">Refresh</button></div>
 <div class="api-hub-tabs" role="group" aria-label="Integration directions"><button type="button" data-api-tab="out" class="active">Outbound · Connect to others</button><button type="button" data-api-tab="in">Inbound · Partners connect to SHOPYHAT</button><button type="button" data-api-tab="guide">Setup Guide</button></div>
 <section id="apiHubOut"><div class="api-hub-grid"><form class="api-hub-card" id="apiConnectionForm"><h4>Create an API Connection</h4><p class="muted">Add details from your provider's API documentation. Saved secrets are encrypted and never shown again.</p>
 <label>Connection name<input name="display_name" required minlength="2" maxlength="100" placeholder="My courier or business service"></label>
 <label>Provider API Base URL<input name="base_url" required inputmode="url" placeholder="https://api.provider.com" maxlength="300"></label>
 <label>Connection test endpoint (GET)<input name="test_path" required value="/health" placeholder="/health" maxlength="180"></label>
 <label>Authentication<select name="auth_mode"><option value="none">No authentication</option><option value="bearer">Bearer Token</option><option value="api_key">API Key Header</option><option value="dual_headers">API Key + Secret Headers</option></select></label>
 <div class="api-hub-double"><label>API Key header name<input name="key_header" value="Api-Key" maxlength="70"></label><label>Secret header name<input name="secret_header" value="Secret-Key" maxlength="70"></label></div>
 <label>API Key / Access Token<input name="token" type="password" autocomplete="off" maxlength="1000" placeholder="Stored securely; leave blank to retain"></label>
 <label>Secret Key (when required)<input name="secret" type="password" autocomplete="off" maxlength="1000" placeholder="Stored securely; leave blank to retain"></label>
 <p class="muted">Only publicly accessible HTTPS endpoints can be tested. No credentials appear in the browser after saving. A successful test confirms only endpoint connectivity, not shipment booking compatibility.</p>
 <div class="tools"><button type="submit" class="btn primary">Save Connection</button><button type="reset" class="btn">Clear</button></div></form>
 <div class="api-hub-card"><h4>Saved Outbound Connections</h4><p class="muted">Each provider has independent credentials and connection status.</p><div id="apiOutboundList" class="api-hub-list">Loading…</div></div></div></section>
 <section id="apiHubIn" hidden><div class="api-hub-grid"><div class="api-hub-card"><h4>Give a partner access to SHOPYHAT</h4><p class="muted">Create a unique, revocable API key. You control which partner has access; no order/customer API scopes are enabled in this release.</p><form id="apiNewPartnerForm"><label>Partner / Company Name<input name="display_name" minlength="2" maxlength="100" required placeholder="Partner company"></label><button class="btn primary" type="submit">Generate Partner API Key</button></form>
 <div id="apiOneTimeKey" hidden class="api-key-reveal"><strong>One-time API Key</strong><p>Copy this now and share privately. It cannot be viewed again.</p><code id="apiKeyValue"></code><div class="tools"><button class="btn primary" type="button" id="apiCopyKey">Copy Key</button><button class="btn" type="button" id="apiHideKey">Hide</button></div></div>
 <p><strong>Partner Health Endpoint</strong></p><code class="api-endpoint">https://xwfqgmgiunlxzvzoermn.supabase.co/functions/v1/shopyhat-partner-api/health</code><p class="muted">GET header: <code>x-shopyhat-api-key: YOUR_KEY</code>. Other endpoints return 404 until separately configured.</p></div>
 <div class="api-hub-card"><h4>Authorized Partners</h4><div id="apiInboundList" class="api-hub-list">Loading…</div></div></div></section>
 <section id="apiHubGuide" hidden class="api-hub-card"><h4>Connection Setup · 4 Steps</h4><ol>
 <li>Choose <strong>Outbound</strong> if SHOPYHAT needs to call another service; choose <strong>Inbound</strong> if a partner needs to call SHOPYHAT.</li>
 <li>For outbound, get the official API Base URL, a safe GET test path, authentication method, API key and any secret from that provider.</li>
 <li>Save the connection. Click <strong>Test Connection</strong>. Verify provider-specific API docs before enabling shipment/label/tracking operations.</li>
 <li>For inbound, issue a partner-specific key and send it privately. Revoke immediately if compromised. New permissions for order or customer data require a separate reviewed API contract.</li></ol>
 <p class="muted">OAuth client-credentials, signed webhooks, token refresh, bulk dispatch and custom payload mapping require provider-specific adapters. The generic form does not claim they are already supported.</p></section>
 <p id="apiHubMsg" class="msg" role="status" aria-live="polite"></p></div>`;
 const $=id=>document.getElementById(id);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let view='out';
 function message(txt,bad=false){const el=$('apiHubMsg');el.textContent=txt;el.classList.toggle('error',bad)}
 function show(key){view=key;for(const tab of ['out','in','guide']){$('apiHub'+(tab==='out'?'Out':tab==='in'?'In':'Guide')).hidden=tab!==key}root.querySelectorAll('[data-api-tab]').forEach(b=>b.classList.toggle('active',b.dataset.apiTab===key))}
 root.querySelectorAll('[data-api-tab]').forEach(b=>b.onclick=()=>show(b.dataset.apiTab));
 async function request(action,rest={}){
  const {data:{session},error}=await db.auth.getSession();
  if(error||!session?.access_token)throw Error('Admin login expired');
  const resp=await fetch('https://xwfqgmgiunlxzvzoermn.supabase.co/functions/v1/shopyhat-api-hub',{method:'POST',cache:'no-store',headers:{
   'content-type':'application/json','apikey':'sb_publishable_Tk-PzYsM3YxnDsjicnMdzQ_mQsREdkP','authorization':'Bearer '+session.access_token
  },body:JSON.stringify({action,...rest})});
  const result=await resp.json().catch(()=>({error:'Unexpected API response'}));
  if(!resp.ok||!result.ok)throw Error(result.error||'Connection operation failed');
  return result;
 }
 function renderConnections(items){
  const host=$('apiOutboundList');host.replaceChildren();
  if(!items.length){host.textContent='No API connections configured yet.';return}
  for(const item of items){
   const row=document.createElement('div');row.className='api-hub-entry';
   const top=document.createElement('div');top.innerHTML='<strong>'+esc(item.display_name)+'</strong><small>'+esc(item.base_url)+'</small><small>Auth: '+esc(item.auth_mode)+' · '+(item.active?'Connected':'Not connected')+'</small>';
   const actions=document.createElement('div');actions.className='tools';
   const test=document.createElement('button');test.className='btn small';test.type='button';test.textContent='Test Connection';test.onclick=async()=>{
    test.disabled=true;try{const r=await request('test_connection',{id:item.id});message(r.message+(r.status_code?' (HTTP '+r.status_code+')':''),!r.success);await refresh()}catch(e){message(e.message,true)}finally{test.disabled=false}
   };
   const disable=document.createElement('button');disable.className='btn small';disable.type='button';disable.textContent='Disable';disable.disabled=!item.active;
   disable.onclick=async()=>{if(!confirm('Disable this connection?'))return;try{await request('disable_connection',{id:item.id});message('Connection disabled.');await refresh()}catch(e){message(e.message,true)}};
   actions.append(test,disable);row.append(top,actions);host.append(row);
  }
 }
 function renderClients(items){
  const host=$('apiInboundList');host.replaceChildren();
  if(!items.length){host.textContent='No partner API keys yet.';return}
  for(const client of items){
   const row=document.createElement('div');row.className='api-hub-entry';
   const info=document.createElement('div');info.innerHTML='<strong>'+esc(client.display_name)+'</strong><small>'+(client.active?'Active key':'Revoked')+' · Issued '+new Date(client.created_at).toLocaleDateString('en-BD')+'</small>';
   const action=document.createElement('button');action.type='button';action.className='btn small';action.textContent='Revoke';action.disabled=!client.active;
   action.onclick=async()=>{if(!confirm('Revoke this partner key immediately?'))return;try{await request('revoke_client',{id:client.id});message('Partner key revoked.');await refresh()}catch(e){message(e.message,true)}};
   row.append(info,action);host.append(row);
  }
 }
 async function refresh(){
  try{const data=await request('list');renderConnections(data.connections||[]);renderClients(data.clients||[])}
  catch(e){message(e.message,true)}
 }
 $('apiHubRefresh').onclick=refresh;
 $('apiConnectionForm').onsubmit=async event=>{
  event.preventDefault();const form=event.currentTarget,button=form.querySelector('[type=submit]');button.disabled=true;
  const f=new FormData(form);const input=Object.fromEntries(f.entries());
  try{const data=await request('save_connection',input);message(data.message||'Connection saved.');form.reset();renderConnections(data.connections||[])}
  catch(e){message(e.message,true)}finally{button.disabled=false}
 };
 $('apiNewPartnerForm').onsubmit=async event=>{
  event.preventDefault();const form=event.currentTarget,button=form.querySelector('[type=submit]');button.disabled=true;
  try{const res=await request('create_client',{display_name:form.elements.display_name.value});$('apiKeyValue').textContent=res.key;$('apiOneTimeKey').hidden=false;form.reset();renderClients(res.clients||[]);message('Partner key created. Copy it now.')}
  catch(e){message(e.message,true)}finally{button.disabled=false}
 };
 $('apiCopyKey').onclick=async()=>{try{await navigator.clipboard.writeText($('apiKeyValue').textContent);message('Partner key copied. Share privately.')}catch{message('Clipboard unavailable. Copy manually.',true)}};
 $('apiHideKey').onclick=()=>{$('apiKeyValue').textContent='';$('apiOneTimeKey').hidden=true};
 const style=document.createElement('style');style.textContent=`
 .api-hub-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0;border-bottom:1px solid #eadbce;padding-bottom:12px}.api-hub-tabs button{border:1px solid #e2d5c8;background:#fff;padding:11px 14px;border-radius:9px;cursor:pointer;font-size:12px;font-weight:700}.api-hub-tabs button.active{background:#f47721;color:#fff;border-color:#f47721}
 .api-hub-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}.api-hub-card{background:#fffaf5;border:1px solid #e5d7ca;border-radius:14px;padding:18px;min-width:0}.api-hub-card h4{margin:0 0 12px;font-size:17px}.api-hub-card label{display:block;font-size:12px;font-weight:700;margin:12px 0 4px}.api-hub-card input,.api-hub-card select{display:block;width:100%;min-height:43px;padding:10px;border:1px solid #dac7b7;border-radius:9px;margin-top:6px;background:#fff}.api-hub-double{display:grid;grid-template-columns:1fr 1fr;gap:12px}.api-hub-card code{overflow-wrap:anywhere;font-size:12px}.api-hub-entry{padding:14px 0;border-bottom:1px solid #eddfd3;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.api-hub-entry strong,.api-hub-entry small{display:block;overflow-wrap:anywhere}.api-hub-entry small{color:#736053;margin-top:5px;font-size:11px}.api-hub-list{max-height:520px;overflow:auto}.api-key-reveal{background:#ffefd8;border:1px solid #ebbc82;border-radius:12px;padding:14px;margin:15px 0}.api-endpoint{display:block;max-width:100%;background:#eee1d4;padding:10px;border-radius:7px}.api-hub-card .tools{display:flex;flex-wrap:wrap;gap:7px}.api-hub-card li{margin:12px 0;font-size:13px;line-height:1.7}
 @media(max-width:920px){.api-hub-grid{grid-template-columns:1fr}}@media(max-width:520px){.api-hub-double{grid-template-columns:1fr}.api-hub-tabs button{flex:1 1 135px}}
 `;document.head.append(style);
 refresh();
 return{refresh,show};
}
