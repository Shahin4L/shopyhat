-- Keep unsent emails addressed to the current customer when staff edit an order.
create or replace function sh_private.sync_order_mail_recipient()
returns trigger language plpgsql security definer set search_path='' as $$
declare mail text; snapshot jsonb;
begin
 mail:=nullif(trim(coalesce(new.customer_email,'')),'');
 if mail is null and new.customer_user_id is not null then
  select email into mail from auth.users where id=new.customer_user_id and email_confirmed_at is not null;
 end if;
 snapshot:=jsonb_build_object('customer_name',new.customer_name,'order_number',new.order_number,'total',new.total);
 update sh_private.sh_order_email_outbox q
 set recipient=coalesce(mail,q.recipient), payload=snapshot,
     state=case when mail is null then 'skipped' else 'pending' end,
     error_code=case when mail is null then 'recipient_removed' else null end
 where q.order_id=new.id and (q.state='pending' or (q.state='skipped' and q.error_code='recipient_removed'));
 return new;
end $$;
revoke all on function sh_private.sync_order_mail_recipient() from public,anon,authenticated;
drop trigger if exists sh_sync_order_mail_recipient on public.sh_orders;
create trigger sh_sync_order_mail_recipient after update of customer_email,customer_user_id,customer_name,total on public.sh_orders
for each row execute function sh_private.sync_order_mail_recipient();
