alter table diaries disable row level security;
alter table diaries alter column user_id drop not null;
alter table diaries alter column user_id set default null;
drop policy if exists "Users can view own diaries" on diaries;
drop policy if exists "Users can insert own diaries" on diaries;
drop policy if exists "Users can update own diaries" on diaries;
drop policy if exists "Users can delete own diaries" on diaries;
