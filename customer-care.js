/* SHOPYHAT Customer Care: reviews, issue reporting and private case-status lookup.
   No third-party translation service; customer personal data is submitted only to SHOPYHAT. */
(function(){
'use strict';
const host=document.getElementById('shCareContent');if(!host)return;
const api='https://xwfqgmgiunlxzvzoermn.supabase.co';
const key='sb_publishable_Tk-PzYsM3YxnDsjicnMdzQ_mQsREdkP';
const endpoint=api+'/functions/v1/shopyhat-customer-care';
let tab='reviews',products=[],reviews=[],reviewPhotos={},loading=true,loadError='',productError='',selectedProduct='';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const bn=()=>{try{return localStorage.getItem('sh_language')==='bn'}catch{return false}};
const t=(en,bd)=>bn()?bd:en;
const productName=p=>bn()&&p.name_bn?p.name_bn:p.name;
const customerProfile=()=>window.SHOPYHAT_CUSTOMER?.getUser?.()?window.SHOPYHAT_CUSTOMER?.getProfile?.():null;
function prefillAccount(fields){
 const profile=customerProfile();if(!profile)return;
 for(const [id,value] of Object.entries(fields)){
  const input=document.getElementById(id);
  if(input&&!input.value&&value)input.value=String(value);
 }
}

const categoriesBN={'Damaged Item':'ক্ষতিগ্রস্ত পণ্য','Wrong Item':'ভুল পণ্য','Missing Item':'পণ্য অনুপস্থিত','Delivery Delay':'ডেলিভারিতে দেরি','Payment Issue':'পেমেন্ট সমস্যা','Return / Exchange':'রিটার্ন / এক্সচেঞ্জ','Product Quality':'পণ্যের মান','Other':'অন্যান্য'};
const statusesBN={'Submitted':'জমা হয়েছে','Under Review':'পর্যালোচনাধীন','Investigating':'তদন্ত চলছে','Awaiting Customer':'গ্রাহকের উত্তরের অপেক্ষায়','Resolution Proposed':'সমাধানের প্রস্তাব দেওয়া হয়েছে','Resolved':'সমাধান হয়েছে','Closed':'বন্ধ','Reopened':'পুনরায় খোলা'};
const msg=(text,error=false)=>{const el=document.getElementById('careMsg');if(el){el.innerHTML='<div class="'+(error?'care-error':'care-success')+'" role="status">'+esc(text)+'</div>';el.scrollIntoView({block:'nearest',behavior:'smooth'})}};
const formatDate=value=>new Date(value).toLocaleDateString(bn()?'bn-BD':'en-BD',{year:'numeric',month:'short',day:'numeric',timeZone:'Asia/Dhaka'});
const opts=()=>'<option value="">'+t('Choose a product','পণ্য নির্বাচন করুন')+'</option>'+products.map(p=>'<option value="'+esc(p.id)+'" '+(p.id===selectedProduct?'selected':'')+'>'+esc(productName(p))+'</option>').join('');
const productHint=()=>productError?'<p class="care-error">'+t('Product list unavailable. Please retry.','পণ্যের তালিকা লোড হয়নি। আবার চেষ্টা করুন।')+' <button class="btn" id="careRetryCatalog" type="button">'+t('Retry','আবার চেষ্টা')+'</button></p>':!products.length?'<p class="care-hint">'+t('No active products found.','কোনো সক্রিয় পণ্য পাওয়া যায়নি।')+'</p>':'';
function bindRetry(){const b=document.getElementById('careRetryCatalog');if(b)b.onclick=async()=>{try{products=await getCatalog();productError='';}catch(e){productError=e.message}render()}}
async function loadReviewPhotos(){
 if(!reviews.length)return;
 try{
  const r=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:JSON.stringify({action:'review_media',review_ids:reviews.map(x=>x.id)})});
  const j=await r.json();if(r.ok&&j.ok){reviewPhotos=j.photos||{};if(tab==='reviews')renderReviews()}
 }catch(e){console.warn('Review photos unavailable',e)}
}
const nav=()=>{document.querySelectorAll('[data-care-tab]').forEach(b=>{b.classList.toggle('on',b.dataset.careTab===tab);b.setAttribute('aria-pressed',String(b.dataset.careTab===tab))})};
const honeypot='<div class="care-honeypot" hidden style="display:none" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>';
const submitButton=label=>'<button class="btn" type="submit">'+esc(label)+'</button>';
async function getCatalog(){
 const url=api+'/rest/v1/sh_products?select=id,legacy_id,name,name_bn&status=eq.active&order=created_at.desc&limit=200';
 const r=await fetch(url,{headers:{apikey:key},cache:'no-store'});if(!r.ok)throw Error('Product list unavailable');return r.json();
}
async function getReviews(){
 const url=api+'/rest/v1/sh_reviews?select=id,product_id,reviewer_name,rating,title,review_text,staff_response,created_at&status=eq.Approved&order=created_at.desc&limit=50';
 const r=await fetch(url,{headers:{apikey:key},cache:'no-store'});if(!r.ok)throw Error('Reviews unavailable');return r.json();
}
async function reloadReviews(){
 try{reviews=await getReviews();render()}catch(e){loadError=e.message;render()}
}
function render(){
 nav();
 document.getElementById('carePageTitle').textContent=t('Reviews & Customer Support','রিভিউ ও গ্রাহক সহায়তা');
 document.getElementById('carePageIntro').textContent=t('Share feedback, report an issue with evidence, or track the latest case status.','মতামত দিন, ছবি বা ভিডিওসহ অভিযোগ জানান অথবা কেসের সর্বশেষ অবস্থা দেখুন।');
 document.querySelector('[data-care-tab=reviews]').textContent=t('★ Product Reviews','★ পণ্যের রিভিউ');
 document.querySelector('[data-care-tab=issue]').textContent=t('⚑ Report an Issue','⚑ সমস্যা জানান');
 document.querySelector('[data-care-tab=track]').textContent=t('◷ Track My Case','◷ কেস ট্র্যাক করুন');
 if(tab==='reviews')return renderReviews();
 if(tab==='issue')return renderIssue();
 renderTrack();
}
function renderReviews(){
 const filtered=selectedProduct?reviews.filter(r=>r.product_id===selectedProduct):reviews;
 host.innerHTML='<h2>'+t('What customers are saying','ক্রেতারা যা বলছেন')+'</h2><p class="care-intro">'+t('Reviews are published automatically and are not independently purchase-verified.','রিভিউ স্বয়ংক্রিয়ভাবে প্রকাশিত হয়; আলাদাভাবে ক্রয় যাচাই করা হয়নি।')+'</p>'+
 productHint()+'<div class="care-grid"><div><label for="careReviewFilter">'+t('Filter by product','পণ্য অনুযায়ী দেখুন')+'</label><select id="careReviewFilter">'+opts()+'</select></div><div style="display:flex;align-items:end"><button class="btn" id="careWriteReview" type="button">'+t('＋ Write a Review','＋ রিভিউ লিখুন')+'</button></div></div>'+
 '<div class="care-rule"></div><div id="careReviewCards" class="care-cards">'+(loading?'<p>'+t('Loading reviews…','রিভিউ লোড হচ্ছে…')+'</p>':loadError?'<p>'+esc(loadError)+'</p>':filtered.map(r=>'<article class="care-card"><div class="care-titlebar"><b>'+esc(productName(products.find(p=>p.id===r.product_id)||{name:'Product'}))+'</b><span class="care-stars">'+('★'.repeat(r.rating))+'</span></div><h3>'+esc(r.title||t('Customer review','ক্রেতার রিভিউ'))+'</h3><p>'+esc(r.review_text)+'</p><div class="care-hint">'+esc(r.reviewer_name)+' · '+formatDate(r.created_at)+'</div>'+(reviewPhotos[r.id]?.length?'<div class="care-media-preview">'+reviewPhotos[r.id].map(url=>'<a href="'+esc(url)+'" target="_blank" rel="noopener"><img src="'+esc(url)+'" alt="Review image" loading="lazy"></a>').join('')+'</div>':'')+(r.staff_response?'<div class="care-rule"></div><b>'+t('SHOPYHAT response','SHOPYHAT-এর উত্তর')+'</b><p>'+esc(r.staff_response)+'</p>':'')+'</article>').join('')||'<p>'+t('No published reviews yet. Be the first to share your experience.','এখনো কোনো প্রকাশিত রিভিউ নেই। প্রথম রিভিউটি দিতে পারেন।')+'</p>')+'</div><div id="careMsg"></div>';
 document.getElementById('careReviewFilter').onchange=e=>{selectedProduct=e.target.value;renderReviews()};
 document.getElementById('careWriteReview').onclick=renderReviewForm;bindRetry();
}
function showReviewThanks(){
 const old=document.getElementById('shReviewOverlay');if(old)old.remove();
 const d=document.createElement('dialog');
 d.setAttribute('aria-labelledby','shReviewThanksTitle');
 d.style.cssText='position:fixed;inset:0;margin:auto;box-sizing:border-box;width:min(calc(100vw - 32px),420px);max-height:calc(100dvh - 32px);overflow:auto;border:0;border-radius:24px;padding:clamp(20px,5vw,32px) 24px;text-align:center;color:#29231f;background:#fffdf8;box-shadow:0 24px 90px #0005';
 d.innerHTML='<div aria-hidden="true" style="margin:0 auto 20px;width:64px;height:64px;border-radius:50%;background:#e6f6ed;color:#27824c;display:grid;place-items:center;font-size:36px">✓</div><h2 id="shReviewThanksTitle" style="margin:0 0 12px;font-size:23px">'+t('Thank You for Your Review!','আপনার রিভিউয়ের জন্য ধন্যবাদ!')+'</h2><p style="line-height:1.65;margin:0 0 22px">'+t('Your review has been published successfully. We appreciate your feedback.','আপনার রিভিউ সফলভাবে প্রকাশিত হয়েছে। আপনার মূল্যবান মতামতের জন্য ধন্যবাদ।')+'</p><p style="font-size:12px;color:#9b633a;font-weight:700">SHOPYHAT | Your Choice, Our Gift.</p><div style="display:flex;flex-direction:column;gap:10px;margin-top:20px"><button type="button" class="btn" data-thanks-route="#arrivals">'+t('Explore New Arrivals','নতুন কালেকশন দেখুন')+' →</button><button type="button" class="btn ghost" data-thanks-route="#shop">'+t('Continue Shopping','কেনাকাটা চালিয়ে যান')+'</button><button type="button" data-thanks-close style="background:none;border:0;padding:8px;color:#665b54;cursor:pointer">'+t('Done','সম্পন্ন')+'</button></div>';
 document.body.append(d);d.addEventListener('close',()=>d.remove(),{once:true});d.querySelector('[data-thanks-close]').onclick=()=>d.close();d.querySelectorAll('[data-thanks-route]').forEach(b=>b.onclick=()=>{const route=b.dataset.thanksRoute;d.close();if(location.hash===route){if(route==='#arrivals')document.getElementById('newArrivals')?.scrollIntoView({behavior:'smooth'});}else location.hash=route;});d.showModal();
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)d.animate([{opacity:0,transform:'translateY(12px) scale(.96)'},{opacity:1,transform:'none'}],{duration:280,easing:'ease-out'});
}
function renderReviewForm(){
 host.innerHTML='<h2>'+t('Write a Product Review','পণ্যের রিভিউ দিন')+'</h2><p class="care-intro">'+t('Be specific and respectful. Your review will be published immediately. Do not include phone numbers, addresses or other personal information.','সুনির্দিষ্ট ও শালীনভাবে লিখুন। রিভিউ সঙ্গে সঙ্গে প্রকাশিত হবে। ফোন নম্বর, ঠিকানা বা ব্যক্তিগত তথ্য লিখবেন না।')+'</p>'+
 productHint()+'<form id="careReviewForm" enctype="multipart/form-data">'+honeypot+'<label for="rvProduct">'+t('Product *','পণ্য *')+'</label><select id="rvProduct" name="product_id" required>'+opts()+'</select>'+
 '<div class="care-grid"><div><label for="rvName">'+t('Your Name *','আপনার নাম *')+'</label><input id="rvName" name="reviewer_name" required minlength="2" maxlength="90" autocomplete="name"></div><div><label for="rvRating">'+t('Rating *','রেটিং *')+'</label><select id="rvRating" name="rating" required><option value="5">★★★★★ (5)</option><option value="4">★★★★☆ (4)</option><option value="3">★★★☆☆ (3)</option><option value="2">★★☆☆☆ (2)</option><option value="1">★☆☆☆☆ (1)</option></select></div></div>'+
 '<label for="rvText">'+t('Your Experience *','আপনার অভিজ্ঞতা *')+'</label><textarea id="rvText" name="review_text" minlength="12" maxlength="1200" required></textarea>'+
 '<label for="rvPhoto">'+t('Photo (optional, maximum 4 MB)','ছবি (ঐচ্ছিক, সর্বোচ্চ ৪ MB)')+'</label><input id="rvPhoto" name="review_photo" type="file" accept="image/jpeg,image/png,image/webp"><div id="reviewPhotoPreview" class="care-media-preview"></div><p class="care-hint">'+t('Your photo will appear with your review.','আপনার ছবি রিভিউয়ের সঙ্গে প্রকাশিত হবে।')+'</p><p class="care-hint">'+t('SHOPYHAT may hide inappropriate or personal content.','অনুপযুক্ত বা ব্যক্তিগত তথ্য থাকলে SHOPYHAT রিভিউ লুকাতে পারে।')+'</p>'+submitButton(t('Submit Review','রিভিউ জমা দিন'))+' <button type="button" class="btn ghost" id="careReviewBack">'+t('← Back to Reviews','← রিভিউতে ফিরে যান')+'</button></form><div id="careMsg"></div>';
 let photoUrl='';
 document.getElementById('rvPhoto').onchange=e=>{
  if(photoUrl){URL.revokeObjectURL(photoUrl);photoUrl=''}
  const preview=document.getElementById('reviewPhotoPreview');preview.textContent='';
  const file=e.target.files?.[0];
  if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>4194304){
   e.target.value='';msg(t('Choose a JPG, PNG or WebP image up to 4MB.','সর্বোচ্চ ৪ MB-এর JPG, PNG বা WebP ছবি দিন।'),true);return;
  }
  photoUrl=URL.createObjectURL(file);
  const image=document.createElement('img');image.src=photoUrl;image.alt=t('Selected review photo preview','নির্বাচিত রিভিউ ছবির প্রিভিউ');preview.append(image);
 };
 document.getElementById('careReviewBack').onclick=renderReviews;bindRetry();
 prefillAccount({rvName:customerProfile()?.full_name});
 document.getElementById('careReviewForm').onsubmit=async e=>{
  e.preventDefault();const f=e.currentTarget,button=f.querySelector('button[type=submit]');button.disabled=true;
  const p=new FormData(f);p.set('action','review');const photo=p.get('review_photo');
  if(!(photo instanceof File)||!photo.name||photo.size===0)p.delete('review_photo');
  else if(photo.size>4194304||!['image/jpeg','image/png','image/webp'].includes(photo.type)){msg(t('Choose a JPG, PNG or WebP image up to 4 MB.','সর্বোচ্চ ৪ MB-এর JPG, PNG বা WebP ছবি দিন।'),true);button.disabled=false;return}
  try{const r=await fetch(endpoint,{method:'POST',headers:{apikey:key},body:p});const j=await r.json();if(!r.ok||!j.ok)throw Error(j.error||'Review not submitted');
   f.reset();if(photoUrl){URL.revokeObjectURL(photoUrl);photoUrl=''}document.getElementById('reviewPhotoPreview').textContent='';showReviewThanks();reloadReviews().then(()=>{refreshInlineReviews();return loadReviewPhotos()}).then(refreshInlineReviews).catch(console.warn);
  }catch(err){msg(err.message,true)}finally{button.disabled=false}
 };
}
function linkedOrder(){
 const match=location.hash.match(/^#care\/report\/([^/]{1,360})$/);
 if(!match)return '';
 try{const number=decodeURIComponent(match[1]);return /^[a-z0-9-]{1,120}$/i.test(number)?number:''}catch{return ''}
}
function renderIssue(){
 const order=linkedOrder();
 host.innerHTML='<h2>'+t('Report a Problem','সমস্যা জানান')+'</h2><p class="care-intro">'+t('Explain the issue clearly and attach up to three photos/videos. Our team will review it and update your case.','সমস্যাটি স্পষ্ট করে লিখুন এবং সর্বোচ্চ তিনটি ছবি/ভিডিও দিন। আমাদের টিম যাচাই করে কেস আপডেট করবে।')+'</p><form id="careIssueForm" enctype="multipart/form-data">'+honeypot+
 productHint()+'<div class="care-grid"><div><label for="csName">'+t('Your Name *','আপনার নাম *')+'</label><input id="csName" name="customer_name" required minlength="2" maxlength="100" autocomplete="name"></div><div><label for="csPhone">'+t('Mobile Number *','মোবাইল নম্বর *')+'</label><input id="csPhone" name="phone" required inputmode="tel" placeholder="01XXXXXXXXX" maxlength="14" autocomplete="tel"></div>'+
 '<div><label for="csEmail">'+t('Email (optional)','ইমেইল (ঐচ্ছিক)')+'</label><input id="csEmail" name="contact_email" type="email" maxlength="160"></div><div><label for="csOrder">'+t('Order Number (if available)','অর্ডার নম্বর (থাকলে)')+'</label><input id="csOrder" name="order_number" maxlength="120" value="'+esc(order)+'" '+(order?'readonly':'')+'></div>'+
 '<div><label for="csProduct">'+t('Product (optional)','পণ্য (ঐচ্ছিক)')+'</label><select id="csProduct" name="product_id">'+opts()+'</select></div><div><label for="csCategory">'+t('Issue Category *','সমস্যার ধরন *')+'</label><select id="csCategory" name="category" required>'+['Damaged Item','Wrong Item','Missing Item','Delivery Delay','Payment Issue','Return / Exchange','Product Quality','Other'].map(x=>'<option value="'+esc(x)+'">'+esc(bn()?categoriesBN[x]:x)+'</option>').join('')+'</select></div></div>'+
 '<label for="csSubject">'+t('Issue Subject *','সমস্যার শিরোনাম *')+'</label><input id="csSubject" name="subject" required minlength="5" maxlength="160">'+
 '<label for="csDescription">'+t('Describe the Problem *','সমস্যার বিস্তারিত *')+'</label><textarea id="csDescription" name="description" minlength="20" maxlength="2500" required placeholder="'+t('What happened, when, and what resolution do you expect?','কী হয়েছে, কবে হয়েছে এবং কী সমাধান চান?')+'"></textarea>'+
 '<label for="csMedia">'+t('Photos or Videos (optional)','ছবি বা ভিডিও (ঐচ্ছিক)')+'</label><input id="csMedia" name="media" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" multiple><div id="careMediaPreview" class="care-media-preview"></div>'+
 '<p class="care-hint">'+t('Max 3 files. JPG, PNG, WebP, MP4 or WebM. Max 15 MB per file and 20 MB total. Attachments are private and used only to investigate your case.','সর্বোচ্চ ৩টি ফাইল। JPG, PNG, WebP, MP4 বা WebM। প্রতি ফাইল সর্বোচ্চ ১৫ MB এবং মোট ২০ MB। সংযুক্তি ব্যক্তিগত থাকবে ও অভিযোগ তদন্তেই ব্যবহার হবে।')+'</p>'+
 '<p class="care-hint">'+t('For damaged, defective or wrong items, contact SHOPYHAT within 3 calendar days of delivery under the published policy.','ক্ষতিগ্রস্ত, ত্রুটিপূর্ণ বা ভুল পণ্যের ক্ষেত্রে প্রকাশিত নীতিমালা অনুযায়ী ডেলিভারির ৩ দিনের মধ্যে যোগাযোগ করুন।')+'</p>'+
 '<label><input id="csConsent" type="checkbox" required style="width:auto"> '+t('I agree to provide this information for issue investigation and customer support.','অভিযোগ তদন্ত ও গ্রাহক সহায়তার জন্য তথ্য ব্যবহারে আমি সম্মত।')+'</label><div class="care-spaced">'+submitButton(t('Submit Issue','অভিযোগ জমা দিন'))+'</div></form><div id="careMsg"></div>';
 bindRetry();
 const account=customerProfile();
 prefillAccount({csName:account?.full_name,csPhone:String(account?.phone||'').replace(/^\+?88/,''),csEmail:account?.email});
 let previews=[];document.getElementById('csMedia').onchange=e=>{
  previews.forEach(URL.revokeObjectURL);previews=[];
  const files=[...e.target.files],out=document.getElementById('careMediaPreview');out.innerHTML='';
  if(files.length>3||files.reduce((n,f)=>n+f.size,0)>20*1024*1024){msg(t('Select at most three files, 20MB total.','সর্বোচ্চ ৩টি ফাইল, মোট ২০ MB নির্বাচন করুন।'),true);e.target.value='';return}
  files.forEach(f=>{const u=URL.createObjectURL(f);previews.push(u);const elem=f.type.startsWith('video/')?document.createElement('video'):document.createElement('img');elem.src=u;elem.alt='Selected evidence';out.append(elem)});
 };
 document.getElementById('careIssueForm').onsubmit=async e=>{
  e.preventDefault();const f=e.currentTarget,button=f.querySelector('button[type=submit]');button.disabled=true;
  const body=new FormData(f);body.set('action','case');
  try{const r=await fetch(endpoint,{method:'POST',headers:{apikey:key},body});const j=await r.json();if(!r.ok||!j.ok)throw Error(j.error||'Could not submit issue');
   f.reset();document.getElementById('careMediaPreview').innerHTML='';previews.forEach(URL.revokeObjectURL);previews=[];
   msg(t('Issue submitted. Save this Case ID: ','অভিযোগ জমা হয়েছে। এই কেস আইডি সংরক্ষণ করুন: ')+j.case_number+'. '+t('Use Track My Case with your mobile number to check staff feedback.','মোবাইল নম্বর দিয়ে Track My Case-এ আপডেট দেখুন।'));
   try{localStorage.setItem('sh_last_case_number',j.case_number)}catch{}
  }catch(err){msg(err.message,true)}finally{button.disabled=false}
 };
}
function renderTrack(){
 let last='';try{last=localStorage.getItem('sh_last_case_number')||''}catch{}
 host.innerHTML='<h2>'+t('Track Your Support Case','আপনার অভিযোগের অবস্থা দেখুন')+'</h2><p class="care-intro">'+t('Enter the Case ID from your confirmation and the mobile number you submitted. Only the latest customer-facing feedback is shown.','অভিযোগ জমার সময় পাওয়া Case ID ও আপনার মোবাইল নম্বর দিন। শুধু সর্বশেষ গ্রাহক-উপযোগী আপডেট দেখানো হবে।')+'</p><form id="careTrackForm"><div class="care-grid"><div><label for="careCaseId">'+t('Case ID','কেস আইডি')+'</label><input id="careCaseId" name="case_number" required placeholder="CS-XXXXXXXXXX" value="'+esc(last)+'"></div><div><label for="careCasePhone">'+t('Mobile Number','মোবাইল নম্বর')+'</label><input id="careCasePhone" name="phone" required inputmode="tel" placeholder="01XXXXXXXXX"></div></div><div class="care-spaced">'+submitButton(t('Check Status','অবস্থা দেখুন'))+'</div></form><div id="careMsg"></div>';
 document.getElementById('careTrackForm').onsubmit=async e=>{
  e.preventDefault();const f=e.currentTarget,button=f.querySelector('button[type=submit]');button.disabled=true;
  try{const p=Object.fromEntries(new FormData(f).entries());p.action='status';
   const r=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json','apikey':key},body:JSON.stringify(p)});
   const j=await r.json();if(!r.ok||!j.ok)throw Error(j.error||'Case not found');
   const box=document.getElementById('careMsg');
   const isOpen=!['Closed','Resolved'].includes(j.status);
   box.innerHTML='<div class="care-card" style="margin-top:18px"><div class="care-titlebar"><b>'+esc(j.case_number)+'</b><span class="care-status">'+esc(bn()?(statusesBN[j.status]||j.status):j.status)+'</span></div><p>'+t('Last updated: ','সর্বশেষ আপডেট: ')+formatDate(j.updated_at)+'</p><h3>'+t('Feedback from SHOPYHAT','SHOPYHAT-এর উত্তর')+'</h3><p>'+esc(j.feedback||t('Your case is being reviewed.','আপনার অভিযোগ পর্যালোচনা করা হচ্ছে।'))+'</p>'+
   (isOpen?'<div class="care-rule"></div><h3>'+t('Add Information / Reply','অতিরিক্ত তথ্য / উত্তর দিন')+'</h3><form id="careReplyForm"><label for="careReplyText">'+t('Your Response','আপনার উত্তর')+'</label><textarea id="careReplyText" minlength="10" maxlength="2000" required placeholder="'+t('Share requested information or a useful update…','প্রয়োজনীয় তথ্য বা নতুন আপডেট লিখুন…')+'"></textarea><div class="care-spaced"><button class="btn" type="submit">'+t('Send Reply','উত্তর পাঠান')+'</button></div></form><div id="careReplyMsg"></div>':'<p class="care-hint">'+t('This case is closed. Submit a new issue if you need further assistance.','কেসটি বন্ধ। আরও সহায়তা লাগলে নতুন অভিযোগ জমা দিন।')+'</p>')+'</div>';
   const form=box.querySelector('#careReplyForm');
   if(form)form.onsubmit=async ev=>{
     ev.preventDefault();const b=form.querySelector('button[type=submit]');b.disabled=true;
     try{
       const payload={action:'reply',case_number:j.case_number,phone:p.phone,message:form.querySelector('textarea').value};
       const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:JSON.stringify(payload)});
       const out=await response.json();if(!response.ok||!out.ok)throw Error(out.error||'Reply not saved');
       form.reset();box.querySelector('#careReplyMsg').innerHTML='<div class="care-success">'+t('Reply added. Our team can now review your information.','আপনার উত্তর জমা হয়েছে। আমাদের টিম এখন তথ্যটি পর্যালোচনা করতে পারবে।')+'</div>';
     }catch(err){box.querySelector('#careReplyMsg').innerHTML='<div class="care-error">'+esc(err.message)+'</div>'}
     finally{b.disabled=false}
   };
  }catch(err){msg(err.message,true)}finally{button.disabled=false}
 };
}
function switchTab(next){tab=next;render()}
function openLinkedReport(){
 if(!linkedOrder())return;
 switchTab('issue');
}
window.addEventListener('hashchange',openLinkedReport);
if(linkedOrder())tab='issue';
document.querySelectorAll('[data-care-tab]').forEach(el=>el.onclick=()=>{
 const next=el.dataset.careTab;
 if(next!=='issue'&&linkedOrder())history.replaceState(history.state,'','/#care');
 switchTab(next);
});

/* Product-specific review UX: compact ratings on each card, two-review detail preview,
   and accessible popup for the complete review list and writing a review. */
function byLegacy(legacy){return products.find(p=>String(p.legacy_id)===String(legacy))}
function productReviews(p){return p?reviews.filter(r=>r.product_id===p.id):[]}
function reviewSummaryHTML(list){
 if(!list.length)return '<span class="review-count">'+t('No reviews yet','এখনো রিভিউ নেই')+'</span>';
 const avg=list.reduce((sum,r)=>sum+Number(r.rating||0),0)/list.length;
 return '<span class="review-stars">★ '+avg.toFixed(1)+'</span><span class="review-count">('+list.length+' '+t('reviews','রিভিউ')+')</span>';
}
function itemPreview(r){
 const text=esc(r.review_text),picture=(reviewPhotos[r.id]||[])[0];
 return '<div class="sh-review-item"><span class="review-stars">'+('★'.repeat(r.rating))+'</span> <b>'+esc(r.title||r.reviewer_name)+'</b><p>'+text+'</p><small>'+esc(r.reviewer_name)+' · '+formatDate(r.created_at)+'</small>'+
 (picture?'<div class="care-media-preview"><a target="_blank" rel="noopener noreferrer" href="'+esc(picture)+'"><img loading="lazy" src="'+esc(picture)+'" alt="Customer review photo"></a></div>':'')+
 (r.staff_response?'<div class="care-hint"><b>'+t('SHOPYHAT response','SHOPYHAT-এর উত্তর')+':</b> '+esc(r.staff_response)+'</div>':'')+'</div>';
}
function refreshInlineReviews(){
 document.querySelectorAll('[data-review-card]').forEach(el=>{
  const p=byLegacy(el.dataset.reviewCard),list=productReviews(p);
  el.innerHTML='<div class="sh-review-summary">'+reviewSummaryHTML(list)+'</div>'+
   (list.length?'<p class="sh-review-snippet">'+esc(list[0].review_text)+'</p>':'')+
   '<div class="sh-review-actions"><button type="button" data-review-action="write" data-review-product="'+esc(el.dataset.reviewCard)+'">'+t('Write a review','রিভিউ লিখুন')+'</button>'+
   '<button type="button" data-review-action="view" data-review-product="'+esc(el.dataset.reviewCard)+'">'+t('View all','সব দেখুন')+'</button></div>';
 });
 document.querySelectorAll('[data-review-detail]').forEach(el=>{
  const legacy=el.dataset.reviewDetail,p=byLegacy(legacy),list=productReviews(p);
  el.innerHTML='<h3>'+t('Customer reviews','ক্রেতাদের রিভিউ')+'</h3><div>'+reviewSummaryHTML(list)+'</div>'+
  (list.length?'<div class="sh-review-list">'+list.slice(0,2).map(itemPreview).join('')+'</div>':'<p class="care-hint">'+t('No reviews yet. Be the first to write one.','এখনো রিভিউ নেই। প্রথম রিভিউটি লিখতে পারেন।')+'</p>')+
  '<div class="sh-review-actions"><button type="button" data-review-action="write" data-review-product="'+esc(legacy)+'">'+t('Write a review','রিভিউ লিখুন')+'</button>'+
  '<button type="button" data-review-action="view" data-review-product="'+esc(legacy)+'">'+t('View all reviews','সব রিভিউ দেখুন')+'</button></div>';
 });
}
function reviewOverlay(title,body){
 let panel=document.getElementById('shReviewOverlay');
 if(!panel){
  panel=document.createElement('div');panel.id='shReviewOverlay';panel.className='sh-review-full-overlay';
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
  panel.addEventListener('click',e=>{if(e.target===panel)panel.remove()});
  document.body.append(panel);
 }
 panel.innerHTML='<div class="sh-review-full-modal"><div class="sh-review-full-head"><h2>'+esc(title)+'</h2><button type="button" data-review-close aria-label="'+t('Close','বন্ধ করুন')+'">×</button></div>'+body+'</div>';
 panel.querySelector('[data-review-close]').onclick=()=>panel.remove();
 panel.querySelector('[data-review-close]').focus();
}
function showAllProductReviews(legacy){
 const p=byLegacy(legacy);
 if(!p){reviewOverlay(t('Reviews','রিভিউ'),'<p>'+t('Product unavailable','পণ্য পাওয়া যায়নি')+'</p>');return}
 const list=productReviews(p);
 const body='<p class="care-hint">'+esc(productName(p))+' · '+list.length+' '+t('published reviews','প্রকাশিত রিভিউ')+'</p>'+
 (list.length?'<div class="care-cards" style="display:grid;gap:12px">'+list.map(itemPreview).join('')+'</div>':'<p>'+t('No reviews yet.','এখনো কোনো রিভিউ নেই।')+'</p>')+
 '<div class="sh-review-actions"><button type="button" data-review-action="write" data-review-product="'+esc(legacy)+'">'+t('Write a review','রিভিউ লিখুন')+'</button></div>';
 reviewOverlay(t('Reviews for ','পণ্যের রিভিউ: ')+productName(p),body);
}
function writeReviewForProduct(legacy){
 const p=byLegacy(legacy);if(!p){reviewOverlay(t('Product unavailable','পণ্য পাওয়া যায়নি'),'<p>'+t('Please refresh and retry.','রিফ্রেশ করে আবার চেষ্টা করুন।')+'</p>');return}
 const body='<p class="care-intro">'+esc(productName(p))+'</p><form id="shInlineReviewForm" enctype="multipart/form-data">'+honeypot+
 '<div class="care-grid"><div><label>'+t('Your name','আপনার নাম')+' *</label><input name="reviewer_name" minlength="2" maxlength="90" required autocomplete="name"></div>'+
 '<div><label>'+t('Rating','রেটিং')+' *</label><select name="rating" required><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option><option value="1">★☆☆☆☆</option></select></div></div>'+
 '<label>'+t('Your review','আপনার রিভিউ')+' *</label><textarea name="review_text" minlength="12" maxlength="1200" required></textarea>'+
 '<label>'+t('Photo (optional, 4MB max)','ছবি (ঐচ্ছিক, সর্বোচ্চ ৪MB)')+'</label><input name="review_photo" type="file" accept="image/jpeg,image/png,image/webp">'+
 '<p class="care-hint">'+t('Reviews are published immediately. Do not include private contact details.','রিভিউ সঙ্গে সঙ্গে প্রকাশিত হয়। ব্যক্তিগত যোগাযোগের তথ্য লিখবেন না।')+'</p>'+
 '<div class="sh-review-actions"><button type="submit">'+t('Submit review','রিভিউ জমা দিন')+'</button><button type="button" data-review-action="view" data-review-product="'+esc(legacy)+'">'+t('Back to reviews','রিভিউতে ফিরুন')+'</button></div></form><div id="shInlineReviewMessage" role="status"></div>';
 reviewOverlay(t('Write a review','রিভিউ লিখুন'),body);
 const form=document.getElementById('shInlineReviewForm');
 form.onsubmit=async e=>{
  e.preventDefault();
  const button=form.querySelector('button[type=submit]');button.disabled=true;
  const data=new FormData(form);data.set('action','review');data.set('product_id',p.id);
  const photo=data.get('review_photo');
  if(!(photo instanceof File)||!photo.name||photo.size===0)data.delete('review_photo');
  else if(photo.size>4194304||!['image/jpeg','image/png','image/webp'].includes(photo.type)){
   document.getElementById('shInlineReviewMessage').innerHTML='<p class="care-error">'+t('Use a JPG/PNG/WebP photo up to 4MB.','সর্বোচ্চ ৪MB JPG/PNG/WebP ছবি দিন।')+'</p>';button.disabled=false;return;
  }
  try{
   const r=await fetch(endpoint,{method:'POST',headers:{apikey:key},body:data});
   const response=await r.json();
   if(!r.ok||!response.ok)throw Error(response.error||'Submission failed');
   form.reset();showReviewThanks();reloadReviews().then(()=>{refreshInlineReviews();return loadReviewPhotos()}).then(refreshInlineReviews).catch(console.warn);
  }catch(err){document.getElementById('shInlineReviewMessage').innerHTML='<p class="care-error">'+esc(err.message)+'</p>'}
  finally{button.disabled=false}
 };
}
document.addEventListener('click',e=>{
 const btn=e.target.closest('[data-review-action]');
 if(!btn)return;
 e.preventDefault();e.stopImmediatePropagation();
 const legacy=btn.dataset.reviewProduct;
 if(btn.dataset.reviewAction==='write')writeReviewForProduct(legacy);
 else if(btn.dataset.reviewAction==='view')showAllProductReviews(legacy);
},true);
const reviewCardGrids=['homeGrid','saleGrid','rvGrid','shopGrid','sRes'];
for(const name of reviewCardGrids){const el=document.getElementById(name);if(el)new MutationObserver(refreshInlineReviews).observe(el,{childList:true})}
const prodBox=document.getElementById('prodBox');
if(prodBox)new MutationObserver(refreshInlineReviews).observe(prodBox,{childList:true});
window.addEventListener('shopyhat:languagechange',()=>{render();refreshInlineReviews()});
Promise.allSettled([getCatalog(),getReviews()]).then(async ([catalog,approved])=>{
 if(catalog.status==='fulfilled')products=catalog.value;else productError=catalog.reason?.message||'Product service unavailable';
 if(approved.status==='fulfilled')reviews=approved.value;else loadError=approved.reason?.message||'Reviews unavailable';
 loading=false;
 if(tab==='issue'&&document.getElementById('careIssueForm')){
  const product=document.getElementById('csProduct'),selected=product.value;
  product.innerHTML=opts();
  product.value=selected;
 }else render();
 refreshInlineReviews();if(approved.status==='fulfilled'){await loadReviewPhotos();refreshInlineReviews()}
});
render();
})();