/**
 * SHOPYHAT verified archive receiver for private Google Sheet.
 * Deploy as an Apps Script Web App, "Execute as me"; access allowed to Anyone
 * ONLY after storing SHOPYHAT_ARCHIVE_SECRET and SHOPYHAT_SHEET_ID
 * in Apps Script → Project settings → Script properties.
 * This is NOT a public data feed; archive sender must supply the shared secret.
 */
function doPost(e) {
  const reply=(data)=>ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  try {
    const payload=JSON.parse(e.postData.contents||'{}');
    const props=PropertiesService.getScriptProperties();
    const password=props.getProperty('SHOPYHAT_ARCHIVE_SECRET')||'';
    const id=props.getProperty('SHOPYHAT_SHEET_ID')||'';
    if(password.length<20||payload.secret!==password||!id)return reply({ok:false,error:'Not authorized or not configured'});
    if(payload.action!=='archive_audit'||!Array.isArray(payload.rows)||payload.rows.length<1||payload.rows.length>40)return reply({ok:false,error:'Invalid archive batch'});
    const sheet=SpreadsheetApp.openById(id).getSheetByName('Archive_Audit');
    if(!sheet)return reply({ok:false,error:'Archive_Audit tab missing'});
    const headings=['Source ID','Created At (UTC)','Entity','Record ID','Record Label','Action','Actor','Role','Changes JSON','Archived At (UTC)','SHA256'];
    if(sheet.getRange(1,1,1,headings.length).getValues()[0].join('|')!==headings.join('|'))return reply({ok:false,error:'Archive header does not match'});
    const clean=v=>{const s=String(v??'');return /^[=+\-@]/.test(s)?' '+s:s};
    const digest=text=>Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,text,Utilities.Charset.UTF_8).map(x=>(x&255).toString(16).padStart(2,'0')).join('');
    const last=sheet.getLastRow();
    const existing=new Map();
    if(last>1)for(const row of sheet.getRange(2,1,last-1,11).getValues()){
      const key=String(row[0]),sha=String(row[10]);
      if(existing.has(key)&&existing.get(key)!==sha)return reply({ok:false,error:'Duplicate source ID mismatch'});
      existing.set(key,sha);
    }
    const missing=[],expected=new Map();
    for(const row of payload.rows){
      const {sha256,...orig}=row;
      if(!orig.id||!/^[a-f0-9]{64}$/i.test(sha256)||digest(JSON.stringify(orig))!==sha256)throw Error('Source row checksum mismatch');
      const key=String(orig.id);
      if(expected.has(key)||existing.has(key)&&existing.get(key)!==sha256)throw Error('Duplicate ID/checksum mismatch');
      expected.set(key,String(sha256));
      if(existing.has(key))continue;
      missing.push([
        clean(key),clean(orig.created_at),clean(orig.entity),clean(orig.record_id),
        clean(orig.record_label),clean(orig.action),clean(orig.actor_email),clean(orig.actor_role),
        clean(JSON.stringify(orig.changes||{})),new Date().toISOString(),clean(sha256)
      ]);
    }
    if(missing.length){
      const start=sheet.getLastRow()+1;
      const range=sheet.getRange(start,1,missing.length,11);
      range.setNumberFormat('@');
      range.setValues(missing);
    }
    SpreadsheetApp.flush();
    const after=sheet.getLastRow();
    const stored=new Map();
    for(const row of sheet.getRange(2,1,Math.max(1,after-1),11).getValues()){
      if(!row[0])continue;
      const key=String(row[0]);
      if(stored.has(key)&&stored.get(key)!==String(row[10]))throw Error('Duplicate archived source ID');
      stored.set(key,String(row[10]));
    }
    const verified=[...expected].filter(([key,sha])=>stored.get(key)===sha).map(([id,sha256])=>({id,sha256}));
    if(verified.length!==expected.size)throw Error('Google Sheets readback failed');
    return reply({ok:true,verified,added:missing.length});
  } catch (error) {
    return reply({ok:false,error:String(error.message||error).slice(0,240)});
  }
}
