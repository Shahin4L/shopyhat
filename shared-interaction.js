(()=>{'use strict';
const bn=()=>document.documentElement.lang==='bn';
const tr=(en,b)=>bn()?b:en;
const style=document.createElement('style');style.textContent=`
@media screen {
button:not(:disabled),[role=button]{touch-action:manipulation;transition:filter .15s,transform .12s,box-shadow .15s}
button:not(:disabled):active{transform:scale(.97)}
button:disabled{cursor:not-allowed;opacity:.55}
button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid #b95713;outline-offset:3px}
input:not([type=hidden]):not([type=checkbox]):not([type=radio]),select,textarea{max-width:100%;box-sizing:border-box}
input[type=checkbox],input[type=radio]{accent-color:#b95713}
.sh-ux-touched:invalid{border-color:#b42318!important;box-shadow:0 0 0 2px #b4231820}
.sh-ux-touched:required:valid{border-color:#28784d!important}
.sh-ux-star{color:#b42318;font-weight:800;margin-inline:4px}
.sh-ux-hint{display:block;font-size:12px;line-height:1.5;margin:5px 0 8px;overflow-wrap:anywhere}
.sh-ux-meter{height:5px;border-radius:5px;background:#b0a59a44;overflow:hidden;margin-bottom:5px}
.sh-ux-meter i{display:block;height:100%;transition:width .2s}
@media(max-width:640px){form input:not([type=checkbox]):not([type=radio]):not([type=hidden]),form select,form textarea{font-size:16px;min-height:44px}form button{min-height:44px;white-space:normal}}
@media(prefers-reduced-motion:reduce){button,.sh-ux-meter i{transition:none}}
}`;document.head.append(style);
const meters=new WeakMap(),errors=new WeakMap();let serial=0;
function labelFor(f){return f.labels?.[0]||f.closest('label')||(f.previousElementSibling?.tagName==='LABEL'?f.previousElementSibling:null)}
function hint(f,map){let h=map.get(f);if(h?.isConnected)return h;h=document.createElement('div');h.className='sh-ux-hint';h.id='sh-ux-hint-'+(++serial);h.setAttribute('aria-live','polite');const anchor=f.closest('.sh-password-input')||f;anchor.after(h);map.set(f,h);f.setAttribute('aria-describedby',[f.getAttribute('aria-describedby'),h.id].filter(Boolean).join(' '));return h}
function strength(f){if(!f.matches('input[type=password][autocomplete=new-password],input[autocomplete=new-password]')||/confirm|repeat/i.test(f.name||f.id))return;const h=hint(f,meters),v=f.value;let score=0;if(v.length>=10)score++;if(v.length>=14)score++;if(/[a-z]/.test(v)&&/[A-Z]/.test(v)&&/\d/.test(v))score++;if(/[^a-zA-Z0-9]/.test(v))score++;if(/^(.)\1+$|password|123456|qwerty/i.test(v))score=0;const level=!v?0:score>=3?3:score>=2?2:1;const colors=['#888','#b42318','#986600','#28784d'];h.replaceChildren();const bar=document.createElement('div');bar.className='sh-ux-meter';const fill=document.createElement('i');fill.style.width=(level*100/3)+'%';fill.style.background=colors[level];bar.append(fill);const t=document.createElement('span');t.textContent=[tr('Use a long, unique password.','দীর্ঘ ও আলাদা পাসওয়ার্ড ব্যবহার করুন।'),tr('Weak — use a longer, unique password.','দুর্বল — আরও দীর্ঘ ও আলাদা পাসওয়ার্ড দিন।'),tr('Moderate — add length or variety.','মাঝারি — দৈর্ঘ্য বা বৈচিত্র্য বাড়ান।'),tr('Strong estimate — avoid reused passwords.','শক্তিশালী মনে হচ্ছে — পুরোনো পাসওয়ার্ড ব্যবহার করবেন না।')][level];t.style.color=colors[level];h.append(bar,t)}
function validate(f){if(!f.willValidate)return;f.classList.add('sh-ux-touched');let h=errors.get(f);if(f.validity.valid){if(h)h.hidden=true;return}h=hint(f,errors);h.hidden=false;h.style.color='#b42318';h.textContent=f.validity.valueMissing?tr('Please complete this required field.','এই আবশ্যিক ঘরটি পূরণ করুন।'):f.validationMessage}
function scan(){document.querySelectorAll('input[required],select[required],textarea[required]').forEach(f=>{const l=labelFor(f);if(!l||l.querySelector('.sh-required-star,.sh-ux-star')||/[★*]\s*$/.test(l.textContent.trim()))return;const s=document.createElement('span');s.className='sh-ux-star';s.textContent=' ★';s.title=tr('Required','আবশ্যিক');l.append(s)});document.querySelectorAll('input[autocomplete=new-password]').forEach(f=>{if(!meters.has(f))strength(f)});document.querySelectorAll('[role=alert],[role=status]').forEach(n=>{if(!n.hasAttribute('aria-atomic'))n.setAttribute('aria-atomic','true')})}
let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;scan()})}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['required']});document.addEventListener('input',e=>{const f=e.target;if(!f.matches('input,select,textarea'))return;strength(f);if(f.classList.contains('sh-ux-touched'))validate(f)});document.addEventListener('focusout',e=>{if(e.target.matches('input,select,textarea'))validate(e.target)});document.addEventListener('invalid',e=>validate(e.target),true);scan();
})();