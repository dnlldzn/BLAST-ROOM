create table if not exists public.user_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_name text not null check (char_length(trim(course_name)) between 1 and 120),
  instructor text not null default 'TBA'
    check (char_length(instructor) <= 120),
  progress integer not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.course_offerings (
  id uuid primary key default gen_random_uuid(),
  course_name text not null check (char_length(trim(course_name)) between 1 and 120),
  instructor text not null default 'TBA' check (char_length(instructor) <= 120),
  share_code text not null unique check (share_code ~ '^[A-F0-9]{10}$'),
  created_by uuid references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

insert into public.course_offerings (course_name, instructor, share_code)
select seed.course_name, seed.instructor,
  upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
from (values
  ('AUTOCAD', 'Mr. Robin Gonzales'),
  ('OLIMFBDS', 'Mr. Robin Gonzales'),
  ('OLCOEPRO', 'Mr. Robin Gonzales'),
  ('OLMATH01', 'Ms. Mary Joyce Luceño')
) as seed(course_name, instructor)
where not exists (
  select 1
  from public.course_offerings offering
  where lower(offering.course_name) = lower(seed.course_name)
);

create unique index if not exists course_offerings_course_name_lower_idx
  on public.course_offerings (lower(course_name));

alter table public.user_courses
  add column if not exists offering_id uuid
  references public.course_offerings (id) on delete cascade;

create index if not exists user_courses_user_id_idx
  on public.user_courses (user_id);

create unique index if not exists user_courses_user_offering_idx
  on public.user_courses (user_id, offering_id)
  where offering_id is not null;

alter table public.user_courses enable row level security;
alter table public.course_offerings enable row level security;

revoke all on public.user_courses from anon;
revoke insert, update, delete on public.user_courses from authenticated;
grant select on public.user_courses to authenticated;

revoke all on public.course_offerings from anon;
revoke insert, update, delete on public.course_offerings from authenticated;
grant select on public.course_offerings to authenticated;

drop policy if exists "Users can read their own courses"
  on public.user_courses;
create policy "Users can read their own courses"
  on public.user_courses
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can enroll in their own courses"
  on public.user_courses;
drop policy if exists "Course managers can read published courses"
  on public.course_offerings;
create policy "Course managers can read published courses"
  on public.course_offerings
  for select
  to authenticated
  using (
    created_by = (select auth.uid())
    or (created_by is null and (auth.jwt() -> 'app_metadata' ->> 'role')
      in ('teacher', 'admin', 'administrator'))
    or (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator')
  );

create or replace function public.create_course_offering(
  p_course_name text,
  p_instructor text default null
)
returns table (
  id uuid,
  course_name text,
  instructor text,
  share_code text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text := coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '');
  v_name text := trim(p_course_name);
  v_code text;
  v_offering public.course_offerings%rowtype;
begin
  if v_role not in ('teacher', 'admin', 'administrator') then
    raise exception 'Only teachers and administrators can publish courses'
      using errcode = '42501';
  end if;

  if v_name is null or char_length(v_name) not between 1 and 120 then
    raise exception 'Course name must be between 1 and 120 characters'
      using errcode = '22023';
  end if;

  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    insert into public.course_offerings as new_offering (
      course_name, instructor, share_code, created_by
    )
    values (
      v_name,
      coalesce(nullif(trim(p_instructor), ''), 'TBA'),
      v_code,
      auth.uid()
    )
    on conflict (share_code) do nothing
    returning new_offering.* into v_offering;

    if found then
      return query
      select v_offering.id, v_offering.course_name,
        v_offering.instructor, v_offering.share_code;
      return;
    end if;
  end loop;
end;
$$;

create or replace function public.enroll_student_in_course(p_share_code text)
returns table (
  course_name text,
  instructor text,
  progress integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_offering public.course_offerings%rowtype;
begin
  if v_user_id is null then
    raise exception 'Sign in before enrolling in a course'
      using errcode = '42501';
  end if;

  select offering.* into v_offering
  from public.course_offerings as offering
  where offering.share_code = upper(trim(p_share_code));

  if not found then
    raise exception 'Invalid course code'
      using errcode = '22023';
  end if;

  insert into public.user_courses (
    user_id, offering_id, course_name, instructor, progress
  )
  values (
    v_user_id, v_offering.id, v_offering.course_name, v_offering.instructor, 0
  )
  on conflict (user_id, offering_id) where offering_id is not null do nothing;

  return query
  select enrollment.course_name, enrollment.instructor, enrollment.progress
  from public.user_courses as enrollment
  where enrollment.user_id = v_user_id
    and enrollment.offering_id = v_offering.id;
end;
$$;

revoke all on function public.create_course_offering(text, text) from public, anon;
grant execute on function public.create_course_offering(text, text) to authenticated;
revoke all on function public.enroll_student_in_course(text) from public, anon;
grant execute on function public.enroll_student_in_course(text) to authenticated;

create table if not exists public.class_posts (
  id bigint generated by default as identity primary key,
  kind text not null check (kind in ('announcement', 'activity')),
  title text not null check (char_length(title) between 1 and 120),
  content text not null check (char_length(content) between 1 and 5000),
  course_id text,
  due_date date,
  author_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint activity_requires_due_date check (kind <> 'activity' or due_date is not null)
);

create index if not exists class_posts_created_at_idx
  on public.class_posts (created_at desc);

alter table public.class_posts enable row level security;

revoke all on public.class_posts from anon;
grant select, insert on public.class_posts to authenticated;
grant usage, select on sequence public.class_posts_id_seq to authenticated;

drop policy if exists "Authenticated users can read class posts"
  on public.class_posts;
create policy "Authenticated users can read class posts"
  on public.class_posts
  for select
  to authenticated
  using (true);

drop policy if exists "Teachers can publish class posts"
  on public.class_posts;
create policy "Teachers can publish class posts"
  on public.class_posts
  for insert
  to authenticated
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'teacher'
    and author_id = (select auth.uid())
  );

create table if not exists public.class_post_reads (
  user_id uuid not null references auth.users (id) on delete cascade,
  post_id bigint not null references public.class_posts (id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

alter table public.class_post_reads enable row level security;

revoke all on public.class_post_reads from anon;
grant select, insert, update on public.class_post_reads to authenticated;

drop policy if exists "Students can read their own post read status"
  on public.class_post_reads;
create policy "Students can read their own post read status"
  on public.class_post_reads
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Students can save their own post read status"
  on public.class_post_reads;
create policy "Students can save their own post read status"
  on public.class_post_reads
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Students can update their own post read status"
  on public.class_post_reads;
create policy "Students can update their own post read status"
  on public.class_post_reads
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'class_posts'
  ) then
    execute 'alter publication supabase_realtime add table public.class_posts';
  end if;
end;
$$;

create table if not exists public.assignment_submissions (
  user_id uuid not null references auth.users (id) on delete cascade,
  assignment_id text not null,
  response text not null default '',
  attachments jsonb not null default '[]'::jsonb
    check (jsonb_typeof(attachments) = 'array'),
  submitted_at timestamptz not null default now(),
  primary key (user_id, assignment_id)
);

alter table public.assignment_submissions enable row level security;

revoke all on public.assignment_submissions from anon;
grant select, insert, update on public.assignment_submissions to authenticated;

drop policy if exists "Students can read their own assignment submissions"
  on public.assignment_submissions;
create policy "Students can read their own assignment submissions"
  on public.assignment_submissions
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Students can create their own assignment submissions"
  on public.assignment_submissions;
create policy "Students can create their own assignment submissions"
  on public.assignment_submissions
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Students can update their own assignment submissions"
  on public.assignment_submissions;
create policy "Students can update their own assignment submissions"
  on public.assignment_submissions
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('assignment-submissions', 'assignment-submissions', false, 52428800, null)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Students can upload their own assignment files"
  on storage.objects;
create policy "Students can upload their own assignment files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'assignment-submissions'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Students can read their own assignment files"
  on storage.objects;
create policy "Students can read their own assignment files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'assignment-submissions'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Students can delete their own assignment files"
  on storage.objects;
create policy "Students can delete their own assignment files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'assignment-submissions'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Grant an existing account course-manager access in the Supabase SQL editor:
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"teacher"}'::jsonb
-- where email = 'teacher@example.com';
-- Use "admin" or "administrator" as the role value for administrators.
