// SHOPYHAT conditional audit archive (staff/internal metadata only).
// Requires ARCHIVE_CRON_TOKEN, SHOPYHAT_ARCHIVE_WEBAPP_URL and SHOPYHAT_ARCHIVE_SECRET.
// Without all three secrets, NO rows are deleted.
import {createClient} from 'npm:@supabase/supabase-js@2.49.10';
const url=Deno.env.get('SUPABASE_URL'),svc=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(!url||!svc)throw Error('Missing Supabase server configuration');
const db=createClient(url,svc,{auth:{persistSession:false}});
const hex=buf=>[...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,'0')).join('');
const sha256=async value=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
Deno.serve(async req=>{
 const reply=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
 if(req.method!=='POST')return reply({error:'POST only'},405);
 const cronToken=Deno.env.get('SHOPYHAT_ARCHIVE_CRON_TOKEN');
 const provided=req.headers.get('x-shopyhat-archive-token')||'';
 if(!cronToken||provided!==cronToken)return reply({error:'Archive maintenance is not configured or authorized'},403);
 const scriptUrl=Deno.env.get('SHOPYHAT_ARCHIVE_WEBAPP_URL')||'',secret=Deno.env.get('SHOPYHAT_ARCHIVE_SECRET')||'';
 let used=0,threshold=419430400,eligible=0;
 async function log(result,note,archived=0){
  try{await db.from('sh_archive_check_runs').insert({database_bytes:used,threshold_bytes:threshold,eligible_audit_rows:eligible,recommendation:result,archived_rows:archived,note:String(note).slice(0,500)})}
  catch(err){console.warn('Archive log unavailable',String(err))}
 }
 try{
  const cap=await db.rpc('sh_archive_capacity_check');
  if(cap.error||!Array.isArray(cap.data)||!cap.data.length)throw Error('Database capacity check unavailable');
  used=Number(cap.data[0].database_bytes||0);threshold=Number(cap.data[0].threshold_bytes||threshold);
  eligible=Number(cap.data[0].eligible_audit_rows||0);
  if(used<threshold||eligible===0)return reply({ok:true,status:'no_archive_needed',database_bytes:used,threshold_bytes:threshold,eligible_rows:eligible});
  if(!scriptUrl.startsWith('https://script.google.com/macros/s/')||secret.length<20){
   await log('configuration_needed','Eligible old audit records found; no Google Sheets archive connection. No records removed.');
   return reply({ok:true,status:'backup_not_configured',deleted:0,eligible_rows:eligible});
  }
  const cutoff=new Date();cutoff.setUTCMonth(cutoff.getUTCMonth()-6);
  const records=await db.from('sh_audit_log').select('id,created_at,entity,record_id,record_label,action,actor_email,actor_role,changes').lt('created_at',cutoff.toISOString()).order('created_at',{ascending:true}).limit(40);
  if(records.error)throw Error('Could not fetch candidate audit rows');
  if(!records.data?.length)return reply({ok:true,status:'no_eligible_rows',deleted:0});
  const rows=[];
  for(const a of records.data){
   const original={id:String(a.id),created_at:a.created_at,entity:a.entity,record_id:a.record_id,record_label:a.record_label,action:a.action,actor_email:a.actor_email,actor_role:a.actor_role,changes:a.changes||{}};
   rows.push({...original,sha256:await sha256(JSON.stringify(original))});
  }
  const response=await fetch(scriptUrl,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({secret,action:'archive_audit',rows})});
  if(!response.ok)throw Error('Google Sheets backup endpoint returned HTTP '+response.status);
  const payload=await response.json();
  if(!payload.ok||!Array.isArray(payload.verified))throw Error('Google Sheets did not return verification');
  const verified=new Map(payload.verified.map(x=>[String(x.id),String(x.sha256)]));
  if(verified.size!==rows.length||rows.some(x=>verified.get(x.id)!==x.sha256))throw Error('Google Sheets readback verification mismatch');
  // Rows are deleted only if every row is verified in Google Sheets.
  const ids=rows.map(x=>Number(x.id));
  const gone=await db.from('sh_audit_log').delete().in('id',ids).lt('created_at',cutoff.toISOString()).select('id');
  if(gone.error)throw Error('Verified backup succeeded but database cleanup failed: '+gone.error.message);
  const deleted=gone.data?.length||0;
  await log('verified_archive','Google Sheets ID/hash readback verified before deleting eligible 6+ month audit rows.',deleted);
  return reply({ok:true,status:'verified_archive',eligible_rows:eligible,backed_up:rows.length,deleted});
 }catch(e){
  await log('archive_failed',String(e).slice(0,450));
  return reply({error:'Archive check failed. No further cleanup attempted.',details:String(e).slice(0,180)},503);
 }
});