insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('shopyhat-hero-videos','shopyhat-hero-videos',true,26214400,ARRAY['video/mp4','video/webm'])
on conflict (id) do nothing;
create policy "sh_hero_video_owner_manager_upload"
on storage.objects for insert to authenticated
with check (bucket_id='shopyhat-hero-videos'
 and (storage.foldername(name))[1]='hero'
 and (select sh_private.staff_role()) in ('owner','manager'));
