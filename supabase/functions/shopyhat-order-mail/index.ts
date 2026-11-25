import {buildOrderEmail} from './email-content.js';
const url=Deno.env.get('SUPABASE_URL')||'';
const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const brevoKey=Deno.env.get('BREVO_API_KEY')||'';
const sender=Deno.env.get('SHOPYHAT_MAIL_FROM')||'backup.shahin4l@gmail.com';
async function rpc(name,body){
 const r=await fetch(url+'/rest/v1/rpc/'+name,{method:'POST',headers:{'content-type':'application/json','apikey':serviceKey,'authorization':'Bearer '+serviceKey},body:JSON.stringify(body)});
 if(!r.ok)throw Error('database_rpc_'+r.status);
 const t=await r.text();return t?JSON.parse(t):null;
}
Deno.serve(async req=>{
 if(req.method!=='POST')return new Response('Method not allowed',{status:405});
 if(!url||!serviceKey||!brevoKey)return new Response('Mail service not configured',{status:503});
 const token=req.headers.get('x-shopyhat-dispatch')||'';
 if(token.length<32||token.length>200)return new Response('Unauthorized',{status:401});
 let jobs;
 try{jobs=await rpc('sh_claim_order_mail',{p_token:token})}catch{return new Response('Unauthorized',{status:401})}
 let processed=0;
 for(const job of jobs||[]){
  let state='uncertain',provider='',error='';
  try{
   const content=buildOrderEmail(job.event_type,job.payload);
   const resp=await fetch('https://api.brevo.com/v3/smtp/email',{
    method:'POST',headers:{'api-key':brevoKey,'content-type':'application/json','accept':'application/json'},
    body:JSON.stringify({sender:{name:'SHOPYHAT',email:sender},to:[{email:job.recipient}],subject:content.subject,htmlContent:content.htmlContent,headers:{idempotencyKey:job.id}}),
    signal:AbortSignal.timeout(12000)
   });
   const data=await resp.json().catch(()=>({}));
   if(resp.ok&&data.messageId){state='sent';provider=String(data.messageId)}
   else {state=resp.status>=400&&resp.status<500?'failed':'uncertain';error='brevo_http_'+resp.status}
  }catch{state='uncertain';error='delivery_outcome_unknown'}
  try{await rpc('sh_finish_order_mail',{p_id:job.id,p_lease:job.lease_id,p_state:state,p_message_id:provider,p_error:error});processed++}
  catch{console.error('Mail result could not be recorded')}
 }
 return new Response(JSON.stringify({processed}),{headers:{'content-type':'application/json','cache-control':'no-store'}});
});
