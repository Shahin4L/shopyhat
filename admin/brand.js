/* SHOPYHAT Brand Settings — Admin owner/manager only. */
export function setupBrandManager({db,roleCan,notify,formatDate}){
 const get=id=>document.getElementById(id), bucket='shopyhat-branding';
 const origin='https://xwfqgmgiunlxzvzoermn.supabase.co';
 const allowed=url=>typeof url==='string'&&url.startsWith(origin+'/storage/v1/object/public/'+bucket+'/logos/');
 let saved=null,defaultLogo='';
 async function loadDefault(){
  if(defaultLogo)return defaultLogo;
  try{const r=await fetch('../index.html',{cache:'force-cache'});if(!r.ok)return '';
   const m=(await r.text()).match(/const LOGO\s*=\s*"(data:image\/webp;base64,[A-Za-z0-9+/=]+)"/);
   defaultLogo=m?.[1]||'';}catch(e){console.warn('Default logo preview failed',e)}
  return defaultLogo;
 }
 function fileCheck(file){
  if(!file)throw Error('Select your new logo image.');
  if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Only PNG, JPG and WebP are supported.');
  if(file.size<1||file.size>2*1024*1024)throw Error('Logo must be 2 MB or smaller.');
 }
 async function magic(file){
  const b=new Uint8Array(await file.slice(0,12).arrayBuffer());
  const text=(start,n)=>String.fromCharCode(...b.slice(start,start+n));
  return file.type==='image/png'?(b[0]===137&&text(1,3)==='PNG'):file.type==='image/jpeg'?(b[0]===255&&b[1]===216&&b[2]===255):(text(0,4)==='RIFF'&&text(8,4)==='WEBP');
 }
 async function preview(){
  const url=allowed(saved?.logo_url)?saved.logo_url+'?v='+encodeURIComponent(saved.updated_at||'1'):await loadDefault();
  const img=get('brandLogoPreview');
  if(url){img.src=url;img.style.visibility='visible'}else{img.removeAttribute('src');img.style.visibility='hidden'}
  get('brandLogoCurrent').textContent=allowed(saved?.logo_url)?'Custom brand logo currently published':'Original SHOPYHAT logo is active';
  get('brandLogoUpdated').textContent=saved?.updated_at?'Last updated '+formatDate(saved.updated_at)+(saved.updated_by?' by '+saved.updated_by:''):'';
  get('resetBrandLogo').disabled=!allowed(saved?.logo_url);
 }
 async function reload(){
  if(!roleCan('owner','manager'))return;
  const result=await db.from('sh_brand_settings').select('logo_url,updated_at').eq('id','primary').maybeSingle();
  if(result.error){notify('brandLogoMsg','Unable to load brand settings: '+result.error.message,true);return}
  saved=result.data||null;await preview();
 }
 async function upload(){
  if(!roleCan('owner','manager'))return;
  const file=get('brandLogoFile').files?.[0],button=get('saveBrandLogo');
  try{
   fileCheck(file);if(!await magic(file))throw Error('Invalid or corrupted image.');
   button.disabled=true;notify('brandLogoMsg','Uploading your new logo…');
   const ext=file.type==='image/png'?'png':file.type==='image/jpeg'?'jpg':'webp';
   const path='logos/shopyhat-'+crypto.randomUUID()+'.'+ext;
   const r=await db.storage.from(bucket).upload(path,file,{contentType:file.type,cacheControl:'31536000',upsert:false});
   if(r.error)throw r.error;
   const url=db.storage.from(bucket).getPublicUrl(path).data.publicUrl;
   if(!allowed(url))throw Error('Invalid saved logo URL.');
   const update=await db.from('sh_brand_settings').update({logo_url:url}).eq('id','primary').select('logo_url,updated_at').single();
   if(update.error)throw update.error;
   saved=update.data;get('brandLogoFile').value='';await preview();
   notify('brandLogoMsg','New logo published. Refresh the storefront to see the update without old image cache.');
  }catch(e){notify('brandLogoMsg','Logo upload failed: '+e.message,true)}
  finally{button.disabled=false}
 }
 async function restore(){
  if(!roleCan('owner','manager'))return;
  if(!confirm('Restore the original SHOPYHAT logo on the website? Previous uploads will be preserved.'))return;
  const button=get('resetBrandLogo');button.disabled=true;
  try{
   const r=await db.from('sh_brand_settings').update({logo_url:''}).eq('id','primary').select('logo_url,updated_at').single();
   if(r.error)throw r.error;saved=r.data;await preview();notify('brandLogoMsg','Original SHOPYHAT logo restored.');
  }catch(e){notify('brandLogoMsg','Restore failed: '+e.message,true)}
  finally{button.disabled=false}
 }
 get('saveBrandLogo').onclick=upload;
 get('resetBrandLogo').onclick=restore;
 get('reloadBrandLogo').onclick=reload;
 get('brandLogoFile').onchange=async e=>{
  const file=e.target.files?.[0];if(!file)return;
  try{
   fileCheck(file);if(!await magic(file))throw Error('Image data is invalid.');
   const u=URL.createObjectURL(file),img=get('brandLogoPreview');
   img.onload=()=>URL.revokeObjectURL(u);img.src=u;img.style.visibility='visible';
   notify('brandLogoMsg','Preview ready. Click Upload & Publish Logo to save.');
  }catch(err){e.target.value='';notify('brandLogoMsg',err.message,true)}
 };
 return {reload};
}
