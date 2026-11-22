import {createClient} from 'npm:@supabase/supabase-js@2.49.10';
const url=Deno.env.get('SUPABASE_URL'),secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(!url||!secret)throw Error('Tracking service configuration missing');
const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
const allowed=/^https:\/\/(?:(?:[a-z0-9-]+\.)?shopyhat\.pages\.dev|shopyhat-stage\.pages\.dev)$/i;
const hdr=origin=>({'content-type':'application/json','cache-control':'no-store','vary':'Origin','access-control-allow-origin':origin,'access-control-allow-headers':'apikey,content-type','access-control-allow-methods':'POST,OPTIONS'});
const respond=(origin,x,status=200)=>new Response(JSON.stringify(x),{status,headers:hdr(origin)});
async function fingerprint(value){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),'HMAC',{hash:'SHA-256'},false,['sign']);const b=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value)));return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('')}
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 if(!allowed.test(origin))return new Response('Forbidden',{status:403});
 if(req.method==='OPTIONS')return new Response(null,{headers:hdr(origin)});
 if(req.method!=='POST')return respond(origin,{ok:false,error:'POST required'},405);
 try{
  const bodyText=await req.text();
  if(bodyText.length>1200)return respond(origin,{ok:false,error:'Invalid tracking request'},413);
  const body=JSON.parse(bodyText||'{}');
  const id=String(body.order_id||'').trim().toUpperCase(),phone=String(body.phone||'').replace(/[\s-]/g,'').replace(/^\+?88/,'');
  if(!/^SH-[0-9]{6,8}-[A-Z0-9]{4,12}$/.test(id)||!/^01[3-9][0-9]{8}$/.test(phone))return respond(origin,{ok:false,error:'Enter a valid order ID and Bangladesh mobile number.'},400);
  // The fingerprint never contains reversible customer information in storage.
  const source=req.headers.get('cf-connecting-ip')||req.headers.get('x-real-ip')||'unknown';
  const hash=await fingerprint(source+'|'+phone);
  const {data,error}=await db.rpc('track_order_secure',{p_order:id,p_phone:phone,p_fingerprint:hash});
  if(error){console.error('Tracking RPC error:',error.code);return respond(origin,{ok:false,error:'Tracking temporarily unavailable. Try again later.'},503)}
  return respond(origin,data||{ok:false,error:'Order not found.'},data?.ok?200:404);
 }catch(e){console.error('Tracking request error:',e instanceof Error?e.name:'unknown');return respond(origin,{ok:false,error:'Unable to search for the order right now.'},400)}
});
