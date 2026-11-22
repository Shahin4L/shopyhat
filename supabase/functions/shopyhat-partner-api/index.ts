import {createClient} from 'npm:@supabase/supabase-js@2.49.10';
const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(!url||!key)throw Error('Missing backend credentials');
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
async function digest(v){const array=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)));return Array.from(array,x=>x.toString(16).padStart(2,'0')).join('')}
Deno.serve(async req=>{
 if(req.method!=='GET')return json({error:'GET required'},405);
 const raw=req.headers.get('x-shopyhat-api-key')||'';
 if(!/^sh_live_[0-9a-f]{64}$/.test(raw))return json({error:'Unauthorized'},401);
 const hashed=await digest(raw);
 const {data,error}=await db.from('sh_api_clients').select('id,active,display_name').eq('key_hash',hashed).maybeSingle();
 if(error||!data?.active)return json({error:'Unauthorized'},401);
 await db.from('sh_api_clients').update({last_used_at:new Date().toISOString()}).eq('id',data.id);
 const urlPath=new URL(req.url).pathname;
 if(!urlPath.endsWith('/health'))return json({error:'Not found. Partner health check is the only enabled endpoint.'},404);
 return json({ok:true,platform:'SHOPYHAT',partner:data.display_name,service:'partner-api',capabilities:['health_check'],version:'1.0'});
});
