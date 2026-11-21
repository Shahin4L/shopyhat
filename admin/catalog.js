/* SHOPYHAT catalog taxonomy + brand partners — Admin catalog manager. */
export function setupCatalogManager({db,roleCan,notify,fmtDate}){
 const by=id=>document.getElementById(id);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const slugify=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70);
 let categories=[],brands=[],productCounts={};
 const parents=()=>categories.filter(c=>!c.parent_id).sort((a,b)=>a.sort_order-b.sort_order||a.name.localeCompare(b.name));
 const children=id=>categories.filter(c=>c.parent_id===id).sort((a,b)=>a.sort_order-b.sort_order||a.name.localeCompare(b.name));
 const canEdit=()=>roleCan('owner','manager');
 const opt=(id,title,selected)=>'<option value="'+esc(id)+'"'+(id===selected?' selected':'')+'>'+esc(title)+'</option>';
 const parentName=id=>categories.find(c=>c.id===id)?.name||'Not assigned';
 const stateTag=on=>on?'<span class="pill">Active</span>':'<span class="pill" style="opacity:.6">Draft / Hidden</span>';
 async function reload(){
  const [cat,partner]=await Promise.all([
   db.from('sh_categories').select('*').order('sort_order').order('name'),
   db.from('sh_brand_partners').select('*').order('sort_order').order('name')
  ]);
  if(cat.error)throw cat.error;
  if(partner.error)throw partner.error;
  categories=cat.data||[];brands=partner.data||[];
  render();
 }
 function render(){
  const tree=by('taxCategoryRows');
  if(tree)tree.innerHTML=parents().map(p=>{
    const nested=children(p.id);
    const lines=[p,...nested];
    return lines.map(row=>'<tr><td>'+(!row.parent_id?'<strong>'+esc(row.name)+'</strong>':'<span style="padding-left:19px">↳ '+esc(row.name)+'</span>')+'<div class="muted">'+esc(row.name_bn||'')+'</div></td><td>'+esc(row.slug)+'</td><td>'+(!row.parent_id?'Main Category':esc(parentName(row.parent_id)))+'</td><td>'+stateTag(row.is_active)+'</td><td>'+esc(row.sort_order)+'</td><td><button type="button" class="btn small" data-tax-edit="'+esc(row.id)+'">Edit</button></td></tr>').join('')
   }).join('')||'<tr><td colspan="6">No categories yet. Create your first collection.</td></tr>';
  const brandRows=by('taxBrandRows');
  if(brandRows)brandRows.innerHTML=brands.map(p=>{
   const logo=p.logo_url?'<img src="'+esc(p.logo_url)+'" alt="" style="width:42px;height:42px;object-fit:contain;border-radius:8px;background:#fff;border:1px solid #eee">':'<span class="muted">No logo</span>';
   return '<tr><td>'+logo+'</td><td><b>'+esc(p.name)+'</b><div class="muted">'+esc(p.name_bn||'')+'</div></td><td>'+(p.website_url?'<a target="_blank" rel="noopener noreferrer" href="'+esc(p.website_url)+'">Website ↗</a>':'—')+'</td><td>'+stateTag(p.is_published)+'</td><td>'+esc(p.sort_order)+'</td><td><button type="button" class="btn small" data-brand-edit="'+esc(p.id)+'">Edit</button></td></tr>';
  }).join('')||'<tr><td colspan="6">No partners yet. Add a company in Draft mode.</td></tr>';
 }
 const catOptions=(id)=>parents().map(c=>opt(c.id,c.name+(c.is_active?'':' (Draft)'),id)).join('');
 function editCategory(id=null,parentId=null){
  if(!canEdit())return;
  const c=categories.find(c=>c.id===id)||{id:null,parent_id:parentId||null,name:'',name_bn:'',slug:'',description:'',sort_order:10,is_active:false};
  const area=by('taxCategoryEditor');
  area.innerHTML='<div class="catalog-editbox"><div class="topline"><h3>'+(id?'Edit Category / Subcategory':'Add Category / Subcategory')+'</h3><button class="btn small" type="button" id="taxCancelCat">Cancel</button></div>'+
   '<form id="taxCategoryForm"><div class="fieldrow"><div><label>Parent Collection</label><select name="parent_id" id="taxParentSelect"><option value="">None — Main Category</option>'+parents().filter(p=>p.id!==id).map(p=>opt(p.id,p.name,p.id===c.parent_id?p.id:'' )).join('')+'</select></div><div><label>Display Order</label><input name="sort_order" type="number" min="0" max="100000" value="'+esc(c.sort_order)+'"></div></div>'+
   '<label>Name (English) *</label><input name="name" required minlength="2" maxlength="80" value="'+esc(c.name)+'">'+
   '<label>বাংলা নাম (Optional)</label><input name="name_bn" maxlength="80" value="'+esc(c.name_bn)+'">'+
   '<label>URL Slug *</label><input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxlength="70" value="'+esc(c.slug)+'" placeholder="e.g. womens-collection">'+
   '<label>Short Description</label><textarea name="description" maxlength="500" rows="2">'+esc(c.description||'')+'</textarea>'+
   '<label class="catalog-toggle"><input type="checkbox" name="is_active" '+(c.is_active?'checked':'')+'> Enable on customer website</label>'+
   '<p class="muted">Draft/Inactive categories stay hidden. A child can be enabled only when the parent is enabled. Existing products stay intact when a category is disabled.</p>'+
   '<div class="editor-actions"><button class="btn primary" type="submit">Save Category</button><button class="btn" id="taxAddChild" type="button">+ Add Subcategory</button></div></form><p id="taxCategoryMsg" class="msg" role="status"></p></div>';
  by('taxCancelCat').onclick=()=>area.replaceChildren();
  by('taxAddChild').onclick=()=>editCategory(null,c.id||by('taxParentSelect').value);
  const f=by('taxCategoryForm');
  if(!id){f.querySelector('[name=name]').addEventListener('input',e=>{
    const input=f.querySelector('[name=slug]');if(!input.dataset.touched)input.value=slugify(e.target.value);
  });f.querySelector('[name=slug]').addEventListener('input',e=>e.target.dataset.touched='1');}
  f.onsubmit=async e=>{
   e.preventDefault();if(!canEdit())return;
   const data=new FormData(f),button=f.querySelector('[type=submit]');
   const payload={name:String(data.get('name')||'').trim(),name_bn:String(data.get('name_bn')||'').trim(),parent_id:data.get('parent_id')||null,slug:String(data.get('slug')||'').trim().toLowerCase(),description:String(data.get('description')||'').trim(),sort_order:Number(data.get('sort_order')||0),is_active:data.has('is_active')};
   if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug))return notify('taxCategoryMsg','Use a lowercase URL slug with letters, numbers and hyphens.',true);
   button.disabled=true;
   try{
    const query=id?db.from('sh_categories').update(payload).eq('id',id):db.from('sh_categories').insert(payload);
    const result=await query.select('id').single();
    if(result.error)throw result.error;
    area.replaceChildren();await reload();notify('taxMessage','Category saved. Changes appear on the storefront only after activation.');
   }catch(err){notify('taxCategoryMsg','Unable to save: '+err.message,true)}finally{button.disabled=false}
  };
 }
 function checkBrandURL(v){
  if(!v)return '';
  const u=new URL(v);if(u.protocol!=='https:'||!u.hostname||u.username||u.password)throw Error('Enter an HTTPS website URL.');
  return u.toString().slice(0,500);
 }
 async function imageValid(file){
  if(!file)return true;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2*1024*1024||file.size<1)throw Error('Use a JPG, PNG or WebP logo, up to 2 MB.');
  const a=new Uint8Array(await file.slice(0,12).arrayBuffer());
  const bytes=(i,len)=>String.fromCharCode(...a.slice(i,i+len));
  if(!(file.type==='image/jpeg'&&a[0]===255&&a[1]===216||file.type==='image/png'&&a[0]===137&&bytes(1,3)==='PNG'||file.type==='image/webp'&&bytes(0,4)==='RIFF'&&bytes(8,4)==='WEBP'))throw Error('Invalid logo file.');
 }
 function editBrand(id=null){
  if(!canEdit())return;
  const p=brands.find(x=>x.id===id)||{name:'',name_bn:'',website_url:'',logo_url:'',description:'',sort_order:10,is_published:false};
  const area=by('taxBrandEditor');
  area.innerHTML='<div class="catalog-editbox"><div class="topline"><h3>'+(id?'Edit Brand Partner':'Add Brand Partner')+'</h3><button type="button" class="btn small" id="taxBrandCancel">Cancel</button></div>'+
  '<form id="taxBrandForm"><div class="fieldrow"><div><label>Company Name *</label><input name="name" required minlength="2" maxlength="120" value="'+esc(p.name)+'"></div><div><label>বাংলা নাম (optional)</label><input name="name_bn" maxlength="120" value="'+esc(p.name_bn||'')+'"></div></div>'+
  '<label>Official Website URL (optional)</label><input name="website_url" inputmode="url" type="url" placeholder="https://example.com" value="'+esc(p.website_url||'')+'">'+
  '<label>Description (optional)</label><textarea name="description" rows="2" maxlength="500">'+esc(p.description||'')+'</textarea>'+
  '<div class="fieldrow"><div><label>Logo Image (optional)</label><input id="taxBrandLogoFile" type="file" accept="image/png,image/jpeg,image/webp"></div><div class="catalog-brand-logo">'+(p.logo_url?'<img src="'+esc(p.logo_url)+'" alt="Brand logo preview">':'<span class="muted">No logo uploaded</span>')+'</div></div>'+
  '<div class="fieldrow"><div><label>Display Order</label><input name="sort_order" min="0" max="100000" type="number" value="'+esc(p.sort_order)+'"></div><div><label class="catalog-toggle"><input type="checkbox" name="is_published" '+(p.is_published?'checked':'')+'> Publish brand on storefront</label></div></div>'+
  '<p class="muted">New companies remain unpublished until you enable them. Unpublished brands and their URLs are not returned to public visitors.</p>'+
  '<div class="editor-actions"><button class="btn primary" type="submit">Save Brand Partner</button></div></form><p id="taxBrandMsg" class="msg" role="status"></p></div>';
  by('taxBrandCancel').onclick=()=>area.replaceChildren();
  const input=by('taxBrandLogoFile');input.onchange=async()=>{
   const f=input.files?.[0];if(!f)return;
   try{await imageValid(f);const src=URL.createObjectURL(f);const el=area.querySelector('.catalog-brand-logo');el.innerHTML='';
    const img=document.createElement('img');img.src=src;img.onload=()=>URL.revokeObjectURL(src);el.append(img);
   }catch(err){input.value='';notify('taxBrandMsg',err.message,true)}
  };
  by('taxBrandForm').onsubmit=async e=>{
   e.preventDefault();const f=e.currentTarget,button=f.querySelector('[type=submit]');button.disabled=true;
   try{
    const data=new FormData(f),name=String(data.get('name')||'').trim();
    const url=checkBrandURL(String(data.get('website_url')||'').trim());
    const payload={name,name_bn:String(data.get('name_bn')||'').trim(),website_url:url,description:String(data.get('description')||'').trim(),sort_order:Number(data.get('sort_order')||0),is_published:data.has('is_published'),logo_url:p.logo_url||''};
    const file=input.files?.[0];
    if(file){
     await imageValid(file);
     const ext=file.type==='image/png'?'png':file.type==='image/jpeg'?'jpg':'webp';
     const path='partners/'+crypto.randomUUID()+'.'+ext;
     const upload=await db.storage.from('shopyhat-branding').upload(path,file,{cacheControl:'31536000',upsert:false,contentType:file.type});
     if(upload.error)throw upload.error;
     payload.logo_url=db.storage.from('shopyhat-branding').getPublicUrl(path).data.publicUrl;
    }
    const r=id?await db.from('sh_brand_partners').update(payload).eq('id',id).select('id').single():await db.from('sh_brand_partners').insert(payload).select('id').single();
    if(r.error)throw r.error;
    area.replaceChildren();await reload();notify('taxBrandMessage','Brand partner saved. It appears on the website only when Published.');
   }catch(err){notify('taxBrandMsg','Save failed: '+err.message,true)}finally{button.disabled=false}
  };
 }
 function productPickerHTML(p){
  const rootId=p.category_id||'',childId=p.subcategory_id||'',brandId=p.brand_partner_id||'';
  return '<div class="media-section catalog-product-picker"><div class="section-heading"><h3>Collection & Product Organization</h3><span class="step-number">OPTIONAL · FUTURE READY</span></div>'+
  '<p class="muted">Choose a main category, then a subcategory. Inactive collections stay unpublished. The older Category label remains for compatibility.</p>'+
  '<div class="fieldrow"><div><label>Main Category</label><select id="productCategoryId" name="category_id"><option value="">Legacy / Not selected</option>'+
  parents().map(c=>opt(c.id,c.name+(c.is_active?'':' (Draft)'),rootId)).join('')+'</select></div>'+
  '<div><label>Subcategory</label><select id="productSubcategoryId" name="subcategory_id"><option value="">No subcategory</option>'+children(rootId).map(c=>opt(c.id,c.name+(c.is_active?'':' (Draft)'),childId)).join('')+'</select></div></div>'+
  '<label>Brand Partner (Optional)</label><select id="productBrandPartnerId" name="brand_partner_id"><option value="">No brand partner</option>'+brands.map(c=>opt(c.id,c.name+(c.is_published?'':' (Unpublished)'),brandId)).join('')+'</select>'+
  '<p class="muted" id="catalogPickerNote">Draft collections and brands remain hidden until published.</p></div>';
 }
 function bindProductPicker(){
  const parent=by('productCategoryId'),child=by('productSubcategoryId');if(!parent||!child)return;
  const legacy=document.querySelector('#productForm [name=category]');
  function fill(){
   const id=parent.value;child.innerHTML='<option value="">No subcategory</option>'+children(id).map(c=>opt(c.id,c.name+(c.is_active?'':' (Draft)'),'' )).join('');
   if(legacy&&id)legacy.value=categories.find(c=>c.id===id)?.name||legacy.value;
  }
  parent.onchange=fill;
  child.onchange=()=>{if(legacy&&child.value)legacy.value=categories.find(c=>c.id===child.value)?.name||legacy.value};
 }
 function selectionPayload(f){
  const cat=f.category_id||null,sub=f.subcategory_id||null,partner=f.brand_partner_id||null;
  if(sub&&!cat)throw Error('Choose the main category before its subcategory.');
  if(cat&&!categories.some(c=>c.id===cat&&!c.parent_id))throw Error('Invalid main category.');
  if(sub&&!categories.some(c=>c.id===sub&&c.parent_id===cat))throw Error('This subcategory does not belong to the selected main category.');
  if(partner&&!brands.some(b=>b.id===partner))throw Error('Invalid brand partner.');
  return {category_id:cat,subcategory_id:sub,brand_partner_id:partner};
 }
 by('taxNewCategory').onclick=()=>editCategory();
 by('taxNewSubcategory').onclick=()=>editCategory(null,parents()[0]?.id||null);
 by('taxNewBrand').onclick=()=>editBrand();
 document.addEventListener('click',e=>{
  const cat=e.target.closest('[data-tax-edit]'),brand=e.target.closest('[data-brand-edit]');
  if(cat)editCategory(cat.dataset.taxEdit);
  if(brand)editBrand(brand.dataset.brandEdit);
 });
 return {reload,render,productPickerHTML,bindProductPicker,selectionPayload,getCategories:()=>categories,getBrands:()=>brands,categoryName:parentName};
}
