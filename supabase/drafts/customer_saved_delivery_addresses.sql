alter table public.sh_customer_profiles
 add column saved_delivery_addresses jsonb not null default '[]'::jsonb
 check (jsonb_typeof(saved_delivery_addresses)='array' and jsonb_array_length(saved_delivery_addresses)<=10);
create or replace function sh_private.record_customer_profile_change()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
 changed text[] := array[]::text[];
begin
 if new.full_name is distinct from old.full_name then changed := array_append(changed,'full_name'); end if;
 if new.phone is distinct from old.phone then
  changed := array_append(changed,'phone');
  new.mobile_verified := false;
 end if;
 if (new.preferred_address,new.delivery_address,new.saved_delivery_addresses) is distinct from (old.preferred_address,old.delivery_address,old.saved_delivery_addresses) then
  changed := array_append(changed,'delivery_address');
 end if;
 if cardinality(changed)>0 then
  new.updated_at := now();
  insert into public.sh_customer_profile_changes(user_id,fields) values(old.user_id,changed);
 end if;
 return new;
end $$;

create function public.sh_manage_delivery_address(
 p_action text, p_id text default null, p_label text default null, p_address jsonb default null
)
returns public.sh_customer_profiles
language plpgsql security definer set search_path = ''
as $$
declare
 uid uuid := auth.uid();
 account_email text := lower(auth.jwt()->>'email');
 saved public.sh_customer_profiles;
 entries jsonb;
 entry jsonb;
 item_index integer;
 parts jsonb;
 formatted text;
 label text := coalesce(btrim(p_label),'');
begin
 if uid is null or coalesce(account_email,'')='' 
    or exists(select 1 from public.sh_reseller_accounts where user_id=uid)
    or exists(select 1 from public.sh_staff where lower(email)=account_email and active) then
  raise exception using errcode='42501', message='Sign in to your customer account.';
 end if;
 select * into saved from public.sh_customer_profiles where user_id=uid for update;
 if not found then
  raise exception using errcode='22023', message='Save your name and mobile number under Profile first.';
 end if;
 entries := saved.saved_delivery_addresses;
 if entries='[]'::jsonb and coalesce(saved.preferred_address,'')<>'' then
  entries := jsonb_build_array(jsonb_build_object(
   'id','legacy','label','Saved address','formatted',saved.preferred_address,
   'address',case when saved.delivery_address='{}'::jsonb then jsonb_build_object('line',saved.preferred_address) else saved.delivery_address end));
 end if;
 if p_id is not null then
  select (n-1)::integer into item_index from jsonb_array_elements(entries) with ordinality as e(value,n)
   where value->>'id'=p_id;
  if item_index is null then
   raise exception using errcode='22023', message='Address not found. Reload My Account and try again.';
  end if;
 end if;
 if p_action='save' then
  if char_length(label)>40 or p_address is null or jsonb_typeof(p_address)<>'object'
     or octet_length(p_address::text)>2400 then
   raise exception using errcode='22023', message='Check your address details and try again.';
  end if;
  select coalesce(jsonb_object_agg(key,btrim(value #>> '{}')),'{}'::jsonb) into parts
   from jsonb_each(p_address)
   where key in ('division','district','thana','area','line','landmark') and jsonb_typeof(value)='string';
  if coalesce(parts->>'division','') not in ('Barishal','Chattogram','Dhaka','Khulna','Mymensingh','Rajshahi','Rangpur','Sylhet')
     or coalesce(parts->>'district','')='' or coalesce(parts->>'thana','')=''
     or char_length(coalesce(parts->>'line',''))<4 then
   raise exception using errcode='22023', message='Enter your division, district, thana or upazila, and delivery details.';
  end if;
  formatted := concat_ws(', ',parts->>'line',nullif(parts->>'area',''),parts->>'thana',parts->>'district',parts->>'division',
   case when coalesce(parts->>'landmark','')<>'' then 'Landmark: '||(parts->>'landmark') end);
  if char_length(formatted)>400 then
   raise exception using errcode='22023', message='Shorten your full address to 400 characters or fewer.';
  end if;
  if p_id is null and jsonb_array_length(entries)>=10 then
   raise exception using errcode='22023', message='You can save up to 10 addresses.';
  end if;
  entry := jsonb_build_object('id',coalesce(p_id,gen_random_uuid()::text),'label',coalesce(nullif(label,''),'Delivery address'),'formatted',formatted,'address',parts);
  if item_index is null then entries := entries||jsonb_build_array(entry);
  else entries := jsonb_set(entries,array[item_index::text],entry,false); end if;
 elsif p_action='default' and item_index is not null then
  entries := jsonb_build_array(entries->item_index)||(entries-item_index);
 elsif p_action='delete' and item_index is not null then
  entries := entries-item_index;
 else
  raise exception using errcode='22023', message='Select an address and try again.';
 end if;
 update public.sh_customer_profiles set saved_delivery_addresses=entries,
  delivery_address=coalesce(entries->0->'address','{}'::jsonb),
  preferred_address=coalesce(entries->0->>'formatted','')
 where user_id=uid returning * into saved;
 return saved;
end $$;
revoke all on function public.sh_manage_delivery_address(text,text,text,jsonb) from public, anon;
grant execute on function public.sh_manage_delivery_address(text,text,text,jsonb) to authenticated;
