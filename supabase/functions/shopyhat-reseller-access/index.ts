import {createClient} from 'npm:@supabase/supabase-js@2.49.10';
const url=Deno.env.get('SUPABASE_URL');
const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(!url||!serviceKey)throw new Error('Missing server environment');
const server=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
const allowedOrigin=/^https:\/\/(?:shopyhat\.pages\.dev|shopyhat-stage\.pages\.dev)$/i;
const cors=origin=>({
 'content-type':'application/json','cache-control':'no-store','vary':'Origin',
 'access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS',
 'access-control-allow-headers':'apikey,authorization,content-type'
});
const response=(origin,body,status=200)=>new Response(JSON.stringify(body),{status,headers:cors(origin)});
function newPassword(){
 const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#%!';
 const bytes=crypto.getRandomValues(new Uint8Array(22));
 return Array.from(bytes,x=>chars[x%chars.length]).join('');
}
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 if(!allowedOrigin.test(origin))return new Response('Forbidden',{status:403});
 if(req.method==='OPTIONS')return new Response(null,{headers:cors(origin)});
 if(req.method!=='POST')return response(origin,{error:'POST required'},405);
 try{
  const jwt=(req.headers.get('authorization')||'').match(/^Bearer\s+(\S+)$/i)?.[1];
  if(!jwt)return response(origin,{error:'Admin sign-in required'},401);
  const {data:identity,error:identityError}=await server.auth.getUser(jwt);
  if(identityError||!identity.user?.email)return response(origin,{error:'Invalid Admin session'},401);
  const {data:staff,error:staffError}=await server.from('sh_staff').select('active,role').eq('email',identity.user.email.toLowerCase()).maybeSingle();
  if(staffError||!staff?.active||!['owner','manager'].includes(staff.role))
   return response(origin,{error:'Owner or manager permission required'},403);
  const raw=await req.text();if(raw.length>2400)return response(origin,{error:'Request too large'},413);
  const body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body))return response(origin,{error:'Invalid request'},400);
  if(body.action==='create'){
   const requestId=String(body.application_id||'');
   const login=String(body.login_name||'').trim().toLowerCase();
   const slug=String(body.shop_slug||'').trim().toLowerCase();
   if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)||
    !/^[a-z][a-z0-9_]{3,23}$/.test(login)||!/^[a-z0-9][a-z0-9-]{2,39}$/.test(slug))
     return response(origin,{error:'Check application ID, login ID and shop URL'},400);
   const {data:application,error:appError}=await server.from('sh_reseller_applications').select('*').eq('id',requestId).eq('status','pending').maybeSingle();
   if(appError||!application)return response(origin,{error:'Pending application not found'},404);
   const {data:existing,error:existingError}=await server.from('sh_reseller_accounts').select('user_id').or('login_name.eq.'+login+',shop_slug.eq.'+slug).limit(1);
   if(existingError||existing?.length)return response(origin,{error:'Login ID or shop URL already exists'},409);
   const temp=newPassword();
   const {data:created,error:createdError}=await server.auth.admin.createUser({
    email:login+'@reseller.shopyhat.com',password:temp,email_confirm:true,
    app_metadata:{account_type:'reseller'}
   });
   if(createdError||!created.user)return response(origin,{error:createdError?.message||'Unable to create account'},400);
   const userId=created.user.id;
   const {error:insertError}=await server.from('sh_reseller_accounts').insert({
    user_id:userId,business_name:application.business_name,status:'approved',login_name:login,
    shop_slug:slug,contact_phone:application.phone,contact_email:application.email,
    approved_at:new Date().toISOString(),must_change_password:true
   });
   if(insertError){await server.auth.admin.deleteUser(userId);return response(origin,{error:'Unable to save reseller record'},500)}
   const {error:updateError}=await server.from('sh_reseller_applications').update({
     status:'approved',reseller_id:userId,updated_at:new Date().toISOString()
   }).eq('id',requestId);
   if(updateError)return response(origin,{error:'Account created; review application status before retrying'},500);
   return response(origin,{ok:true,username:login,shop_slug:slug,temporary_password:temp});
  }
  if(body.action==='reset'){
   const id=String(body.user_id||'');
   if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
    return response(origin,{error:'Invalid account ID'},400);
   const {data:account,error:accountError}=await server.from('sh_reseller_accounts').select('user_id,login_name').eq('user_id',id).maybeSingle();
   if(accountError||!account)return response(origin,{error:'Reseller not found'},404);
   const temp=newPassword();
   const {error:resetError}=await server.auth.admin.updateUserById(id,{password:temp});
   if(resetError)return response(origin,{error:'Could not reset password'},400);
   const {error:enforceError}=await server.from('sh_reseller_accounts').update({must_change_password:true}).eq('user_id',id);
   if(enforceError)return response(origin,{error:'Password reset; check first-login enforcement before sharing access'},500);
   return response(origin,{ok:true,username:account.login_name,temporary_password:temp});
  }
  return response(origin,{error:'Unknown operation'},400);
 }catch(e){
  console.error('Reseller access operation failed',e instanceof Error?e.name:'unknown');
  return response(origin,{error:'Unable to process reseller access request'},500);
 }
});