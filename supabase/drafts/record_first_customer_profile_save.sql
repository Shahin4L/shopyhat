create or replace function sh_private.record_customer_profile_creation()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
 insert into public.sh_customer_profile_changes(user_id,fields)
 values(new.user_id,array_remove(array['full_name','phone',case when new.preferred_address<>'' then 'delivery_address' end],null));
 return new;
end $$;
revoke all on function sh_private.record_customer_profile_creation() from public, anon, authenticated;
create trigger sh_record_customer_profile_creation after insert on public.sh_customer_profiles
 for each row execute function sh_private.record_customer_profile_creation();