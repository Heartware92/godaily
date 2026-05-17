-- Godaily DB Schema

-- 일기 테이블
create table diaries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  content text not null default '',
  reflections jsonb not null default '[]',
  blocks jsonb,
  mood text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 인덱스
create index diaries_user_id_idx on diaries(user_id);
create index diaries_created_at_idx on diaries(created_at desc);

-- RLS 활성화
alter table diaries enable row level security;

-- RLS 정책: 본인 데이터만 접근
create policy "Users can view own diaries"
  on diaries for select
  using (auth.uid() = user_id);

create policy "Users can insert own diaries"
  on diaries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own diaries"
  on diaries for update
  using (auth.uid() = user_id);

create policy "Users can delete own diaries"
  on diaries for delete
  using (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger diaries_updated_at
  before update on diaries
  for each row
  execute function update_updated_at();
