const messages=[
 ['','Use a unique password. Aim for at least 15 characters or several unrelated words.'],
 ['Too short','Use at least 8 characters. Aim for 15 or more.'],
 ['Weak','Avoid common words, repeated characters and sequences. Try several unrelated words.'],
 ['Fair','Add a few more characters or another unrelated word.'],
 ['Strong','Use this password only for SHOPYHAT.']
];
export function passwordStrength(value){
 if(!value)return 0;
 const length=Array.from(value).length;
 if(length<8)return 1;
 const simple=value.toLowerCase().replace(/[^a-z0-9]/g,'');
 if(/^(password|qwerty|letmein|admin|shopyhat|iloveyou|welcome|123456|abc123|098765)/.test(simple)||
    /^(.)\1{5,}$/u.test(value)||/^(.{1,3})\1{3,}$/u.test(value)||/^[0-9]+$/.test(value)||
    /^[a-z]+[0-9]{1,4}[!@#$%&*]?$/.test(value)&&length<15)return 2;
 return length>=15?4:3;
}
export function bindPasswordStrength(input,host){
 if(!input||!host)return;
 const meter=host.querySelector('[role=progressbar]'),text=host.querySelector('[role=status]');
 if(!meter||!text)return;
 const update=()=>{
  const level=passwordStrength(input.value);
  const [label,hint]=messages[level];
  meter.dataset.level=level;
  meter.setAttribute('aria-valuenow',level);
  meter.setAttribute('aria-valuetext',label||'No password entered');
  const guidance=label?label+'. '+hint:hint;
  if(text.textContent!==guidance)text.textContent=guidance;
 };
 input.addEventListener('input',update);
 input.form?.addEventListener('reset',()=>queueMicrotask(update));
 update();
}
export function passwordStrengthMarkup(id){
 return '<div class="sh-password-guide" id="'+id+'"><div class="sh-password-meter" role="progressbar" aria-label="Password strength estimate" aria-valuemin="0" aria-valuemax="4"><span></span></div><p role="status" aria-live="polite"></p></div>';
}
