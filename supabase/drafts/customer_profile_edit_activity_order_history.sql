create table if not exists public.sh_customer_profile_changes (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 fields text[] not null,
 changed_at timestamptz not null default now()
);
alter table public.sh_customer_profile_changes enable row level security;
revoke all on public.sh_customer_profile_changes from public, anon, authenticated;
grant select on public.sh_customer_profile_changes to authenticated;
create policy sh_customer_profile_changes_self on public.sh_customer_profile_changes
 for select to authenticated using (user_id = (select auth.uid()));
create index if not exists sh_customer_profile_changes_user_date
 on public.sh_customer_profile_changes(user_id, changed_at desc, id desc);

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
 if (new.preferred_address,new.delivery_address) is distinct from (old.preferred_address,old.delivery_address) then
  changed := array_append(changed,'delivery_address');
 end if;
 if cardinality(changed)>0 then
  new.updated_at := now();
  insert into public.sh_customer_profile_changes(user_id,fields) values(old.user_id,changed);
 end if;
 return new;
end $$;
revoke all on function sh_private.record_customer_profile_change() from public, anon, authenticated;
create trigger sh_record_customer_profile_change before update on public.sh_customer_profiles
 for each row execute function sh_private.record_customer_profile_change();

create or replace function public.sh_save_customer_profile(p_changes jsonb)
returns public.sh_customer_profiles language plpgsql security definer set search_path = ''
as $$
declare
 uid uuid := auth.uid();
 account_email text := lower(auth.jwt()->>'email');
 saved public.sh_customer_profiles;
 n text;
 p text;
 a jsonb;
 formatted text;
begin
 if uid is null or coalesce(account_email,'')='' then
  raise exception using errcode='42501', message='Sign in to your customer account again.';
 end if;
 if exists(select 1 from public.sh_reseller_accounts where user_id=uid)
    or exists(select 1 from public.sh_staff where lower(email)=account_email and active) then
  raise exception using errcode='42501', message='Customer account required.';
 end if;
 if p_changes is null or jsonb_typeof(p_changes)<>'object' or p_changes='{}'::jsonb
    or (p_changes - array['full_name','phone','delivery_address'])<>'{}'::jsonb then
  raise exception using errcode='22023', message='Invalid profile changes.';
 end if;
 n := btrim(p_changes->>'full_name');
 p := btrim(p_changes->>'phone');
 a := p_changes->'delivery_address';
 if p_changes ? 'full_name' and (n is null or char_length(n) not between 2 and 120) then
  raise exception using errcode='22023', message='Enter a full name between 2 and 120 characters.';
 end if;
 if p_changes ? 'phone' and (p is null or p !~ '^\+8801[3-9][0-9]{8}$') then
  raise exception using errcode='22023', message='Enter a valid Bangladesh mobile number.';
 end if;
 if p_changes ? 'delivery_address' then
  if jsonb_typeof(a)<>'object' or octet_length(a::text)>2400 or
     (a - array['division','district','thana','area','line','landmark'])<>'{}'::jsonb or
     exists(select 1 from jsonb_each(a) f where jsonb_typeof(f.value)<>'string') then
   raise exception using errcode='22023', message='Check your delivery address and try again.';
  end if;
  formatted := concat_ws(', ',nullif(a->>'line',''),nullif(a->>'area',''),nullif(a->>'thana',''),nullif(a->>'district',''),nullif(a->>'division',''),case when coalesce(a->>'landmark','')<>'' then 'Landmark: '||(a->>'landmark') end);
  if formatted<>'' and (coalesce(btrim(a->>'line'),'')='' or char_length(formatted) not between 10 and 400) then
   raise exception using errcode='22023', message='Enter a complete delivery address of up to 400 characters.';
  end if;
 end if;
 -- Existing profiles keep every field that was not part of this edit.
 update public.sh_customer_profiles
 set full_name=coalesce(n,full_name),phone=coalesce(p,phone),
     delivery_address=coalesce(a,delivery_address),preferred_address=coalesce(formatted,preferred_address),
     email=account_email
 where user_id=uid returning * into saved;
 if found then return saved; end if;
 if n is null or p is null then
  raise exception using errcode='22023', message='Save your name and mobile number under Profile first.';
 end if;
 insert into public.sh_customer_profiles(user_id, full_name, phone, email, delivery_address, preferred_address)
 values(uid,n,p,account_email,coalesce(a,'{}'::jsonb),coalesce(formatted,''))
 on conflict (user_id) do update
  set full_name=excluded.full_name,phone=excluded.phone,email=excluded.email,
      delivery_address=coalesce(a,sh_customer_profiles.delivery_address),
      preferred_address=coalesce(formatted,sh_customer_profiles.preferred_address)
 returning * into saved;
 return saved;
end $$;
revoke all on function public.sh_save_customer_profile(jsonb) from public, anon;
grant execute on function public.sh_save_customer_profile(jsonb) to authenticated;

create or replace function public.sh_customer_order_history(p_page integer default 0)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare uid uuid := auth.uid(); result jsonb;
begin
 if uid is null or exists(select 1 from public.sh_reseller_accounts where user_id=uid)
    or exists(select 1 from public.sh_staff where lower(email)=lower(auth.jwt()->>'email') and active) then
  raise exception using errcode='42501', message='Customer account required.';
 end if;
 if p_page is null or p_page not between 0 and 10000 then
  raise exception using errcode='22023', message='Invalid order page.';
 end if;
 select coalesce(jsonb_agg(to_jsonb(o) order by o.created_at desc, o.order_number desc),'[]'::jsonb) into result
 from (select order_number,status,total,created_at,payment_status,customer_phone,courier,tracking_id
   from public.sh_orders where customer_user_id=uid
   order by created_at desc,order_number desc limit 21 offset (20*p_page)) o;
 return result;
end $$;
revoke all on function public.sh_customer_order_history(integer) from public, anon;
grant execute on function public.sh_customer_order_history(integer) to authenticated;
