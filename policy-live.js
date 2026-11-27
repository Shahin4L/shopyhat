// Synchronize published bilingual policies without exposing administrative access.
(function(){
"use strict";
const URL="https://xwfqgmgiunlxzvzoermn.supabase.co/rest/v1/sh_after_sales_policy?select=version,created_at,return_hours,refund_min_days,refund_max_days,review_hours,content&order=version.desc&limit=1";
const KEY="sb_publishable_Tk-PzYsM3YxnDsjicnMdzQ_mQsREdkP";
const IDs=["returns","exchange","process","delivery","refund"];
const bnNumber=n=>String(n).replace(/[0-9]/g,d=>"০১২৩৪৫৬৭৮৯"[Number(d)]);
function updateLanguage(node,en,bn){
  const first=node.querySelector("[data-policy-en]"),second=node.querySelector("[data-policy-bn]");
  if(first)first.textContent=en;if(second)second.textContent=bn;
}
async function sync(){
  const root=document.getElementById("p-policies");if(!root)return;
  const response=await fetch(URL,{headers:{apikey:KEY},cache:"no-store"});
  if(!response.ok)throw Error("Policy API "+response.status);
  const records=await response.json(),policy=records[0],sections=policy?.content?.sections;
  if(!policy||!sections)return;
  // Validate the entire publication before touching the page: never present mixed versions.
  if(!IDs.every(id=>typeof sections[id]?.en==="string"&&typeof sections[id]?.bn==="string"&&sections[id].en.trim()&&sections[id].bn.trim()))return;
  for(const id of IDs){
    const section=root.querySelector("#"+id);
    if(!section)continue;
    const existing=[...section.children].filter(e=>e.tagName==="P");
    for(const old of existing)old.remove();
    const paragraphs={en:sections[id].en.split(/\n\s*\n/),bn:sections[id].bn.split(/\n\s*\n/)};
    const count=Math.max(paragraphs.en.length,paragraphs.bn.length);
    for(let i=0;i<count;i++){
      const p=document.createElement("p");
      for(const lang of ["en","bn"]){
        const span=document.createElement("span");
        span.lang=lang;span.setAttribute("data-policy-"+lang,"");span.setAttribute("data-no-translate","");
        span.textContent=(paragraphs[lang][i]||"").trim();
        span.style.whiteSpace="pre-line";p.append(span);
      }
      const anchor=section.querySelector(".sh-policy-cta");
      if(anchor)section.insertBefore(p,anchor);else section.append(p);
    }
  }
  const summary=root.querySelector(".sh-policy-summary");
  if(summary){
    const figures=summary.querySelectorAll("strong");
    if(figures[0])updateLanguage(figures[0],policy.return_hours+" hours",bnNumber(policy.return_hours)+" ঘণ্টা");
    if(figures[1])updateLanguage(figures[1],policy.refund_min_days+"–"+policy.refund_max_days+" working days",bnNumber(policy.refund_min_days)+"–"+bnNumber(policy.refund_max_days)+" কার্যদিবস");
  }
  const desc=root.querySelector(".pagehead p");
  if(desc&&policy.created_at){
    const stamp=new Date(policy.created_at).toLocaleDateString("en-GB",{timeZone:"Asia/Dhaka",day:"numeric",month:"long",year:"numeric"});
    desc.textContent="Privacy, return, exchange and refund policy. Published "+stamp+".";
  }
  root.dataset.policyVersion=String(policy.version);
  window.dispatchEvent(new CustomEvent("shopyhat:policy-updated",{detail:{version:policy.version}}));
}
sync().catch(e=>console.warn("Published policy sync unavailable; showing last reviewed fallback.",e));
document.addEventListener("visibilitychange",()=>{if(!document.hidden)sync().catch(()=>{})});
})();
