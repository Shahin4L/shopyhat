import { createClient } from 'npm:@supabase/supabase-js@2.49.10';
const base = Deno.env.get('SUPABASE_URL');
const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!base || !secret) throw Error('Supabase service configuration missing');
const db = createClient(base,secret,{auth:{persistSession:false,autoRefreshToken:false}});
const allowedOrigin = /^https:\/\/(?:(?:[a-z0-9-]+\.)?shopyhat\.pages\.dev|shopyhat-stage\.pages\.dev)$/i;
Deno.serve(async req => {
  const origin = req.headers.get('origin') || '';
  const cors = {'access-control-allow-origin':allowedOrigin.test(origin)?origin:'https://shopyhat.pages.dev',
      'access-control-allow-headers':'content-type,apikey,authorization',
      'access-control-allow-methods':'POST,OPTIONS','vary':'Origin','cache-control':'no-store','content-type':'application/json'};
  const reply=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:cors});
  if(req.method==='OPTIONS')return new Response(null,{headers:cors});
  if(req.method!=='POST'||!allowedOrigin.test(origin))return reply({error:'Origin not authorized'},403);
  try{
    const raw=await req.text();if(raw.length>1600)return reply({error:'Invalid request'},413);
    const data=JSON.parse(raw);
    const email=String(data?.email||'').toLowerCase().trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>250)return reply({error:'Enter a valid email address'},400);
    // Keep the same neutral response for non-staff addresses.
    const neutral={ok:true,message:'If this is an active SHOPYHAT staff account, a sign-in email will arrive shortly.'};
    const user=await db.from('sh_staff').select('active').eq('email',email).maybeSingle();
    if(user.error){console.error('OTP staff lookup error',user.error.code);return reply({error:'Sign-in service temporarily unavailable'},503)}
    if(!user.data?.active)return reply(neutral);
    const allowed=await db.rpc('sh_allow_otp_request',{p_email:email});
    if(allowed.error){console.error('OTP throttle error',allowed.error.code);return reply({error:'Sign-in service temporarily unavailable'},503)}
    if(!allowed.data)return reply({error:'Too many login requests. Try again later.'},429);
    const result=await db.auth.signInWithOtp({
      email, options:{shouldCreateUser:true,emailRedirectTo:origin+'/admin/'}
    });
    if(result.error){
      console.error('Supabase OTP send failed',result.error.message);
      return reply({error:'Email delivery is unavailable. Check Supabase Auth email settings and sending limits.'},503);
    }
    return reply(neutral);
  }catch(e){console.error('OTP request failed',e instanceof Error?e.name:'error');return reply({error:'Unable to request sign-in email'},400)}
});