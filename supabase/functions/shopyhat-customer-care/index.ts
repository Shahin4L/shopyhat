import {createClient} from 'npm:@supabase/supabase-js@2.49.10';
const URL_=Deno.env.get('SUPABASE_URL'), KEY=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(!URL_||!KEY)throw Error('Backend configuration missing');
const db=createClient(URL_,KEY,{auth:{persistSession:false}});
const origins=/^https:\/\/(?:(?:[a-z0-9-]+\.)?shopyhat\.pages\.dev|shopyhat-stage\.pages\.dev)$/i;
const categories=['Damaged Item','Wrong Item','Missing Item','Delivery Delay','Payment Issue','Return / Exchange','Product Quality','Other'];
const mimeTypes=['image/jpeg','image/png','image/webp','video/mp4','video/webm'];
const reply=(data,status,origin)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','access-control-allow-origin':origins.test(origin)?origin:'https://shopyhat.pages.dev','access-control-allow-methods':'POST,OPTIONS','access-control-allow-headers':'content-type,apikey,authorization','vary':'Origin','cache-control':'no-store'}});
function magic(bytes,type){
 const b=new Uint8Array(bytes),chars=(at,s)=>[...s].every((x,i)=>b[at+i]===x.charCodeAt(0));
 return type==='image/jpeg'?(b[0]===255&&b[1]===216&&b[2]===255)
  :type==='image/png'?(b[0]===137&&chars(1,'PNG'))
  :type==='image/webp'?(chars(0,'RIFF')&&chars(8,'WEBP'))
  :type==='video/mp4'?chars(4,'ftyp')
  :type==='video/webm'?(b[0]===26&&b[1]===69&&b[2]===223&&b[3]===163):false;
}
async function hash(v){
 const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v+'|'+KEY.slice(0,40)));
 return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function allowed(fp,kind,cap){
 const since=new Date(Date.now()-3600000).toISOString();
 const r=await db.from('sh_customer_submit_limits').select('id',{count:'exact',head:true}).eq('fingerprint',fp).eq('kind',kind).gte('created_at',since);
 if(r.error)throw Error('Rate limit unavailable');
 return (r.count||0)<cap;
}
async function stamp(fp,kind){const r=await db.from('sh_customer_submit_limits').insert({fingerprint:fp,kind});if(r.error)console.warn('Could not record submission rate')}
async function human(token){
 const key=Deno.env.get('SHOPYHAT_TURNSTILE_SECRET');
 if(!key)return true;
 if(!token)return false;
 const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:key,response:token})});
 return !!(await r.json()).success;
}
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 const send=(obj,status=200)=>reply(obj,status,origin);
 if(req.method==='OPTIONS')return reply({},204,origin);
 if(req.method!=='POST')return send({error:'POST required'},405);
 if(!origins.test(origin))return send({error:'Unauthorized origin'},403);
 try{
  const contentType=req.headers.get('content-type')||'',isForm=contentType.includes('multipart/form-data');
  if(!isForm&&!contentType.includes('application/json'))return send({error:'Invalid content type'},415);
  if(Number(req.headers.get('content-length')||0)>22*1024*1024)return send({error:'Upload too large'},413);
  const p=isForm?await req.formData():await req.json();
  const field=k=>String(isForm?(p.get(k)||''):(p[k]||'')).trim();
  const action=field('action'),valid=['review','case','status','reply','review_media'];
  if(!valid.includes(action)||field('website'))return send({error:'Invalid request'},400);
  const phone=field('phone').replace(/^(?:\+?88)/,'');
  const fp=await hash(action+'|'+(req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')||'unknown').split(',')[0].slice(0,75)+'|'+(['case','reply'].includes(action)?phone:''));
  if(!await allowed(fp,action,['status','review_media'].includes(action)?25:action==='review'?5:3))return send({error:'Too many requests. Please try later.'},429);
  if(!await human(field('turnstile_token')))return send({error:'Complete human verification'},403);
  if(action==='status'){
   const id=field('case_number').toUpperCase();
   if(!/^CS-[A-Z0-9]{10}$/.test(id)||!/^01[3-9]\d{8}$/.test(phone))return send({error:'Invalid case reference or phone number'},400);
   const r=await db.from('sh_customer_cases').select('case_number,status,updated_at,last_staff_feedback').eq('case_number',id).eq('phone',phone).maybeSingle();
   await stamp(fp,action);
   if(r.error||!r.data)return send({error:'No matching case found'},404);
   return send({ok:true,case_number:r.data.case_number,status:r.data.status,updated_at:r.data.updated_at,feedback:r.data.last_staff_feedback||''});
  }
  if(action==='reply'){
   const id=field('case_number').toUpperCase(),message=field('message');
   if(!/^CS-[A-Z0-9]{10}$/.test(id)||!/^01[3-9]\d{8}$/.test(phone)||message.length<10||message.length>2000)return send({error:'Provide a valid case reference, phone and reply (10–2000 characters)'},400);
   const lookup=await db.from('sh_customer_cases').select('id,status').eq('case_number',id).eq('phone',phone).maybeSingle();
   if(lookup.error||!lookup.data)return send({error:'No matching case found'},404);
   if(['Resolved','Closed'].includes(lookup.data.status))return send({error:'This case is closed. Please submit a new issue if you need more help.'},409);
   const ins=await db.from('sh_case_replies').insert({case_id:lookup.data.id,message});
   if(ins.error)throw Error('Unable to save customer reply');
   const change=await db.from('sh_customer_cases').update({status:'Under Review',last_staff_feedback:'Thank you for the additional information. Our support team is reviewing your reply.'}).eq('id',lookup.data.id);
   if(change.error)console.warn('Case status update after reply failed',change.error.message);
   await stamp(fp,action);
   return send({ok:true,message:'Your reply has been added to the support case.'});
  }
  if(action==='review_media'){
   const ids=Array.isArray(p.review_ids)?p.review_ids.filter(x=>/^[a-f\d-]{36}$/i.test(String(x))).slice(0,50):[];
   if(!ids.length)return send({ok:true,photos:{}});
   const a=await db.from('sh_reviews').select('id').in('id',ids).eq('status','Approved');
   if(a.error)throw Error('Review lookup unavailable');
   const allowedIds=new Set((a.data||[]).map(x=>x.id));
   if(!allowedIds.size)return send({ok:true,photos:{}});
   const r=await db.from('sh_review_media').select('review_id,storage_path').in('review_id',[...allowedIds]);
   if(r.error)throw Error('Approved review images unavailable');
   const photos={};
   for(const m of r.data||[]){
    const signed=await db.storage.from('shopyhat-review-photos').createSignedUrl(m.storage_path,300);
    if(!signed.error)(photos[m.review_id]??=[]).push(signed.data.signedUrl);
   }
   return send({ok:true,photos});
  }
  if(action==='review'){
   const product_id=field('product_id'),rating=Number(field('rating')),name=field('reviewer_name'),title=field('title'),text=field('review_text');
   if(!/^[a-f\d-]{36}$/i.test(product_id)||!Number.isInteger(rating)||rating<1||rating>5||name.length<2||name.length>90||title.length>120||text.length<12||text.length>1200)return send({error:'Check the review fields'},400);
   const pdt=await db.from('sh_products').select('id').eq('id',product_id).eq('status','active').maybeSingle();
   if(!pdt.data)return send({error:'Product not available'},400);
   const photo=isForm?p.get('review_photo'):null;
   let file=null;
   if(photo instanceof File&&photo.size>0){
     if(!['image/jpeg','image/png','image/webp'].includes(photo.type)||photo.size>4194304)return send({error:'Optional image must be JPG, PNG or WebP up to 4 MB'},413);
     const bytes=await photo.arrayBuffer();
     if(!magic(bytes,photo.type))return send({error:'Photo contents do not match the file format'},400);
     file={bytes,type:photo.type,size:photo.size};
   }
   const ins=await db.from('sh_reviews').insert({product_id,reviewer_name:name,rating,title,review_text:text,status:'Pending'}).select('id').single();
   if(ins.error)throw Error('Review submission failed');
   if(file){
     const ext=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp';
     const path=ins.data.id+'/'+crypto.randomUUID()+'.'+ext;
     const upload=await db.storage.from('shopyhat-review-photos').upload(path,file.bytes,{contentType:file.type,upsert:false});
     if(upload.error){await db.from('sh_reviews').delete().eq('id',ins.data.id);throw Error('Review photo upload failed')}
     const row=await db.from('sh_review_media').insert({review_id:ins.data.id,storage_path:path,media_type:file.type,size_bytes:file.size});
     if(row.error){await db.storage.from('shopyhat-review-photos').remove([path]);await db.from('sh_reviews').delete().eq('id',ins.data.id);throw Error('Review media record failed')}
   }
   await stamp(fp,action);
   return send({ok:true,message:'Review received; approval pending',review_id:ins.data.id});
  }
  const name=field('customer_name'),email=field('contact_email'),order=field('order_number'),product_id=field('product_id'),category=field('category'),subject=field('subject'),description=field('description');
  if(name.length<2||name.length>100||!/^01[3-9]\d{8}$/.test(phone)||email.length>160||(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))||order.length>120||!categories.includes(category)||subject.length<5||subject.length>160||description.length<20||description.length>2500||(product_id&&!/^[a-f\d-]{36}$/i.test(product_id)))return send({error:'Check your issue and contact details'},400);
  const files=isForm?p.getAll('media').filter(x=>x instanceof File):[];
  if(files.length>3)return send({error:'Maximum three attachments'},413);
  let total=0;const media=[];
  for(const f of files){
   total+=f.size;
   if(!mimeTypes.includes(f.type)||f.size<1||f.size>15*1024*1024)return send({error:'Only JPG, PNG, WebP, MP4 or WebM up to 15MB each'},413);
   const bytes=await f.arrayBuffer();if(!magic(bytes,f.type))return send({error:'Invalid file format'},400);
   media.push({bytes,type:f.type,size:f.size});
  }
  if(total>20*1024*1024)return send({error:'Maximum 20MB combined attachments'},413);
  const ins=await db.from('sh_customer_cases').insert({customer_name:name,phone,contact_email:email,order_number:order,product_id:product_id||null,category,subject,description,status:'Submitted'}).select('id,case_number').single();
  if(ins.error)throw Error('Could not create case');
  const record=ins.data,paths=[];
  try{
   for(const m of media){
    const ext=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm'})[m.type];
    const path=record.id+'/'+crypto.randomUUID()+'.'+ext;
    const up=await db.storage.from('shopyhat-case-evidence').upload(path,m.bytes,{contentType:m.type,upsert:false});
    if(up.error)throw Error('Evidence upload failed');
    paths.push(path);
    const row=await db.from('sh_case_media').insert({case_id:record.id,storage_path:path,media_type:m.type,size_bytes:m.size});
    if(row.error)throw Error('Evidence record failed');
   }
  }catch(e){
   if(paths.length)await db.storage.from('shopyhat-case-evidence').remove(paths);
   await db.from('sh_customer_cases').delete().eq('id',record.id);
   throw e;
  }
  await stamp(fp,action);
  return send({ok:true,case_number:record.case_number,status:'Submitted',message:'Case submitted successfully'});
 }catch(e){console.error('Customer Care',String(e));return send({error:'Request could not be completed. Try again.'},500)}
});