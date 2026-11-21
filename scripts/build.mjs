import { mkdir, copyFile, cp, readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const out = 'dist';
await mkdir(out, { recursive: true });
for (const f of ['index.html','admin.html','i18n.js','customer-care.js','visitor-analytics.js','brand-about.js','about-enhanced.css']) {
  await copyFile(f, join(out,f));
}
await cp('admin',join(out,'admin'),{recursive:true});
for (const name of await readdir('assets').catch(()=>[])) {
  if (!name.startsWith('.')) {
    await mkdir(join(out,'assets'),{recursive:true});
    await cp(join('assets',name),join(out,'assets',name),{recursive:true});
  }
}
const html=await readFile(join(out,'index.html'),'utf8');
const admin=await readFile(join(out,'admin','index.html'),'utf8');
const js=await readFile(join(out,'admin','app.js'),'utf8');
if (!html.includes('<!DOCTYPE html>')&&!html.includes('<!doctype html>')) throw new Error('Missing website HTML');
if (!admin.includes('Secure Admin Login')) throw new Error('Missing SHOPYHAT admin login');
if (!js.includes('shopyhat-auth-request')) throw new Error('Admin OTP backend missing');
for (const f of ['index.html','admin.html','i18n.js','customer-care.js','visitor-analytics.js','brand-about.js','about-enhanced.css','admin/index.html','admin/app.js','admin/config.js','admin/brand.js']) {
  const data=await stat(join(out,f));
  if(data.size===0) throw new Error('Empty file: '+f);
}
console.log('SHOPYHAT static build OK — /dist with website and secure admin.');
