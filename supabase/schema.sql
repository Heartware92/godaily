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

-- RLS 정책: 로그인 미구현 단일 사용자 앱 — 익명/인증 모두 전체 접근 허용
-- (주의: anon key로 누구나 읽기/쓰기 가능. 비공개 보장 안 됨)
create policy "Public full access"
  on diaries for all to anon, authenticated
  using (true) with check (true);

-- updated_at 자동 갱신 트리거 (search_path 고정)
create or replace function update_updated_at()
returns trigger
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger diaries_updated_at
  before update on diaries
  for each row
  execute function update_updated_at();
