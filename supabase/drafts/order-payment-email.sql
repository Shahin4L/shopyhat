-- Draft only: activate dispatch after provider credentials and end-to-end testing.
alter table public.sh_orders add column if not exists customer_email text;
alter table public.sh_reseller_fulfillment_requests add column if not exists customer_email text;
create or replace function public.sh_checkout_email_api(p jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb; mail text:=nullif(trim(coalesce(p->>'email','')),'');
begin
 if mail is not null and (length(mail)>254 or mail !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$') then raise exception 'Invalid customer email';end if;
 result:=sh_private.place_order(p);
 if coalesce((result->>'duplicate')::boolean,false)=false and mail is not null then
  update public.sh_orders set customer_email=mail where request_id=(p->>'request_id')::uuid;
 end if;
 return result;
end $$;
revoke all on function public.sh_checkout_email_api(jsonb) from public,anon,authenticated;
grant execute on function public.sh_checkout_email_api(jsonb) to service_role;

create or replace function public.sh_reseller_request_v3(p_variant uuid,p_qty integer,p_customer text,p_phone text,p_address text,p_retail numeric,p_zone text,p_email text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid; mail text:=nullif(trim(coalesce(p_email,'')),'');
begin
 if mail is not null and (length(mail)>254 or mail !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$') then raise exception 'Invalid customer email';end if;
 v_id:=public.sh_reseller_request_v2(p_variant,p_qty,p_customer,p_phone,p_address,p_retail,p_zone);
 update public.sh_reseller_fulfillment_requests set customer_email=mail where sh_reseller_fulfillment_requests.id=v_id and reseller_id=auth.uid();
 return v_id;
end $$;
revoke all on function public.sh_reseller_request_v3(uuid,integer,text,text,text,numeric,text,text) from public,anon;
grant execute on function public.sh_reseller_request_v3(uuid,integer,text,text,text,numeric,text,text) to authenticated;
CREATE OR REPLACE FUNCTION public.sh_approve_reseller_order(p_request uuid, p_zone text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r public.sh_reseller_fulfillment_requests%rowtype; v_row record; old_order record; ship numeric; sub numeric; oid uuid; ono text; cfg jsonb;
begin
 if auth.uid() is null or coalesce(sh_private.staff_role(),'') not in ('owner','manager') then raise exception 'Only an owner or manager can approve reseller orders'; end if;
 select * into r from public.sh_reseller_fulfillment_requests where id=p_request for update;
 if not found then raise exception 'Reseller request not found'; end if;
 if r.cancellation_status='pending' then raise exception 'Review the pending cancellation request first'; end if;
 if r.delivery_zone is not null and p_zone is distinct from r.delivery_zone then raise exception 'Delivery zone must match the reseller selection'; end if;
 select id,order_number,total into old_order from public.sh_orders where request_id=r.id;
 if found then
  if r.status='pending' then update public.sh_reseller_fulfillment_requests set status='approved',updated_at=now() where id=r.id; end if;
  return jsonb_build_object('ok',true,'order_number',old_order.order_number,'total',old_order.total,'duplicate',true);
 end if;
 if r.status not in ('pending','approved') then raise exception 'Only pending or approved requests can be converted'; end if;
 if p_zone is null or p_zone not in ('dhaka','outside') then raise exception 'Select a delivery zone'; end if;
 select value into cfg from public.sh_settings where key='shipping'; ship:=coalesce((cfg->>p_zone)::numeric,-1);
 if ship<0 then raise exception 'Delivery charge is not configured';end if;
 select sv.id,sv.product_id,sv.color,sv.sku,sv.stock,sv.active,p.name,p.status into v_row
 from public.sh_variants sv join public.sh_products p on p.id=sv.product_id where sv.id=r.variant_id for update of sv;
 if not found or not v_row.active or v_row.status<>'active' then raise exception 'Product is no longer available'; end if;
 if v_row.stock is not null and v_row.stock<r.quantity then raise exception 'Insufficient stock for this order'; end if;
 sub:=r.retail_unit_price*r.quantity;
 ono:='SH-'||pg_catalog.to_char(now(),'YYYYMMDD')||'-'||upper(substr(replace(pg_catalog.gen_random_uuid()::text,'-',''),1,8));
 insert into public.sh_orders(request_id,order_number,customer_name,customer_phone,address,zone,customer_note,payment_method,payment_status,status,subtotal,discount,shipping,total,internal_note)
 values(r.id,ono,r.customer_name,r.customer_phone,r.delivery_address,p_zone,'Reseller order', 'COD','Unpaid - COD','Pending',sub,0,ship,sub+ship,
 'Reseller fulfillment request: '||r.id::text||'; reseller: '||r.reseller_id::text) returning id into oid;
 insert into public.sh_order_items(order_id,product_id,variant_id,product_name,color,size,sku,qty,unit_price,line_total,image_url)
 values(oid,v_row.product_id,v_row.id,v_row.name,coalesce(v_row.color,''),'',coalesce(v_row.sku,''),r.quantity,r.retail_unit_price,sub,
 coalesce((select image_url from public.sh_product_images where product_id=v_row.product_id and (variant_id=v_row.id or variant_id is null) and length(trim(coalesce(image_url,'')))>0 order by (variant_id=v_row.id) desc nulls last,sort_order,id limit 1),''));
 update public.sh_orders set customer_email=r.customer_email where id=oid;
 if v_row.stock is not null then update public.sh_variants set stock=stock-r.quantity where id=v_row.id;end if;
 insert into public.sh_order_history(order_id,action,after_value,actor)
 values(oid,'RESELLER_ORDER_APPROVED',jsonb_build_object('request_id',r.id,'shipping',ship,'total',sub+ship),coalesce(auth.jwt()->>'email','staff'));
 update public.sh_reseller_fulfillment_requests set status='approved',updated_at=now() where id=r.id;
 return jsonb_build_object('ok',true,'order_number',ono,'total',sub+ship,'shipping',ship,'duplicate',false);
end $function$;

create table if not exists sh_private.sh_order_email_settings (
 id boolean primary key default true check(id), enabled boolean not null default false
);
insert into sh_private.sh_order_email_settings(id,enabled) values(true,false) on conflict (id) do nothing;
create table if not exists sh_private.sh_order_email_outbox(
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.sh_orders(id) on delete cascade,
 event_type text not null check(event_type in ('order_confirmed','payment_confirmed')),
 recipient text not null,
 payload jsonb not null,
 state text not null default 'pending' check(state in ('pending','sending','sent','failed','uncertain')),
 lease_id uuid,
 created_at timestamptz not null default now(),
 sent_at timestamptz,
 provider_message_id text,
 error_code text,
 unique(order_id,event_type)
);
revoke all on sh_private.sh_order_email_settings,sh_private.sh_order_email_outbox from public,anon,authenticated;
create or replace function sh_private.queue_order_confirmation()
returns trigger language plpgsql security definer set search_path='' as $$
declare mail text; snapshot jsonb; is_paid boolean; was_paid boolean;
begin
 if not coalesce((select enabled from sh_private.sh_order_email_settings where id),false) then return new;end if;
 mail:=nullif(trim(coalesce(new.customer_email,'')),'');
 if mail is null and new.customer_user_id is not null then select email into mail from auth.users where id=new.customer_user_id and email_confirmed_at is not null;end if;
 if mail is null then return new;end if;
 snapshot:=jsonb_build_object('customer_name',new.customer_name,'order_number',new.order_number,'total',new.total);
 if old.status is distinct from new.status and new.status='Confirmed' then
  insert into sh_private.sh_order_email_outbox(order_id,event_type,recipient,payload) values(new.id,'order_confirmed',mail,snapshot) on conflict(order_id,event_type) do nothing;
 end if;
 was_paid:=lower(coalesce(old.payment_status,'')) in ('verified - paid','paid','verified','collected - cod');
 is_paid:=lower(coalesce(new.payment_status,'')) in ('verified - paid','paid','verified','collected - cod');
 if not was_paid and is_paid then
  insert into sh_private.sh_order_email_outbox(order_id,event_type,recipient,payload) values(new.id,'payment_confirmed',mail,snapshot) on conflict(order_id,event_type) do nothing;
 end if;
 return new;
end $$;
drop trigger if exists sh_queue_order_confirmation on public.sh_orders;
create trigger sh_queue_order_confirmation after update of status,payment_status on public.sh_orders
for each row execute function sh_private.queue_order_confirmation();