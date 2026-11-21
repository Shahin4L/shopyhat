/* SHOPYHAT privacy-first traffic counters. No IP, email, phone or browsing history stored. */
(function(){
 'use strict';
 const endpoint='https://xwfqgmgiunlxzvzoermn.supabase.co/functions/v1/shopyhat-visitor-metrics';
 const key='sb_publishable_Tk-PzYsM3YxnDsjicnMdzQ_mQsREdkP';
 let token='';
 try{token=localStorage.getItem('sh_analytics_visitor_v1')||'';if(!/^[a-f0-9-]{20,80}$/i.test(token)){token=crypto.randomUUID();localStorage.setItem('sh_analytics_visitor_v1',token)}}catch{token=crypto.randomUUID()}
 let last='',lastAt=0;
 function page(){
  const path=location.hash.replace(/^#/,'').split('/')[0].toLowerCase()||'home';
  return ['home','shop','track','contact','policies','care'].includes(path)?path:'home';
 }
 function send(){
  if(navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true)return;
  const type=page(),now=Date.now();
  if(type===last&&now-lastAt<30000)return;
  last=type;lastAt=now;
  fetch(endpoint,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:JSON.stringify({page:type,visitor:token}),keepalive:true,mode:'cors',cache:'no-store'}).catch(()=>{});
 }
 window.addEventListener('hashchange',send);
 window.addEventListener('pageshow',send);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',send,{once:true});else send();
})();