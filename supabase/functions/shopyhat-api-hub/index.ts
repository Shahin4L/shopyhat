import {createClient} from 'npm:@supabase/supabase-js@2.49.10';
const endpoint=Deno.env.get('SUPABASE_URL'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(!endpoint||!service)throw Error('Server configuration missing');
const db=createClient(endpoint,service,{auth:{persistSession:false,autoRefreshToken:false}});
const permitted=/^https:\/\/(?:shopyhat\.pages\.dev|shopyhat-stage\.pages\.dev)$/i;
const headers=origin=>({'access-control-allow-origin':origin,'access-control-allow-methods':'POST,OPTIONS','access-control-allow-headers':'authorization,apikey,content-type','content-type':'application/json','cache-control':'no-store','vary':'Origin'});
const respond=(origin,body,status=200)=>new Response(JSON.stringify(body),{status,headers:headers(origin)});
const validId=s=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s||''));
const sha256=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const freshKey=()=>{const b=crypto.getRandomValues(new Uint8Array(32));return 'sh_live_'+Array.from(b,x=>x.toString(16).padStart(2,'0')).join('')};
const localIp=s=>{
 const ip=s.replace(/^\[|\]$/g,'').toLowerCase();
 if(ip.includes(':'))return true;
 if(!/^\d+\.\d+\.\d+\.\d+$/.test(ip))return false;
 const p=ip.split('.').map(Number);
 return p.some(x=>x>255)||p[0]===0||p[0]===10||p[0]===127||p[0]>=224||p[0]===169&&p[1]===254||p[0]===172&&p[1]>=16&&p[1]<=31||p[0]===192&&p[1]===168||p[0]===100&&p[1]>=64&&p[1]<=127||p[0]===192&&p[1]===0;
};
async function validateDestination(raw,path){
 const u=new URL(String(raw||''));
 if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443'||u.search||u.hash)throw Error('Use a clean HTTPS base URL on port 443');
 const hostname=u.hostname.toLowerCase();
 if(hostname.length>253||hostname==='localhost'||hostname.endsWith('.localhost')||hostname.endsWith('.local')||hostname.endsWith('.internal')||hostname.endsWith('.test')||hostname.endsWith('.invalid')||hostname.endsWith('.example')||hostname==='metadata.google.internal'||localIp(hostname)||!hostname.includes('.'))throw Error('Public HTTPS provider hostname required');
 if(!/^[a-z0-9.-]+$/.test(hostname))throw Error('Invalid API hostname');
 const records=await Promise.allSettled([Deno.resolveDns(hostname,'A'),Deno.resolveDns(hostname,'AAAA')]);
 const addresses=records.flatMap(x=>x.status==='fulfilled'?x.value:[]);
 if(!addresses.length||addresses.some(ip=>localIp(ip)))throw Error('Provider host resolves to an unsafe address');
 const relative=String(path||'/');
 if(!/^\/[\w.\-\/]*$/.test(relative)||relative.includes('..')||relative.length>180||relative.startsWith('//'))throw Error('Use a safe GET endpoint path such as /health');
 return new URL(relative,u.origin).href;
}
async function verifiedStaff(jwt){
 const {data,error}=await db.auth.getUser(jwt);
 if(error||!data.user?.email)return false;
 const {data:staff}=await db.from('sh_staff').select('role,active').eq('email',data.user.email.toLowerCase()).maybeSingle();
 return Boolean(staff?.active&&['owner','manager'].includes(staff.role));
}
async function getConfigs(){
 const {data,error}=await db.from('sh_api_connections').select('id,display_name,base_url,test_path,auth_mode,key_header,secret_header,active,last_test_at,last_test_ok,created_at').order('created_at',{ascending:false}).limit(100);
 if(error)throw error;return data||[];
}
async function getClients(){
 const {data,error}=await db.from('sh_api_clients').select('id,display_name,active,last_used_at,created_at').order('created_at',{ascending:false}).limit(100);
 if(error)throw error;return data||[];
}
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 if(req.method==='OPTIONS')return permitted.test(origin)?new Response(null,{headers:headers(origin)}):new Response('Forbidden',{status:403});
 if(req.method!=='POST'||!permitted.test(origin))return new Response('Forbidden',{status:403});
 try{
  const bodyText=await req.text();if(bodyText.length>9000)return respond(origin,{error:'Request too large'},413);
  const body=JSON.parse(bodyText||'{}'),action=body.action;
  const jwt=(req.headers.get('authorization')||'').match(/^Bearer\s+(\S+)$/i)?.[1];
  if(!jwt||!await verifiedStaff(jwt))return respond(origin,{error:'Owner or manager authorization required'},403);
  if(action==='list')return respond(origin,{ok:true,connections:await getConfigs(),clients:await getClients()});
  if(action==='save_connection'){
   const name=String(body.display_name||'').trim(),mode=String(body.auth_mode||'none'),base=String(body.base_url||'').trim(),path=String(body.test_path||'/').trim();
   if(name.length<2||name.length>100||!['none','bearer','api_key','dual_headers'].includes(mode))return respond(origin,{error:'Invalid connection name or auth mode'},400);
   await validateDestination(base,path);
   const keyHeader=String(body.key_header||'Api-Key').trim(),secretHeader=String(body.secret_header||'Secret-Key').trim();
   const headerPattern=/^[a-zA-Z][\w-]{0,69}$/;
   if(!headerPattern.test(keyHeader)||!headerPattern.test(secretHeader))return respond(origin,{error:'Invalid credential header names'},400);
   let original=null;
   if(body.id){
    if(!validId(body.id))return respond(origin,{error:'Invalid connection ID'},400);
    const found=await db.from('sh_api_connections').select('id,vault_secret_id,active').eq('id',body.id).maybeSingle();
    if(!found.data)return respond(origin,{error:'Connection not found'},404);
    original=found.data;
   }
   const token=String(body.token||'').trim(),secret=String(body.secret||'').trim();
   if(token.length>1000||secret.length>1000)return respond(origin,{error:'Credential length exceeded'},400);
   const existingSecret=original?.vault_secret_id||null;
   let vaultId=existingSecret;
   if(token||secret){
    const stored=await db.rpc('sh_api_vault_save',{p_secret_id:existingSecret,p_data:JSON.stringify({token,secret})});
    if(stored.error||!stored.data)throw Error('Unable to securely store credentials');
    vaultId=stored.data;
   }
   if(mode!=='none'&&!vaultId)return respond(origin,{error:'Enter credentials before saving an authenticated connection'},400);
   const payload={display_name:name,base_url:base.replace(/\/$/,''),test_path:path,auth_mode:mode,key_header:keyHeader,secret_header:secretHeader,vault_secret_id:vaultId,active:false,updated_at:new Date().toISOString()};
   const saved=original?await db.from('sh_api_connections').update(payload).eq('id',original.id):await db.from('sh_api_connections').insert(payload);
   if(saved.error)throw saved.error;
   return respond(origin,{ok:true,connections:await getConfigs(),message:'Connection profile saved securely. Run the connection test to validate.'});
  }
  if(action==='test_connection'){
   if(!validId(body.id))return respond(origin,{error:'Invalid connection'},400);
   const {data:config}=await db.from('sh_api_connections').select('*').eq('id',body.id).maybeSingle();
   if(!config)return respond(origin,{error:'Connection not found'},404);
   const dest=await validateDestination(config.base_url,config.test_path);
   let stored={};
   if(config.vault_secret_id){
    const res=await db.rpc('sh_api_vault_read',{p_secret_id:config.vault_secret_id});
    if(res.error)throw Error('Unable to read stored credentials');
    stored=JSON.parse(res.data||'{}');
   }
   const h={'accept':'application/json'};
   if(config.auth_mode==='bearer')h.authorization='Bearer '+String(stored.token||'');
   if(config.auth_mode==='api_key')h[config.key_header]=String(stored.token||'');
   if(config.auth_mode==='dual_headers'){h[config.key_header]=String(stored.token||'');h[config.secret_header]=String(stored.secret||'')}
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
   let success=false,statusCode=0;
   try{
    const tested=await fetch(dest,{method:'GET',headers:h,redirect:'manual',signal:controller.signal});
    statusCode=tested.status;success=tested.ok;await tested.body?.cancel();
   }finally{clearTimeout(timer)}
   await db.from('sh_api_connections').update({last_test_at:new Date().toISOString(),last_test_ok:success,active:success}).eq('id',config.id);
   return respond(origin,{ok:true,success,status_code:statusCode,message:success?'Provider test endpoint responded successfully. No parcel was created.':'Test failed. Verify credentials, endpoint and provider access.'});
  }
  if(action==='disable_connection'){
   if(!validId(body.id))return respond(origin,{error:'Invalid connection'},400);
   const {error}=await db.from('sh_api_connections').update({active:false}).eq('id',body.id);
   if(error)throw error;return respond(origin,{ok:true,connections:await getConfigs()});
  }
  if(action==='create_client'){
   const name=String(body.display_name||'').trim();if(name.length<2||name.length>100)return respond(origin,{error:'Enter a valid partner name'},400);
   const plain=freshKey(),hash=await sha256(plain);
   const saved=await db.from('sh_api_clients').insert({display_name:name,key_hash:hash,active:true});
   if(saved.error)throw saved.error;
   return respond(origin,{ok:true,key:plain,clients:await getClients(),message:'Copy this key now. It will not be shown again.'});
  }
  if(action==='revoke_client'){
   if(!validId(body.id))return respond(origin,{error:'Invalid client'},400);
   const saved=await db.from('sh_api_clients').update({active:false}).eq('id',body.id);
   if(saved.error)throw saved.error;return respond(origin,{ok:true,clients:await getClients()});
  }
  return respond(origin,{error:'Unsupported action'},400);
 }catch(e){console.error('Integration Hub error',e instanceof Error?e.name:'unknown');return respond(origin,{error:'Unable to process request. Review connection settings and try again.'},500)}
});
