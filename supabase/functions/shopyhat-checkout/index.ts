// SHOPYHAT checkout — server authoritative totals, atomic database transaction.
import { createClient } from 'npm:@supabase/supabase-js@2.49.10';
const allowHeaders = 'content-type,apikey,authorization';
const headers = { 'content-type':'application/json','access-control-allow-origin':'*','access-control-allow-methods':'POST,OPTIONS','access-control-allow-headers':allowHeaders,'cache-control':'no-store' };
const reply=(x,status=200)=>new Response(JSON.stringify(x),{status,headers});
const url=Deno.env.get('SUPABASE_URL'),secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(!url||!secret)throw Error('Backend secrets unavailable');
const db=createClient(url,secret,{auth:{persistSession:false}});
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return reply({error:'Only POST allowed'},405);
 try {
  const text=await req.text();
  if(text.length>12000)return reply({error:'Order request too large'},413);
  const p=JSON.parse(text);
  if(!p||typeof p!=='object'||Array.isArray(p))return reply({error:'Invalid order'},400);
  // Honeypot field: filled only by bots.
  if(p.website || p.company_url)return reply({error:'Invalid order'},400);
  if(!Array.isArray(p.items)||p.items.length<1||p.items.length>15)return reply({error:'Invalid items'},400);
  const shaped={
   request_id:String(p.request_id||'').slice(0,40),name:String(p.name||'').trim().slice(0,121),
   phone:String(p.phone||'').replace(/\s/g,'').slice(0,25),
   address:String(p.address||'').trim().slice(0,401),
   zone:String(p.zone||'').slice(0,20),payment_method:String(p.payment_method||'cod').slice(0,12),
   transaction_id:String(p.transaction_id||'').trim().slice(0,41),sender_last4:String(p.sender_last4||'').slice(0,8),
   coupon:String(p.coupon||'').slice(0,40),note:String(p.note||'').slice(0,501),
   items:p.items.map(x=>({variant_id:String(x.variant_id||'').slice(0,40),qty:Number(x.qty),size:String(x.size||'').slice(0,80)}))
  };
  const {data,error}=await db.rpc('sh_checkout_api',{p:shaped});
  if(error){console.error('Checkout rejected:',error.code);return reply({error:error.message||'Order unavailable'},400)}
  return reply(data,201);
 }catch(e){console.error('Checkout failed',e instanceof Error?e.name:'error');return reply({error:'Unable to process order'},400)}
});