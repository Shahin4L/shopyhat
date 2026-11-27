// SHOPYHAT bilingual after-sales policy editor. Uses existing staff-guarded insert RLS.
export const POLICY_DEFAULTS = {
  "returns": {
    "en": "Notify SHOPYHAT within 24 hours of actually receiving your parcel if it is damaged, defective, incorrect or materially different from the confirmed order. This is a notification window, not a deadline to ship the parcel back.\n\nKeep the item unused and unwashed, with tags and packaging where reasonably possible. Photos or videos help verification; an unboxing video is not the sole accepted evidence.\n\nChange-of-mind returns are not normally accepted. Hidden defects and statutory consumer rights remain subject to applicable law.",
    "bn": "পণ্য হাতে পাওয়ার পর ক্ষতিগ্রস্ত, ত্রুটিপূর্ণ, ভুল বা অর্ডারের বিবরণের সঙ্গে উল্লেখযোগ্য অমিল থাকলে ২৪ ঘণ্টার মধ্যে SHOPYHAT-কে জানান। এটি অভিযোগ জানানোর সময়সীমা, পণ্য ফেরত পাঠানোর নয়।\n\nসম্ভব হলে পণ্য অব্যবহৃত ও না ধোয়া অবস্থায় ট্যাগ ও প্যাকেটসহ রাখুন। ছবি বা ভিডিও যাচাইয়ে সহায়ক; আনবক্সিং ভিডিও একমাত্র গ্রহণযোগ্য প্রমাণ নয়।\n\nশুধু মত পরিবর্তনের কারণে সাধারণত ফেরত গ্রহণ করা হয় না। লুকানো ত্রুটি ও আইনগত ভোক্তা অধিকার প্রযোজ্য আইন অনুযায়ী বহাল থাকবে।"
  },
  "exchange": {
    "en": "Eligible incorrect or defective items may be exchanged subject to verification and stock. Customer-selected size or colour changes require prior approval; applicable charges and price differences are disclosed before agreement.\n\nIf an eligible replacement is unavailable, an applicable refund will be offered. Used or altered items are generally excluded unless statutory rights apply.",
    "bn": "ভুল বা ত্রুটিপূর্ণ পণ্য যাচাই ও স্টক সাপেক্ষে পরিবর্তন করা যাবে। ক্রেতার নির্বাচিত সাইজ বা রং পরিবর্তনে পূর্বানুমোদন প্রয়োজন; প্রযোজ্য চার্জ ও মূল্যের পার্থক্য আগে জানানো হবে।\n\nযোগ্য বিকল্প পণ্য না থাকলে প্রযোজ্য মূল্য ফেরতের ব্যবস্থা করা হবে। আইনগত অধিকার প্রযোজ্য না হলে ব্যবহৃত বা পরিবর্তিত পণ্য সাধারণত গ্রহণযোগ্য নয়।"
  },
  "process": {
    "en": "Contact customer support with your order number, registered phone number and issue details. Our team will acknowledge and review the complaint within 72 hours and provide return instructions. Do not send the parcel before receiving instructions.",
    "bn": "অর্ডার নম্বর, নিবন্ধিত ফোন নম্বর ও সমস্যার বিবরণসহ কাস্টমার সাপোর্টে যোগাযোগ করুন। আমাদের টিম ৭২ ঘণ্টার মধ্যে অভিযোগ গ্রহণ ও পর্যালোচনা করে ফেরতের নির্দেশনা জানাবে। নির্দেশনা পাওয়ার আগে পার্সেল পাঠাবেন না।"
  },
  "delivery": {
    "en": "SHOPYHAT bears applicable return and replacement delivery charges for verified seller errors. Any customer-preference exchange charges require prior agreement.\n\nReturns should use the courier that delivered the original order. An alternative courier may be agreed with SHOPYHAT before dispatch.",
    "bn": "বিক্রেতার যাচাইকৃত ভুলে প্রযোজ্য ফেরত ও প্রতিস্থাপন ডেলিভারি চার্জ SHOPYHAT বহন করবে। ক্রেতার পছন্দ পরিবর্তনের চার্জ পূর্বসম্মত হতে হবে।\n\nযে কুরিয়ারে মূল অর্ডার সরবরাহ করা হয়েছে, সেই কুরিয়ারেই পণ্য ফেরত পাঠাতে হবে। বিকল্প কুরিয়ার ব্যবহারের আগে SHOPYHAT-এর সঙ্গে আলোচনা করে সম্মতি নিতে হবে।"
  },
  "refund": {
    "en": "Approved refunds are processed within 3–7 working days after approval, subject to any earlier mandatory legal deadline. Approval and inspection must not be used to delay a statutory refund.\n\nFor advance payments, failure to deliver within the agreed time requires a full refund through the original payment method within the applicable 10-day period from payment, excluding payment-provider processing time, with legally required charges borne by SHOPYHAT. Where a shorter statutory deadline applies, it takes priority.\n\nCOD refunds use a verified, mutually agreed method such as bKash or Nagad where lawful. Refund amount and payment reference will be communicated; never share PIN or OTP.",
    "bn": "অনুমোদিত রিফান্ড অনুমোদনের পর ৩–৭ কার্যদিবসের মধ্যে প্রক্রিয়া করা হবে; আইনে নির্ধারিত কম সময়সীমা থাকলে তা প্রযোজ্য। অনুমোদন বা পরিদর্শনের মাধ্যমে আইনগত রিফান্ড বিলম্বিত করা হবে না।\n\nঅগ্রিম মূল্য পরিশোধের পর নির্ধারিত সময়ে পণ্য সরবরাহে ব্যর্থ হলে প্রযোজ্য ক্ষেত্রে পরিশোধের তারিখ থেকে ১০ দিনের মধ্যে (পেমেন্ট সেবাদাতার প্রক্রিয়াকরণের সময় বাদে) একই মাধ্যমে সম্পূর্ণ অর্থ ফেরত দেওয়া হবে এবং আইন অনুযায়ী চার্জ SHOPYHAT বহন করবে। আরও কম আইনগত সময়সীমা থাকলে সেটিই অগ্রাধিকার পাবে।\n\nক্যাশ অন ডেলিভারির রিফান্ড আইনসম্মতভাবে যাচাইকৃত ও উভয় পক্ষের সম্মত বিকাশ বা নগদের মাধ্যমে দেওয়া হবে। ফেরতের পরিমাণ ও লেনদেন রেফারেন্স জানানো হবে; পিন বা ওটিপি শেয়ার করবেন না।"
  }
};
Object.assign(POLICY_DEFAULTS,{"terms":{"en":"By placing an order, you agree to the published SHOPYHAT policies and applicable Bangladesh law. Provide accurate contact and delivery information and use the website lawfully. Product colours may vary slightly by screen; prices and availability are subject to confirmation. Review the total and delivery charges before ordering.\n\nOrders are subject to stock and confirmation. Payment, cancellation, delivery, return and refund are governed by the corresponding published policies. SHOPYHAT content may not be reproduced without permission. Contact customer support to resolve disputes; nothing in these terms limits mandatory consumer rights. Updates apply prospectively.","bn":"অর্ডার করার মাধ্যমে আপনি SHOPYHAT-এর প্রকাশিত নীতিমালা ও বাংলাদেশের প্রযোজ্য আইন মেনে নিতে সম্মত হন। সঠিক যোগাযোগ ও ডেলিভারি তথ্য দিন এবং বৈধভাবে ওয়েবসাইট ব্যবহার করুন। স্ক্রিনভেদে পণ্যের রঙ সামান্য ভিন্ন হতে পারে; মূল্য ও স্টক নিশ্চিতকরণ সাপেক্ষ। অর্ডারের আগে মোট মূল্য ও ডেলিভারি চার্জ যাচাই করুন।\n\nঅর্ডার স্টক ও নিশ্চিতকরণ সাপেক্ষ। পেমেন্ট, বাতিল, ডেলিভারি, ফেরত ও রিফান্ড সংশ্লিষ্ট প্রকাশিত নীতিমালা অনুযায়ী পরিচালিত হবে। অনুমতি ছাড়া SHOPYHAT-এর নিজস্ব কনটেন্ট পুনঃপ্রকাশ করা যাবে না। বিরোধ সমাধানে কাস্টমার সাপোর্টে যোগাযোগ করুন; আইনগত ভোক্তা অধিকার অক্ষুণ্ণ থাকবে। পরিবর্তিত শর্ত ভবিষ্যতের অর্ডারে প্রযোজ্য।"},"privacy":{"en":"We collect customer name, phone, delivery address, order details and information voluntarily supplied to support, including optional email. We use these to fulfil orders, communicate, handle complaints and improve service. We do not sell customer personal information. Necessary data may be shared with delivery and service providers. We take reasonable security measures. Customers may request correction or deletion subject to applicable law and necessary transaction records.","bn":"আমরা ক্রেতার নাম, ফোন, ডেলিভারি ঠিকানা, অর্ডারের বিবরণ ও স্বেচ্ছায় দেওয়া তথ্য, ঐচ্ছিক ইমেইলসহ, সংগ্রহ করি। অর্ডার সম্পন্ন, যোগাযোগ, অভিযোগ নিষ্পত্তি ও সেবা উন্নয়নে এগুলো ব্যবহার করি। ব্যক্তিগত তথ্য বিক্রি করি না। প্রয়োজনীয় তথ্য ডেলিভারি ও সেবা প্রদানকারীর সঙ্গে শেয়ার হতে পারে। যুক্তিসংগত নিরাপত্তা ব্যবস্থা গ্রহণ করি। প্রযোজ্য আইন ও প্রয়োজনীয় লেনদেন রেকর্ড সাপেক্ষে তথ্য সংশোধন বা মুছে ফেলার আবেদন করা যাবে।"},"shipping":{"en":"Delivery charges are displayed at checkout. Estimated delivery depends on destination, stock and courier service. Provide a reachable phone number and accurate address. Contact support if delivery is delayed or the parcel is damaged. Mandatory consumer rights remain unaffected.","bn":"চেকআউটে ডেলিভারি চার্জ দেখানো হয়। সম্ভাব্য ডেলিভারি সময় গন্তব্য, স্টক ও কুরিয়ার সেবার ওপর নির্ভর করে। সচল ফোন নম্বর ও সঠিক ঠিকানা দিন। ডেলিভারিতে দেরি বা পার্সেল ক্ষতিগ্রস্ত হলে সাপোর্টে যোগাযোগ করুন। আইনগত ভোক্তা অধিকার বহাল থাকবে।"},"cancellation":{"en":"Contact support promptly with your order number to request cancellation. Before dispatch, cancellation is subject to order verification. After dispatch, contact support for applicable return instructions. Any eligible prepaid refund follows the refund policy and applicable law.","bn":"অর্ডার বাতিল করতে অর্ডার নম্বরসহ দ্রুত সাপোর্টে যোগাযোগ করুন। পাঠানোর আগে অর্ডার যাচাই সাপেক্ষে বাতিল করা যাবে। পাঠানোর পরে প্রযোজ্য ফেরত নির্দেশনার জন্য সাপোর্টে যোগাযোগ করুন। যোগ্য অগ্রিম পেমেন্টের রিফান্ড সংশ্লিষ্ট নীতি ও আইন অনুযায়ী হবে।"},"payment":{"en":"Available payment methods and total charges are shown at checkout. Cash on delivery is payable on receipt. bKash or Nagad transfers, when enabled, require manual verification; a transaction reference is not proof of confirmation. Never share PIN or OTP. Refunds follow the published refund policy.","bn":"চেকআউটে উপলব্ধ পেমেন্ট পদ্ধতি ও মোট চার্জ দেখানো হয়। ক্যাশ অন ডেলিভারিতে পণ্য গ্রহণের সময় মূল্য পরিশোধ করুন। বিকাশ বা নগদ চালু থাকলে ট্রান্সফার ম্যানুয়ালি যাচাই করা হয়; ট্রানজেকশন রেফারেন্স নিশ্চিতকরণের প্রমাণ নয়। পিন বা ওটিপি শেয়ার করবেন না। রিফান্ড প্রকাশিত নীতি অনুযায়ী হবে।"}});
const KEYS = ["terms","privacy","returns","exchange","refund","shipping","cancellation","payment","process","delivery"];
const TITLES = {returns:"Return Policy",exchange:"Exchange Policy",process:"How to request",delivery:"Return delivery charges",refund:"Refund Policy"};
Object.assign(TITLES,{"terms":"Terms & Conditions","privacy":"Privacy Policy","shipping":"Delivery & Shipping Policy","cancellation":"Cancellation Policy","payment":"Payment Policy"});
const DRAFT_KEY = "shopyhat-policy-draft-v1";
export function setupAfterSalesPolicyEditor({settings,getPolicy,notify}){
  const wrap=document.createElement("section");
  wrap.style.cssText="border:1px solid #dfd2bd;border-radius:14px;padding:16px;max-width:900px;display:grid;gap:12px";
  wrap.innerHTML='<h3 style="margin:0">Bilingual customer policy editor</h3><p class="muted">Edit English and বাংলা text. Separate paragraphs with an empty line. Save draft locally, preview both languages, then use Publish new policy version above to publish to customers.</p><div id="asEditorFields"></div><div style="display:flex;flex-wrap:wrap;gap:8px"><button class="btn" type="button" id="asSaveDraft">Save draft on this device</button><button class="btn" type="button" id="asRestoreDraft">Restore draft</button><button class="btn" type="button" id="asPreviewButton">Preview EN / বাংলা</button></div><div id="asPolicyPreview" role="region" aria-label="Bilingual policy preview" hidden></div>';
  settings.append(wrap);
  const fields=wrap.querySelector("#asEditorFields");const nav=document.createElement("select");nav.setAttribute("aria-label","Select policy to edit");for(const key of KEYS)nav.add(new Option(TITLES[key],key));fields.before(nav);nav.onchange=()=>{for(const g of fields.children)g.hidden=g.dataset.key!==nav.value;};
  for(const key of KEYS){
    const group=document.createElement("fieldset");group.style.cssText="border:1px solid #ddd;border-radius:10px;margin:12px 0;padding:12px";
    group.dataset.key=key;group.hidden=key!==KEYS[0];const legend=document.createElement("legend");legend.textContent=TITLES[key];group.append(legend);
    for(const lang of ["en","bn"]){
      const label=document.createElement("label");label.style.cssText="display:block;margin:8px 0";
      label.textContent=lang==="bn"?"বাংলা":"English";
      const textarea=document.createElement("textarea");textarea.dataset.policyKey=key;textarea.dataset.lang=lang;textarea.rows=5;textarea.maxLength=7000;textarea.required=true;textarea.style.cssText="display:block;width:100%;box-sizing:border-box;margin-top:5px";
      label.append(textarea);group.append(label);
    }
    fields.append(group);
  }
  const inputs=[...fields.querySelectorAll("textarea")];
  const getValues=()=>{
    const output={};
    for(const key of KEYS)output[key]={en:"",bn:""};
    for(const input of inputs)output[input.dataset.policyKey][input.dataset.lang]=input.value.trim();
    return output;
  };
  const applyValues=values=>{
    for(const input of inputs)input.value=String(values?.[input.dataset.policyKey]?.[input.dataset.lang]||POLICY_DEFAULTS[input.dataset.policyKey][input.dataset.lang]);
  };
  function load(policy){applyValues(policy?.content?.sections||POLICY_DEFAULTS);wrap.dataset.version=String(policy?.version||"");}
  function content(){
    const sections=getValues();
    for(const key of KEYS)for(const lang of ["en","bn"]){
      const v=sections[key][lang];
      if(v.length<15)throw Error("Both languages are required for "+TITLES[key]);
      if(v.length>7000)throw Error("Policy section is too long");
    }
    const policy=getPolicy();
    if(!policy)throw Error("Load current policy before publishing");
    return {...(policy.content||{}),sections};
  }
  function preview(){
    const values=getValues(),host=wrap.querySelector("#asPolicyPreview");host.replaceChildren();host.hidden=false;
    for(const key of KEYS){
      const card=document.createElement("article");card.style.cssText="border-top:1px solid #ddd;padding:12px 0";
      const h=document.createElement("h4");h.textContent=TITLES[key];card.append(h);
      for(const lang of ["en","bn"]){
        const heading=document.createElement("strong");heading.textContent=lang==="bn"?"বাংলা":"English";card.append(heading);
        const p=document.createElement("p");p.style.whiteSpace="pre-wrap";p.textContent=values[key][lang];card.append(p);
      }
      host.append(card);
    }
    host.scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  wrap.querySelector("#asPreviewButton").onclick=preview;
  wrap.querySelector("#asSaveDraft").onclick=()=>{
    try{localStorage.setItem(DRAFT_KEY,JSON.stringify({baseVersion:getPolicy()?.version,sections:getValues()}));notify("Draft saved on this device. Not yet published.");}
    catch(e){notify("Could not save local draft: "+e.message,true);}
  };
  wrap.querySelector("#asRestoreDraft").onclick=()=>{
    try{const v=JSON.parse(localStorage.getItem(DRAFT_KEY)||"null");if(!v?.sections)throw Error("No saved draft");applyValues(v.sections);notify("Draft restored. Preview before publishing.");}
    catch(e){notify(e.message,true);}
  };
  function published(){try{localStorage.removeItem(DRAFT_KEY)}catch{}}
  return {load,content,published};
}
