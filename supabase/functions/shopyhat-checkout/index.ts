// SHOPYHAT checkout — server authoritative totals, atomic database transaction.
import { createClient } from 'npm:@supabase/supabase-js@2.49.10';
const allowHeaders = 'content-type,apikey,authorization';
const allowedOrigins = /^https:\/\/(?:(?:[a-z0-9-]+\.)?shopyhat\.pages\.dev|shopyhat-stage\.pages\.dev)$/i;
const headersFor = (origin) => ({
 'content-type':'application/json',
 'access-control-allow-origin':allowedOrigins.test(origin)?origin:'https://shopyhat.pages.dev',
 'access-control-allow-methods':'POST,OPTIONS',
 'access-control-allow-headers':allowHeaders,'vary':'Origin','cache-control':'no-store'
});
const url=Deno.env.get('SUPABASE_URL'),secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(!url||!secret)throw Error('Backend secrets unavailable');
const db=createClient(url,secret,{auth:{persistSession:false}});
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 const headers=headersFor(origin);
 const reply=(x,status=200)=>new Response(JSON.stringify(x),{status,headers});
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return reply({error:'Only POST allowed'},405);
 if(!allowedOrigins.test(origin))return reply({error:'Checkout domain is not authorized'},403);
 try {
  const text=await req.text();
  if(text.length>12000)return reply({error:'Order request too large'},413);
  const p=JSON.parse(text);
  if(!p||typeof p!=='object'||Array.isArray(p))return reply({error:'Invalid order'},400);
  // Honeypot field: filled only by bots.
  if(p.website || p.company_url)return reply({error:'Invalid order'},400);
  // If enabled in Supabase secrets, Turnstile is required for public orders.
  // Without a secret, DB-enforced phone + global order limits remain active.
  // Payment proofs are never automatically considered paid.
  // Owner/Manager/Operator with a valid Supabase JWT may create manual orders.
  const jwt=(req.headers.get('authorization')||'').match(/^Bearer\s+([^\s]+)$/i)?.[1];
  let authorizedStaff=false;
  let signedCustomerId:string|null=null;
  if(jwt && jwt!==secret){
    const verified=await db.auth.getUser(jwt);
    const email=verified.data?.user?.email?.toLowerCase();
    if(!verified.error && email){
      const staff=await db.from('sh_staff').select('role,active').eq('email',email).maybeSingle();
      authorizedStaff=!!staff.data?.active && ['owner','manager','operator'].includes(staff.data.role);
      if(!authorizedStaff&&verified.data.user?.app_metadata?.account_type!=='reseller')signedCustomerId=verified.data.user.id;
    }
  }
  if(!authorizedStaff){
    const turnstileSecret=Deno.env.get('SHOPYHAT_TURNSTILE_SECRET');
    if(turnstileSecret){
      const token=String(p.turnstile_token||'').slice(0,2048);
      if(!token)return reply({error:'Human verification required'},403);
      const check=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
        method:'POST',body:new URLSearchParams({secret:turnstileSecret,response:token})
      });
      if(!check.ok || !(await check.json()).success)return reply({error:'Human verification failed. Try again.'},403);
    }
  }
  if(!Array.isArray(p.items)||p.items.length<1||p.items.length>15)return reply({error:'Invalid items'},400);
  // Named referral URLs are resolved on the trusted server, never from a customer-supplied UUID.
  const slug=String(p.referrer_slug||'').trim().toLowerCase();
  let approvedReferrer='';
  if(/^[a-z0-9][a-z0-9-]{2,39}$/.test(slug)){
   const found=await db.from('sh_reseller_accounts').select('user_id').eq('shop_slug',slug).eq('status','approved').maybeSingle();
   if(!found.error&&found.data)approvedReferrer=found.data.user_id;
  }
  const shaped={
   request_id:String(p.request_id||'').slice(0,40),name:String(p.name||'').trim().slice(0,121),
   phone:String(p.phone||'').replace(/\s/g,'').slice(0,25),
   email:String(p.email||'').trim().slice(0,255),
   address:String(p.address||'').trim().slice(0,401),
   zone:String(p.zone||'').slice(0,20),payment_method:String(p.payment_method||'cod').slice(0,12),
   transaction_id:String(p.transaction_id||'').trim().slice(0,41),sender_last4:String(p.sender_last4||'').slice(0,8),
   coupon:String(p.coupon||'').slice(0,40),referrer_id:approvedReferrer,note:String(p.note||'').slice(0,501),
   items:p.items.map(x=>({variant_id:String(x.variant_id||'').slice(0,40),qty:Number(x.qty),size:String(x.size||'').slice(0,80)}))
  };
  const {data,error}=await db.rpc('sh_checkout_email_api',{p:shaped});
  if(error){console.error('Checkout rejected:',error.code);return reply({error:error.message||'Order unavailable'},400)}
  // This independent service-role update links ONLY the authenticated buyer's own new order.
  // A phone number alone must never claim previous guest orders.
  if(signedCustomerId&&data?.ok){
   const linked=await db.from('sh_orders').update({customer_user_id:signedCustomerId})
    .eq('request_id',shaped.request_id).is('customer_user_id',null);
   if(linked.error)console.error('Order-account association pending:',linked.error.code);
  }
  return reply(data,201);
 }catch(e){console.error('Checkout failed',e instanceof Error?e.name:'error');return reply({error:'Unable to process order'},400)}
});