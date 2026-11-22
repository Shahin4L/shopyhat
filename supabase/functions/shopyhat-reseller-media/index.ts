import {createClient} from 'npm:@supabase/supabase-js@2.49.10';
const url=Deno.env.get('SUPABASE_URL'),secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(!url||!secret)throw Error('Missing Supabase configuration');
const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
const allowedOrigin=/^https:\/\/(shopyhat\.pages\.dev|shopyhat-stage\.pages\.dev)$/i;
const cors=(origin)=>({'access-control-allow-origin':origin,'access-control-allow-methods':'POST,OPTIONS','access-control-allow-headers':'authorization,apikey,content-type','vary':'Origin','cache-control':'no-store'});
const json=(origin,data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors(origin),'content-type':'application/json'}});
const MAX_SIZE=8*1024*1024;
function safeImageURL(raw){
 const source=String(raw||'');
 const match=source.match(/^https:\/\/drive\.google\.com\/file\/d\/([\w-]{15,})\/view/);
 if(match)return'https://drive.google.com/thumbnail?id='+match[1]+'&sz=w1600';
 const parsed=new URL(source);
 if(parsed.protocol!=='https:')throw Error('Image source not permitted');
 if(parsed.hostname==='drive.google.com'){
  const id=parsed.searchParams.get('id');
  if(!id||!/^[\w-]{15,}$/.test(id))throw Error('Invalid Drive image');
  return'https://drive.google.com/thumbnail?id='+id+'&sz=w1600';
 }
 if(parsed.hostname.endsWith('.supabase.co') && parsed.pathname.startsWith('/storage/v1/object/public/'))return parsed.href;
 if(['images.unsplash.com','res.cloudinary.com','lh3.googleusercontent.com'].includes(parsed.hostname))return parsed.href;
 throw Error('Image source is not supported for secure download');
}
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 if(!allowedOrigin.test(origin))return new Response('Forbidden',{status:403});
 if(req.method==='OPTIONS')return new Response(null,{headers:cors(origin)});
 if(req.method!=='POST')return json(origin,{error:'POST required'},405);
 try{
  const jwt=(req.headers.get('authorization')||'').match(/^Bearer\s+(\S+)$/i)?.[1];
  if(!jwt)return json(origin,{error:'Reseller login required'},401);
  const {data:verified,error}=await db.auth.getUser(jwt);
  if(error||!verified.user)return json(origin,{error:'Invalid session'},401);
  const {data:reseller}=await db.from('sh_reseller_accounts').select('user_id').eq('user_id',verified.user.id).eq('status','approved').eq('must_change_password',false).maybeSingle();
  if(!reseller)return json(origin,{error:'Approved reseller required'},403);
  const body=await req.text();if(body.length>500)return json(origin,{error:'Invalid image request'},413);
  const {image_id}=JSON.parse(body);const id=String(image_id||'');
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return json(origin,{error:'Invalid image ID'},400);
  const {data:image,error:queryError}=await db.from('sh_product_images').select('id,product_id,image_url').eq('id',id).maybeSingle();
  if(queryError||!image)return json(origin,{error:'Image not found'},404);
  const {data:product}=await db.from('sh_products').select('id,status').eq('id',image.product_id).maybeSingle();
  const {data:enabled}=await db.from('sh_reseller_prices').select('product_id').eq('product_id',image.product_id).eq('active',true).maybeSingle();
  if(product?.status!=='active'||!enabled)return json(origin,{error:'This product is not enabled for reseller downloads'},403);
  let src;
  try{src=safeImageURL(image.image_url)}catch{return json(origin,{error:'This image is not available for download. Ask Admin for an approved copy.'},422)}
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  let response;
  try{response=await fetch(src,{redirect:'follow',signal:controller.signal,headers:{accept:'image/*'}})}
  finally{clearTimeout(timer)}
  if(!response.ok)return json(origin,{error:'Could not retrieve image. Check source permissions.'},502);
  const type=String(response.headers.get('content-type')||'').split(';')[0].trim();
  if(!['image/jpeg','image/png','image/webp'].includes(type))return json(origin,{error:'Image source did not return a supported image'},502);
  const reported=Number(response.headers.get('content-length')||0);
  if(reported>MAX_SIZE)return json(origin,{error:'Image exceeds maximum download size'},413);
  const data=await response.arrayBuffer();
  if(data.byteLength>MAX_SIZE)return json(origin,{error:'Image exceeds maximum download size'},413);
  const ext=type==='image/png'?'png':type==='image/webp'?'webp':'jpg';
  return new Response(data,{headers:{...cors(origin),'content-type':type,'content-length':String(data.byteLength),'content-disposition':'attachment; filename="shopyhat-product-'+id.slice(0,8)+'.'+ext+'"'}});
 }catch(e){console.error('Reseller media request failed',e instanceof Error?e.name:'unknown');return json(origin,{error:'Could not download product image. Please retry.'},500)}
});
