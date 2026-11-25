-- Run only after Brevo sender, Edge secret and provider access have been verified.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
do $$
begin
 if not exists(select 1 from vault.secrets where name='shopyhat_order_mail_dispatch') then
  perform vault.create_secret(gen_random_uuid()::text||gen_random_uuid()::text,'shopyhat_order_mail_dispatch');
 end if;
end $$;
select cron.schedule('shopyhat-order-mail','*/2 * * * *',
 $$select net.http_post(
   url:='https://xwfqgmgiunlxzvzoermn.supabase.co/functions/v1/shopyhat-order-mail',
   headers:=jsonb_build_object('content-type','application/json','apikey','sb_publishable_Tk-PzYsM3YxnDsjicnMdzQ_mQsREdkP','x-shopyhat-dispatch',(select decrypted_secret from vault.decrypted_secrets where name='shopyhat_order_mail_dispatch')),
   body:='{}'::jsonb
 ) where exists (select 1 from sh_private.sh_order_email_settings where id and enabled)
 and exists (select 1 from sh_private.sh_order_email_outbox where state='pending' or (state='sending' and lease_started_at<now()-interval '5 minutes'))$$);
-- Keep disabled until the test message is accepted and the recipient confirms delivery.
-- update sh_private.sh_order_email_settings set enabled=true where id;
