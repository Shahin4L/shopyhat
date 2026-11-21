import {createClient} from 'npm:@supabase/supabase-js@2.49.10';
const url=Deno.env.get('SUPABASE_URL'),secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(!url||!secret)throw Error('Analytics credentials unavailable');
const db=createClient(url,secret,{auth:{persistSession:false}});
const allowed=/^https:\/\/(?:(?:[a-z0-9-]+\.)?shopyhat\.pages\.dev|shopyhat-stage\.pages\.dev)$/i;
const h=origin=>({'content-type':'application/json','access-control-allow-origin':allowed.test(origin)?origin:'https://shopyhat.pages.dev','access-control-allow-methods':'OPTIONS,POST','access-control-allow-headers':'content-type,apikey,authorization','vary':'Origin','cache-control':'no-store'});
Deno.serve(async request=>{
 const origin=request.headers.get('origin')||'';
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:h(origin)});
 const out=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:h(origin)});
 if(request.method!=='POST'||!allowed.test(origin))return out({error:'Not allowed'},403);
 try{
  const content=await request.text();if(content.length>700)return out({error:'Invalid payload'},400);
  const p=JSON.parse(content),page=String(p.page||''),v=String(p.visitor||'');
  if(!['home','shop','track','contact','policies','care','product'].includes(page)||!(/^[a-f0-9-]{20,80}$/i.test(v)))return out({error:'Invalid event'},400);
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const bytes=new TextEncoder().encode(today+'|'+v+'|'+(Deno.env.get('ANALYTICS_PEPPER')||secret.slice(0,45)));
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  const token=Array.from(new Uint8Array(digest)).map(n=>n.toString(16).padStart(2,'0')).join('');
  const r=await db.rpc('sh_record_web_view',{p_page:page,p_token:token});
  if(r.error)throw r.error;
  return out({ok:true});
 }catch(e){console.warn('Analytics write error',String(e));return out({error:'Analytics unavailable'},503)}
});