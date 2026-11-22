import {createClient} from 'npm:@supabase/supabase-js@2.49.10';
const url=Deno.env.get('SUPABASE_URL'),secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(!url||!secret)throw Error('Missing server credentials');
const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
const originAllowed=/^https:\/\/(shopyhat\.pages\.dev|shopyhat-stage\.pages\.dev)$/i;
const cors=origin=>({'content-type':'application/json','vary':'Origin','cache-control':'no-store','access-control-allow-origin':origin,'access-control-allow-headers':'authorization,apikey,content-type','access-control-allow-methods':'POST,OPTIONS'});
const response=(origin,body,status=200)=>new Response(JSON.stringify(body),{status,headers:cors(origin)});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const base='https://portal.packzy.com/api/v1';
const apiHeaders=()=>({'Api-Key':String(Deno.env.get('SHOPYHAT_STEADFAST_API_KEY')||''),'Secret-Key':String(Deno.env.get('SHOPYHAT_STEADFAST_SECRET_KEY')||''),'Content-Type':'application/json','Accept':'application/json'});
const configured=()=>Boolean(Deno.env.get('SHOPYHAT_STEADFAST_API_KEY')&&Deno.env.get('SHOPYHAT_STEADFAST_SECRET_KEY'));
const remote=async(path,method='GET',payload)=>{
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),13000);
 try{
  const result=await fetch(base+path,{method,headers:apiHeaders(),body:payload?JSON.stringify(payload):undefined,signal:controller.signal});
  const raw=await result.text();let parsed={};
  try{parsed=JSON.parse(raw)}catch{parsed={message:'Invalid courier response'}}
  return{ok:result.ok,data:parsed,status:result.status};
 }finally{clearTimeout(timer)}
};
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 if(!originAllowed.test(origin))return new Response('Forbidden',{status:403});
 if(req.method==='OPTIONS')return new Response(null,{headers:cors(origin)});
 if(req.method!=='POST')return response(origin,{error:'Only POST supported'},405);
 try{
  const bearer=(req.headers.get('authorization')||'').match(/^Bearer\s+(\S+)$/i)?.[1];
  if(!bearer)return response(origin,{error:'Admin login required'},401);
  const {data:identity,error:authError}=await db.auth.getUser(bearer);
  if(authError||!identity.user?.email)return response(origin,{error:'Invalid Admin token'},401);
  const {data:staff,error:roleError}=await db.from('sh_staff').select('role,active').eq('email',identity.user.email.toLowerCase()).maybeSingle();
  if(roleError||!staff?.active||!['owner','manager'].includes(staff.role))return response(origin,{error:'Owner or manager role required'},403);
  const input=await req.text();if(input.length>1500)return response(origin,{error:'Invalid request size'},413);
  const body=JSON.parse(input),action=body?.action;
  if(action==='status')return response(origin,{ok:true,configured:configured(),provider:'Steadfast'});
  if(!configured())return response(origin,{error:'Steadfast API credentials are not configured. Set them in Supabase Edge Function Secrets.'},409);
  if(action==='test'){
   const checked=await remote('/get_balance');
   if(!checked.ok)return response(origin,{error:'Courier connection failed (HTTP '+checked.status+'). Verify the API key and secret.'},502);
   return response(origin,{ok:true,message:'Steadfast connection validated. No shipment was created.'});
  }
  if(action!=='book'||!uuid.test(String(body.order_id||'')))return response(origin,{error:'Invalid courier action or order ID'},400);
  const {data:order,error:orderError}=await db.from('sh_orders').select('id,order_number,customer_name,customer_phone,address,status,payment_method,payment_status,total,courier,tracking_id').eq('id',body.order_id).maybeSingle();
  if(orderError||!order)return response(origin,{error:'Order not found'},404);
  if(!['Confirmed','Processing','Ready to Ship'].includes(order.status))return response(origin,{error:'Only confirmed, processing or ready-to-ship orders can be booked.'},409);
  if(order.tracking_id)return response(origin,{error:'This order already has a tracking ID. Review before booking again.'},409);
  if(!/^01[3-9][0-9]{8}$/.test(String(order.customer_phone||''))||!order.customer_name||!order.address||order.address.length>250)return response(origin,{error:'Customer delivery information needs correction before booking.'},409);
  const {data:existing}=await db.from('sh_courier_bookings').select('id,status').eq('order_id',order.id).eq('provider','steadfast').maybeSingle();
  if(existing)return response(origin,{error:'Courier attempt already exists ('+existing.status+'). Check the courier portal before retrying. Duplicate booking prevented.'},409);
  const inserted=await db.from('sh_courier_bookings').insert({order_id:order.id,provider:'steadfast',status:'submitting'}).select('id').single();
  if(inserted.error)return response(origin,{error:'Unable to reserve a unique shipment attempt. Check for existing booking.'},409);
  const bookingId=inserted.data.id;
  try{
   const amount=order.payment_method==='cod'?Number(order.total):0;
   if(!Number.isFinite(amount)||amount<0)throw Error('Invalid payment amount');
   const result=await remote('/create_order','POST',{
    invoice:order.order_number,recipient_name:String(order.customer_name).slice(0,100),
    recipient_phone:order.customer_phone,recipient_address:order.address,
    cod_amount:Math.round(amount*100)/100
   });
   const consignment=result.data?.consignment||{};
   const tracking=String(consignment.tracking_code||'');
   if(!result.ok||!consignment.consignment_id||!tracking)throw Error('Courier did not confirm a booking');
   await db.from('sh_courier_bookings').update({status:'booked',consignment_id:String(consignment.consignment_id),tracking_code:tracking,updated_at:new Date().toISOString()}).eq('id',bookingId);
   const updated=await db.from('sh_orders').update({courier:'Steadfast',tracking_id:tracking,updated_at:new Date().toISOString()}).eq('id',order.id).is('tracking_id',null);
   if(updated.error)return response(origin,{ok:true,tracking_code:tracking,warning:'Booked with courier but order sync needs manual review.'});
   return response(origin,{ok:true,tracking_code:tracking,message:'Parcel booked successfully. Tracking saved to SHOPYHAT order.'});
  }catch(err){
   await db.from('sh_courier_bookings').update({status:'needs_review',provider_note:'Review courier portal for this invoice before any retry',updated_at:new Date().toISOString()}).eq('id',bookingId);
   return response(origin,{error:'Booking status uncertain. Check the Steadfast portal using the order number before retrying; no automatic retry was made.'},502);
  }
 }catch(err){console.error('SHOPYHAT courier action failed',err instanceof Error?err.name:'unknown');return response(origin,{error:'Could not process courier request'},500)}
});
